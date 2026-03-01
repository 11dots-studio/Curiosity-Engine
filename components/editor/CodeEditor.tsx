"use client"

import React, { useRef } from "react"
import dynamic from "next/dynamic"
import type { EditorTheme, SupportedLanguage } from "@/context/EditorContext"
import type * as MonacoTypes from "monaco-editor"

const MonacoEditor = dynamic(
    () => import("@monaco-editor/react").then((m) => m.default),
    {
        ssr: false,
        loading: () => (
            <div className="flex h-full w-full items-center justify-center bg-[#fafafa] dark:bg-[#141414] rounded-none">
                <p className="text-[13px] font-[450] text-[#86868b] tracking-tight">Loading Editor...</p>
            </div>
        ),
    }
)

interface CodeEditorProps {
    value: string
    language?: SupportedLanguage | string
    theme?: EditorTheme
    hideMinimap?: boolean
    wordWrap?: "on" | "off"
    onChange?: (value: string) => void
    onEditorMount?: (editor: MonacoTypes.editor.IStandaloneCodeEditor) => void
}

import { useState, useCallback, useMemo } from "react"
import { InlineEdit } from "./InlineEdit"

const CodeEditor: React.FC<CodeEditorProps> = ({
    value,
    language = "typescript",
    theme = "vs-dark",
    hideMinimap = false,
    wordWrap = "off",
    onChange,
    onEditorMount,
}) => {
    const editorRef = useRef<MonacoTypes.editor.IStandaloneCodeEditor | null>(null)
    const [inlineEditState, setInlineEditState] = useState<{
        isOpen: boolean
        selection: { startLine: number; endLine: number } | null
        position: { top: number; left: number }
    }>({
        isOpen: false,
        selection: null,
        position: { top: 0, left: 0 }
    })

    const handleEditorMount = (editor: MonacoTypes.editor.IStandaloneCodeEditor, monaco: any) => {
        editorRef.current = editor
        if (onEditorMount) onEditorMount(editor)

        // Add Cmd+K / Ctrl+K shortcut for AI Inline Edit
        editor.addCommand(monaco.KeyMod.CtrlCmd | monaco.KeyCode.KeyK, () => {
            const selection = editor.getSelection()
            if (selection) {
                const position = editor.getScrolledVisiblePosition(selection.getEndPosition())
                if (position) {
                    setInlineEditState({
                        isOpen: true,
                        selection: {
                            startLine: selection.startLineNumber,
                            endLine: selection.endLineNumber
                        },
                        position: { top: position.top + 20, left: position.left }
                    })
                }
            }
        })
    }

    const handleApplyInlineEdit = (content: string) => {
        if (editorRef.current && inlineEditState.selection) {
            const { startLine, endLine } = inlineEditState.selection
            const range = {
                startLineNumber: startLine,
                startColumn: 1,
                endLineNumber: endLine,
                endColumn: editorRef.current.getModel()?.getLineMaxColumn(endLine) || 1
            }

            editorRef.current.executeEdits("ai-refactor", [
                {
                    range: range,
                    text: content,
                    forceMoveMarkers: true
                }
            ])
            setInlineEditState(prev => ({ ...prev, isOpen: false }))
        }
    }

    const handleChange = (val: string | undefined) => {
        if (onChange && val !== undefined) {
            onChange(val)
        }
    }

    return (
        <div className="h-full w-full overflow-hidden border-l border-black/[0.06] dark:border-white/[0.06] relative">
            <MonacoEditor
                height="100%"
                language={language}
                value={value}
                theme={theme}
                onChange={handleChange}
                onMount={handleEditorMount}
                options={{
                    automaticLayout: true,
                    minimap: { enabled: !hideMinimap },
                    wordWrap: wordWrap,
                    fontSize: 14,
                    lineHeight: 22,
                    fontFamily: '"SF Mono", "JetBrains Mono", ui-monospace, monospace',
                    scrollBeyondLastLine: false,
                    padding: { top: 20, bottom: 20 },
                    renderWhitespace: "selection",
                    formatOnType: true,
                    formatOnPaste: true,
                    quickSuggestions: true,
                    parameterHints: { enabled: true },
                    hover: { enabled: true },
                    suggestOnTriggerCharacters: true,
                    wordBasedSuggestions: "currentDocument",
                    tabCompletion: "on",
                    renderLineHighlight: "all",
                    smoothScrolling: true,
                    cursorBlinking: "smooth",
                    cursorSmoothCaretAnimation: "on",
                    fontLigatures: true,
                    bracketPairColorization: { enabled: true },
                    guides: { bracketPairs: true },
                }}
            />
            {inlineEditState.isOpen && (
                <div
                    className="absolute z-50 transition-all duration-200"
                    style={{ top: inlineEditState.position.top, left: inlineEditState.position.left }}
                >
                    <InlineEdit
                        selection={inlineEditState.selection}
                        fileContext={value}
                        onApply={handleApplyInlineEdit}
                        onCancel={() => setInlineEditState(prev => ({ ...prev, isOpen: false }))}
                    />
                </div>
            )}
        </div>
    )
}


export default CodeEditor
export type { CodeEditorProps }
