"use client"

import type * as MonacoTypes from "monaco-editor"

import React, { createContext, useCallback, useContext, useRef, useState } from "react"

export interface FileModel {
    id: string
    name: string
    language: string
    content: string
    path: string
}

export type SplitViewMode = "single" | "horizontal" | "vertical"

const SUPPORTED_LANGUAGES = [
    "typescript",
    "javascript",
    "json",
    "python",
    "html",
    "css",
] as const

export type SupportedLanguage = (typeof SUPPORTED_LANGUAGES)[number]

export type EditorTheme = "vs-dark" | "light" | "vs" | "hc-black" | string

export { SUPPORTED_LANGUAGES }

const DEFAULT_FILES: FileModel[] = [
    {
        id: "1",
        name: "main.ts",
        language: "typescript",
        path: "/main.ts",
        content: `// Welcome to Curiosity Engine\n// Start building your application\n\ninterface App {\n  name: string\n  version: string\n}\n\nconst app: App = {\n  name: "Curiosity Engine",\n  version: "1.0.0",\n}\n\nconsole.log(app)\n`,
    },
    {
        id: "2",
        name: "styles.css",
        language: "css",
        path: "/styles.css",
        content: `/* Global styles */\n\nbody {\n  margin: 0;\n  font-family: sans-serif;\n}\n`,
    },
]

interface EditorContextValue {
    files: FileModel[]
    activeFileId: string
    activeFile: FileModel | undefined
    splitViewMode: SplitViewMode
    editorRef: React.RefObject<MonacoTypes.editor.IStandaloneCodeEditor | null>
    createFile: (name: string, language: SupportedLanguage) => void
    updateFileContent: (id: string, content: string) => void
    updateFileLanguage: (id: string, language: SupportedLanguage) => void
    switchFile: (id: string) => void
    deleteFile: (id: string) => void
    showMinimap: boolean
    setShowMinimap: (show: boolean) => void
    wordWrap: "on" | "off"
    setWordWrap: (wrap: "on" | "off") => void
    setSplitViewMode: (mode: SplitViewMode) => void
}

const EditorContext = createContext<EditorContextValue | null>(null)

export function EditorProvider({ children }: { children: React.ReactNode }) {
    const [files, setFiles] = useState<FileModel[]>(DEFAULT_FILES)
    const [activeFileId, setActiveFileId] = useState<string>(DEFAULT_FILES[0].id)
    const [splitViewMode, setSplitViewModeState] = useState<SplitViewMode>("single")
    const [showMinimap, setShowMinimap] = useState(true)
    const [wordWrap, setWordWrap] = useState<"on" | "off">("off")
    const editorRef = useRef<MonacoTypes.editor.IStandaloneCodeEditor | null>(null)

    const activeFile = files.find((f) => f.id === activeFileId)

    const createFile = useCallback(
        (name: string, language: SupportedLanguage) => {
            const id = crypto.randomUUID()
            const ext = name.includes(".") ? "" : `.${language === "typescript" ? "ts" : language === "javascript" ? "js" : language === "python" ? "py" : language}`
            const fullName = name.includes(".") ? name : name + ext
            const newFile: FileModel = {
                id,
                name: fullName,
                language,
                path: `/${fullName}`,
                content: "",
            }
            setFiles((prev) => [...prev, newFile])
            setActiveFileId(id)
        },
        []
    )

    const updateFileContent = useCallback((id: string, content: string) => {
        setFiles((prev) =>
            prev.map((f) => (f.id === id ? { ...f, content } : f))
        )
    }, [])

    const updateFileLanguage = useCallback(
        (id: string, language: SupportedLanguage) => {
            setFiles((prev) =>
                prev.map((f) => (f.id === id ? { ...f, language } : f))
            )
        },
        []
    )

    const switchFile = useCallback((id: string) => {
        setActiveFileId(id)
    }, [])

    const deleteFile = useCallback(
        (id: string) => {
            setFiles((prev) => {
                const remaining = prev.filter((f) => f.id !== id)
                if (activeFileId === id && remaining.length > 0) {
                    setActiveFileId(remaining[0].id)
                }
                return remaining
            })
        },
        [activeFileId]
    )

    const setSplitViewMode = useCallback((mode: SplitViewMode) => {
        setSplitViewModeState(mode)
    }, [])

    return (
        <EditorContext.Provider
            value={{
                files,
                activeFileId,
                splitViewMode,
                activeFile,
                editorRef,
                createFile,
                updateFileContent,
                updateFileLanguage,
                switchFile,
                deleteFile,
                setSplitViewMode,
                showMinimap,
                setShowMinimap,
                wordWrap,
                setWordWrap,
            }}
        >
            {children}
        </EditorContext.Provider>
    )
}

export function useEditor(): EditorContextValue {
    const ctx = useContext(EditorContext)
    if (!ctx) {
        throw new Error("useEditor must be used inside EditorProvider")
    }
    return ctx
}
