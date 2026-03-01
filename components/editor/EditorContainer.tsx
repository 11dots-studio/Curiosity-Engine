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

import { PreviewPanel } from "@/components/editor/PreviewPanel"
import { ChatPanel } from "@/components/editor/ChatPanel"

export const EditorContainer = memo(function EditorContainer() {
    const { activeFile, files, editorRef, updateFileContent, splitViewMode, showMinimap, wordWrap, viewMode } = useEditor()
    const { theme, systemTheme } = useTheme()
    const secondaryEditorRef = useRef<any>(null)
    const secondaryActiveFile = files.find((f) => f.id !== activeFile?.id)

    // Monaco Theme handle
    const currentTheme = theme === "system" ? systemTheme : theme
    const monacoTheme = currentTheme === "dark" ? "vs-dark" : "vs-light"

    const renderContent = () => {
        if (viewMode === "chat") {
            return (
                <div className="flex-1 min-h-0 w-full h-full bg-[#fafafa] dark:bg-[#1c1c1e]">
                    <ChatPanel />
                </div>
            )
        }

        if (viewMode === "web") {
            return (
                <div className="flex-1 min-h-0 w-full h-full overflow-auto">
                    <PreviewPanel />
                </div>
            )
        }

        // Default: Code view
        if (!activeFile) {
            return (
                <div className="flex-1 min-h-0 flex items-center justify-center bg-[#fafafa] dark:bg-[#141414]">
                    <div className="flex flex-col items-center gap-4">
                        <p className="text-[13px] font-[450] text-[#86868b] dark:text-[#ebebf059]">
                            No file open. Create a new file to get started.
                        </p>
                    </div>
                </div>
            )
        }

        // Define editors only if activeFile exists to avoid lint errors
        const PrimaryEditor = (
            <CodeEditor
                key={`primary-${activeFile.id}`}
                value={activeFile.content}
                language={activeFile.language}
                theme={monacoTheme}
                hideMinimap={!showMinimap}
                wordWrap={wordWrap ? "on" : "off"}
                onChange={(val) => updateFileContent(activeFile.id, val)}
                onEditorMount={(editor) => {
                    editorRef.current = editor
                }}
            />
        )

        const SecondaryEditor = secondaryActiveFile ? (
            <CodeEditor
                key={`secondary-${secondaryActiveFile.id}`}
                value={secondaryActiveFile.content}
                language={secondaryActiveFile.language}
                theme={monacoTheme}
                hideMinimap={!showMinimap}
                wordWrap={wordWrap ? "on" : "off"}
                onChange={(val) => updateFileContent(secondaryActiveFile.id, val)}
                onEditorMount={(editor) => {
                    secondaryEditorRef.current = editor
                }}
            />
        ) : (
            <div className="flex h-full w-full items-center justify-center bg-transparent">
                <p className="text-[13px] font-[450] text-[#86868b] dark:text-[#ebebf059]">Open another file to view side-by-side.</p>
            </div>
        )

        return (
            <div className="flex-1 min-h-0 w-full h-full flex overflow-hidden">
                {splitViewMode === "single" ? (
                    PrimaryEditor
                ) : (
                    <ResizablePanelGroup
                        orientation={splitViewMode === "horizontal" ? "horizontal" : "vertical"}
                        className="h-full w-full min-h-0 flex-1"
                    >
                        <ResizablePanel defaultSize={50} minSize={20}>
                            <div className="flex h-full w-full min-h-0 flex-1">{PrimaryEditor}</div>
                        </ResizablePanel>

                        <ResizableHandle withHandle className="bg-black/[0.06] dark:bg-white/[0.06] hover:bg-[#0071e3]/40 dark:hover:bg-[#0a84ff]/40 transition-colors duration-150" />

                        <ResizablePanel defaultSize={50} minSize={20}>
                            <div className="flex h-full w-full min-h-0 flex-1">{SecondaryEditor}</div>
                        </ResizablePanel>
                    </ResizablePanelGroup>
                )}
            </div>
        )
    }

    return (
        <div className="flex flex-col h-full w-full overflow-hidden bg-background min-h-0">
            {viewMode === "code" && <FileTabs />}
            <div className="flex-1 min-h-0 flex flex-col bg-[#fafafa] dark:bg-[#141414]">
                {renderContent()}
            </div>
        </div>
    )
})

