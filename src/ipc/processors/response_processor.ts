import { db } from "../../db";
import { chats } from "../../db/schema";
import { eq } from "drizzle-orm";
import fs from "node:fs";
import { getCuriosityEngineAppPath } from "../../paths/paths";
import path from "node:path";
import git from "isomorphic-git";

export function getCuriosityEngineWriteTags(fullResponse: string): {
  path: string;
  content: string;
}[] {
  const curiosityEngineWriteRegex =
    /<curiosity-engine-write path="([^"]+)"[^>]*>([\s\S]*?)<\/curiosity-engine-write>/g;
  let match;
  const tags: { path: string; content: string }[] = [];
  while ((match = curiosityEngineWriteRegex.exec(fullResponse)) !== null) {
    tags.push({ path: match[1], content: match[2] });
  }
  return tags;
}

export function getCuriosityEngineRenameTags(fullResponse: string): {
  from: string;
  to: string;
}[] {
  const curiosityEngineRenameRegex =
    /<curiosity-engine-rename from="([^"]+)" to="([^"]+)"[^>]*>([\s\S]*?)<\/curiosity-engine-rename>/g;
  let match;
  const tags: { from: string; to: string }[] = [];
  while ((match = curiosityEngineRenameRegex.exec(fullResponse)) !== null) {
    tags.push({ from: match[1], to: match[2] });
  }
  return tags;
}

export function getCuriosityEngineDeleteTags(fullResponse: string): string[] {
  const curiosityEngineDeleteRegex =
    /<curiosity-engine-delete path="([^"]+)"[^>]*>([\s\S]*?)<\/curiosity-engine-delete>/g;
  let match;
  const paths: string[] = [];
  while ((match = curiosityEngineDeleteRegex.exec(fullResponse)) !== null) {
    paths.push(match[1]);
  }
  return paths;
}

export function getCuriosityEngineAddDependencyTags(fullResponse: string): string[] {
  const curiosityEngineAddDependencyRegex =
    /<curiosity-engine-add-dependency package="([^"]+)">[^<]*<\/curiosity-engine-add-dependency>/g;
  let match;
  const packages: string[] = [];
  while ((match = curiosityEngineAddDependencyRegex.exec(fullResponse)) !== null) {
    packages.push(match[1]);
  }
  return packages;
}

export async function processFullResponseActions(
  fullResponse: string,
  chatId: number,
  { chatSummary }: { chatSummary: string | undefined }
): Promise<{ updatedFiles?: boolean; error?: string }> {
  // Get the app associated with the chat
  const chatWithApp = await db.query.chats.findFirst({
    where: eq(chats.id, chatId),
    with: {
      app: true,
    },
  });
  if (!chatWithApp || !chatWithApp.app) {
    console.error(`No app found for chat ID: ${chatId}`);
    return {};
  }

  const appPath = getCuriosityEngineAppPath(chatWithApp.app.path);
  const writtenFiles: string[] = [];
  const renamedFiles: string[] = [];
  const deletedFiles: string[] = [];

  try {
    // Extract all tags
    const curiosityEngineWriteTags = getCuriosityEngineWriteTags(fullResponse);
    const curiosityEngineRenameTags = getCuriosityEngineRenameTags(fullResponse);
    const curiosityEngineDeletePaths = getCuriosityEngineDeleteTags(fullResponse);
    const curiosityEngineAddDependencyPackages = getCuriosityEngineAddDependencyTags(fullResponse);

    // If no tags to process, return early
    if (
      curiosityEngineWriteTags.length === 0 &&
      curiosityEngineRenameTags.length === 0 &&
      curiosityEngineDeletePaths.length === 0 &&
      curiosityEngineAddDependencyPackages.length === 0
    ) {
      return {};
    }

    // Process all file writes
    for (const tag of curiosityEngineWriteTags) {
      const filePath = tag.path;
      const content = tag.content;
      const fullFilePath = path.join(appPath, filePath);

      // Ensure directory exists
      const dirPath = path.dirname(fullFilePath);
      fs.mkdirSync(dirPath, { recursive: true });

      // Write file content
      fs.writeFileSync(fullFilePath, content);
      console.log(`Successfully wrote file: ${fullFilePath}`);
      writtenFiles.push(filePath);
    }

    // Process all file renames
    for (const tag of curiosityEngineRenameTags) {
      const fromPath = path.join(appPath, tag.from);
      const toPath = path.join(appPath, tag.to);

      // Ensure target directory exists
      const dirPath = path.dirname(toPath);
      fs.mkdirSync(dirPath, { recursive: true });

      // Rename the file
      if (fs.existsSync(fromPath)) {
        fs.renameSync(fromPath, toPath);
        console.log(`Successfully renamed file: ${fromPath} -> ${toPath}`);
        renamedFiles.push(tag.to);

        // Add the new file and remove the old one from git
        await git.add({
          fs,
          dir: appPath,
          filepath: tag.to,
        });
        try {
          await git.remove({
            fs,
            dir: appPath,
            filepath: tag.from,
          });
        } catch (error) {
          console.warn(`Failed to git remove old file ${tag.from}:`, error);
          // Continue even if remove fails as the file was still renamed
        }
      } else {
        console.warn(`Source file for rename does not exist: ${fromPath}`);
      }
    }

    // Process all file deletions
    for (const filePath of curiosityEngineDeletePaths) {
      const fullFilePath = path.join(appPath, filePath);

      // Delete the file if it exists
      if (fs.existsSync(fullFilePath)) {
        fs.unlinkSync(fullFilePath);
        console.log(`Successfully deleted file: ${fullFilePath}`);
        deletedFiles.push(filePath);

        // Remove the file from git
        try {
          await git.remove({
            fs,
            dir: appPath,
            filepath: filePath,
          });
        } catch (error) {
          console.warn(`Failed to git remove deleted file ${filePath}:`, error);
          // Continue even if remove fails as the file was still deleted
        }
      } else {
        console.warn(`File to delete does not exist: ${fullFilePath}`);
      }
    }

    // If we have any file changes, commit them all at once
    const hasChanges =
      writtenFiles.length > 0 ||
      renamedFiles.length > 0 ||
      deletedFiles.length > 0;
    if (hasChanges) {
      // Stage all written files
      for (const file of writtenFiles) {
        await git.add({
          fs,
          dir: appPath,
          filepath: file,
        });
      }

      // Create commit with details of all changes
      const changes = [];
      if (writtenFiles.length > 0)
        changes.push(`wrote ${writtenFiles.length} file(s)`);
      if (renamedFiles.length > 0)
        changes.push(`renamed ${renamedFiles.length} file(s)`);
      if (deletedFiles.length > 0)
        changes.push(`deleted ${deletedFiles.length} file(s)`);

      await git.commit({
        fs,
        dir: appPath,
        message: chatSummary
          ? `[curiosity-engine] ${chatSummary} - ${changes.join(", ")}`
          : `[curiosity-engine] ${changes.join(", ")}`,
        author: {
          name: "Curiosity Engine AI",
          email: "curiosity-engine-ai@example.com",
        },
      });
      console.log(`Successfully committed changes: ${changes.join(", ")}`);
      return { updatedFiles: true };
    }

    return {};
  } catch (error: unknown) {
    console.error("Error processing files:", error);
    return { error: (error as any).toString() };
  }
}
