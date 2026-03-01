"use client"

import React, { useMemo } from "react"
import {
    SandpackProvider,
    SandpackLayout,
    SandpackPreview,
    SandpackFileExplorer,
    SandpackCodeEditor,
    SandpackThemeProvider
} from "@codesandbox/sandpack-react"
import { useEditor } from "@/context/EditorContext"
import { useTheme } from "next-themes"

export const PreviewPanel = () => {
    const { workspace, files } = useEditor()
    const { theme, systemTheme } = useTheme()
    const currentTheme = theme === "system" ? systemTheme : theme

    const sandpackFiles = useMemo(() => {
        const fileMap: Record<string, string> = {}

        // Convert our VFS to Sandpack format
        // Sandpack expects files to be relative paths starting with /
        files.forEach(file => {
            // Remove leading slash if present, sandpack handles both but consistent is better
            const path = file.path.startsWith("/") ? file.path : `/${file.path}`
            fileMap[path] = file.content
        })

        // Add default entry point if not exists
        if (!fileMap["/index.js"] && !fileMap["/App.js"] && !fileMap["/App.tsx"] && !fileMap["/page.tsx"]) {
            // Simple fallback
        }

        return fileMap
    }, [files])

    return (
        <div className="h-full w-full flex flex-col overflow-hidden bg-background border-l border-black/[0.06] dark:border-white/[0.06]">
            <div className="h-9 flex items-center px-4 border-b border-black/[0.06] dark:border-white/[0.06] bg-white dark:bg-[#1c1c1e]">
                <span className="text-[12px] font-medium text-[#6e6e73] dark:text-zinc-400">Live Preview</span>
            </div>
            <div className="flex-1 min-h-0 relative">
                <SandpackProvider
                    template="react-ts"
                    theme={currentTheme === "dark" ? "dark" : "light"}
                    files={sandpackFiles}
                    options={{
                        externalResources: ["https://cdn.tailwindcss.com"],
                    }}
                >
                    <SandpackLayout style={{ height: "100%", border: "none", borderRadius: 0 }}>
                        <SandpackPreview
                            showNavigator={true}
                            showOpenInCodeSandbox={false}
                            style={{ height: "100%" }}
                        />
                    </SandpackLayout>
                </SandpackProvider>
            </div>
        </div>
    )
}
