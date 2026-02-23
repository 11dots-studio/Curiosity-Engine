"use client"

import React, { useRef, useEffect, memo } from "react"
import { useEditor } from "@/context/EditorContext"
import CodeEditor from "@/components/editor/CodeEditor"
import { FileTabs } from "@/components/editor/FileTabs"
import { useTheme } from "next-themes"
import {
    ResizableHandle,
    ResizablePanel,
    ResizablePanelGroup,
} from "@/components/ui/resizable"

export const EditorContainer = memo(function EditorContainer() {
    const { activeFile, files, editorRef, updateFileContent, splitViewMode, showMinimap, wordWrap } = useEditor()
    const { theme, systemTheme } = useTheme()
    const secondaryEditorRef = useRef<any>(null)
    const secondaryActiveFile = files.find((f) => f.id !== activeFile?.id)

    // Determine Monaco Theme based on next-themes
    const currentTheme = theme === "system" ? systemTheme : theme
    const monacoTheme = currentTheme === "dark" ? "vs-dark" : "vs-light"

    // If there's no active file, render empty state
    if (!activeFile) {
        return (
            <div className="flex flex-col h-full w-full overflow-hidden bg-background">
                <FileTabs />
                <div className="flex-1 min-h-0 flex items-center justify-center bg-zinc-50/50 dark:bg-zinc-950/50">
                    <p className="text-sm text-muted-foreground">
                        No file open. Create a new file to get started.
                    </p>
                </div>
            </div>
        )
    }

    // The primary editor instance (used globally via context ref)
    const PrimaryEditor = (
        <CodeEditor
            key={`primary-${activeFile.id}`}
            value={activeFile.content}
            language={activeFile.language}
            theme={monacoTheme}
            hideMinimap={!showMinimap}
            wordWrap={wordWrap}
            onChange={(val) => updateFileContent(activeFile.id, val)}
            onEditorMount={(editor) => {
                editorRef.current = editor
            }}
        />
    )

    // Secondary editor for Split views. Uses secondary file if available.
    const SecondaryEditor = secondaryActiveFile ? (
        <CodeEditor
            key={`secondary-${secondaryActiveFile.id}`}
            value={secondaryActiveFile.content}
            language={secondaryActiveFile.language}
            theme={monacoTheme}
            hideMinimap={!showMinimap}
            wordWrap={wordWrap}
            onChange={(val) => updateFileContent(secondaryActiveFile.id, val)}
            onEditorMount={(editor) => {
                secondaryEditorRef.current = editor
            }}
        />
    ) : (
        <div className="flex h-full w-full items-center justify-center bg-muted/20">
            <p className="text-sm text-muted-foreground">Open another file to view side-by-side.</p>
        </div>
    )

    return (
        <div className="flex flex-col h-full w-full overflow-hidden bg-background min-h-0">
            <FileTabs />
            <div className="flex-1 min-h-0 flex flex-col bg-zinc-50/50 dark:bg-zinc-950/50">
                {splitViewMode === "single" ? (
                    <div className="flex-1 min-h-0 w-full flex">
                        {PrimaryEditor}
                    </div>
                ) : (
                    <ResizablePanelGroup
                        orientation={splitViewMode === "horizontal" ? "horizontal" : "vertical"}
                        className="h-full w-full min-h-0 flex-1"
                    >
                        <ResizablePanel defaultSize={50} minSize={20}>
                            <div className="flex h-full w-full min-h-0 flex-1">{PrimaryEditor}</div>
                        </ResizablePanel>

                        <ResizableHandle withHandle className="bg-muted-foreground/20" />

                        <ResizablePanel defaultSize={50} minSize={20}>
                            <div className="flex h-full w-full min-h-0 flex-1">{SecondaryEditor}</div>
                        </ResizablePanel>
                    </ResizablePanelGroup>
                )}
            </div>
        </div>
    )
})
