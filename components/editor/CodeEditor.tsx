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
            <div className="flex h-full w-full items-center justify-center bg-muted/50 rounded-xl">
                <p className="text-sm text-muted-foreground">Loading Editor...</p>
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

const CodeEditor: React.FC<CodeEditorProps> = ({
    value,
    language = "typescript",
    theme = "vs-dark",
    hideMinimap = false,
    wordWrap = "off",
    onChange,
    onEditorMount,
}) => {
    const handleChange = (val: string | undefined) => {
        if (onChange && val !== undefined) {
            onChange(val)
        }
    }

    return (
        <div className="h-full w-full overflow-hidden rounded-xl border border-muted-foreground/20">
            <MonacoEditor
                height="100%"
                language={language}
                value={value}
                theme={theme}
                onChange={handleChange}
                onMount={onEditorMount}
                options={{
                    automaticLayout: true,
                    minimap: { enabled: !hideMinimap },
                    wordWrap: wordWrap,
                    fontSize: 14,
                    scrollBeyondLastLine: false,
                    padding: { top: 16, bottom: 16 },
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
        </div>
    )
}

export default CodeEditor
export type { CodeEditorProps }
