"use client"

import type * as MonacoTypes from "monaco-editor"
import React, { createContext, useCallback, useContext, useRef, useState, useEffect, useMemo } from "react"
import { Workspace, WorkspaceState, RootFolder, FileNode, UIState } from "@/types/workspace"

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

const STORAGE_KEY = "editor.workspace.v1"
const CURRENT_VERSION = 1

const DEFAULT_WORKSPACE_ID = "default-workspace"

const DEFAULT_ROOT: RootFolder = {
    id: "root-1",
    name: "curiosity-engine",
    files: [
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
    ],
}

const INITIAL_STATE: WorkspaceState = {
    version: CURRENT_VERSION,
    activeWorkspaceId: DEFAULT_WORKSPACE_ID,
    workspaces: [
        {
            id: DEFAULT_WORKSPACE_ID,
            name: "Default Workspace",
            roots: [DEFAULT_ROOT],
            openFileIds: ["1", "2"],
            activeFileId: "1",
            uiState: {
                sidebarOpen: true,
                panelOpen: false,
                minimapEnabled: true,
                wordWrap: false,
            },
        },
    ],
}

interface EditorContextValue {
    workspace: Workspace
    files: FileModel[] // Flattened open files for tabs
    activeFileId: string | null
    activeFile: FileModel | undefined
    splitViewMode: SplitViewMode
    editorRef: React.RefObject<MonacoTypes.editor.IStandaloneCodeEditor | null>
    createFile: (name: string, language: SupportedLanguage, rootId?: string) => void
    updateFileContent: (id: string, content: string) => void
    updateFileLanguage: (id: string, language: SupportedLanguage) => void
    switchFile: (id: string) => void
    deleteFile: (id: string) => void
    closeFile: (id: string) => void
    showMinimap: boolean
    setShowMinimap: (show: boolean) => void
    wordWrap: boolean
    setWordWrap: (wrap: boolean) => void
    setSplitViewMode: (mode: SplitViewMode) => void
    addRoot: (name: string) => void
    removeRoot: (id: string) => void
}

const EditorContext = createContext<EditorContextValue | null>(null)

export function EditorProvider({ children }: { children: React.ReactNode }) {
    const [workspaceState, setWorkspaceState] = useState<WorkspaceState>(INITIAL_STATE)
    const [isLoaded, setIsLoaded] = useState(false)
    const [splitViewMode, setSplitViewModeState] = useState<SplitViewMode>("single")
    const editorRef = useRef<MonacoTypes.editor.IStandaloneCodeEditor | null>(null)

    // Persistence: Load on mount
    useEffect(() => {
        const saved = localStorage.getItem(STORAGE_KEY)
        if (saved) {
            try {
                const parsed = JSON.parse(saved) as WorkspaceState
                if (parsed.version === CURRENT_VERSION) {
                    setWorkspaceState(parsed)
                } else {
                    // Migration stub
                    setWorkspaceState(parsed)
                }
            } catch {
                // Ignore corrupted JSON
            }
        }
        setIsLoaded(true)
    }, [])

    // Persistence: Save on change (debounced)
    useEffect(() => {
        if (!isLoaded) return
        const timer = setTimeout(() => {
            localStorage.setItem(STORAGE_KEY, JSON.stringify(workspaceState))
        }, 500)
        return () => clearTimeout(timer)
    }, [workspaceState, isLoaded])

    const workspace = workspaceState.workspaces.find(w => w.id === workspaceState.activeWorkspaceId) || workspaceState.workspaces[0]

    // Derived state: flattened open files
    const files = useMemo(() => {
        const allFiles: FileModel[] = []
        workspace.roots.forEach(root => {
            const traverse = (nodes: FileNode[]) => {
                nodes.forEach(node => {
                    if (workspace.openFileIds.includes(node.id)) {
                        allFiles.push({
                            id: node.id,
                            name: node.name,
                            language: node.language,
                            content: node.content,
                            path: node.path
                        })
                    }
                    if (node.children) traverse(node.children)
                })
            }
            traverse(root.files)
        })
        // Sort to maintain tab order (optional, but good for stability)
        return workspace.openFileIds.map(id => allFiles.find(f => f.id === id)).filter((f): f is FileModel => !!f)
    }, [workspace])

    const activeFile = files.find((f) => f.id === workspace.activeFileId)

    const updateWorkspace = useCallback((updater: (prev: Workspace) => Workspace) => {
        setWorkspaceState(prev => ({
            ...prev,
            workspaces: prev.workspaces.map(w =>
                w.id === prev.activeWorkspaceId ? updater(w) : w
            )
        }))
    }, [])

    const createFile = useCallback(
        (name: string, language: SupportedLanguage, rootId?: string) => {
            const id = crypto.randomUUID()
            const ext = name.includes(".") ? "" : `.${language === "typescript" ? "ts" : language === "javascript" ? "js" : language === "python" ? "py" : language}`
            const fullName = name.includes(".") ? name : name + ext

            updateWorkspace(prev => {
                const targetRootId = rootId || prev.roots[0].id
                return {
                    ...prev,
                    roots: prev.roots.map(root => root.id === targetRootId ? {
                        ...root,
                        files: [...root.files, {
                            id,
                            name: fullName,
                            language,
                            path: `/${fullName}`,
                            content: "",
                        }]
                    } : root),
                    openFileIds: [...prev.openFileIds, id],
                    activeFileId: id
                }
            })
        },
        [updateWorkspace]
    )

    const updateFileContent = useCallback((id: string, content: string) => {
        updateWorkspace(prev => ({
            ...prev,
            roots: prev.roots.map(root => ({
                ...root,
                files: root.files.map(function update(node): FileNode {
                    if (node.id === id) return { ...node, content }
                    if (node.children) return { ...node, children: node.children.map(update) }
                    return node
                })
            }))
        }))
    }, [updateWorkspace])

    const updateFileLanguage = useCallback(
        (id: string, language: SupportedLanguage) => {
            updateWorkspace(prev => ({
                ...prev,
                roots: prev.roots.map(root => ({
                    ...root,
                    files: root.files.map(function update(node): FileNode {
                        if (node.id === id) return { ...node, language }
                        if (node.children) return { ...node, children: node.children.map(update) }
                        return node
                    })
                }))
            }))
        },
        [updateWorkspace]
    )

    const switchFile = useCallback((id: string) => {
        updateWorkspace(prev => ({ ...prev, activeFileId: id }))
    }, [updateWorkspace])

    const deleteFile = useCallback(
        (id: string) => {
            updateWorkspace(prev => {
                const newOpenFileIds = prev.openFileIds.filter(fid => fid !== id)
                let newActiveFileId = prev.activeFileId
                if (newActiveFileId === id) {
                    newActiveFileId = newOpenFileIds.length > 0 ? newOpenFileIds[0] : null
                }
                return {
                    ...prev,
                    roots: prev.roots.map(root => ({
                        ...root,
                        files: root.files.filter(f => f.id !== id) // Simplified, assuming flat for now or need recursive filter
                    })),
                    openFileIds: newOpenFileIds,
                    activeFileId: newActiveFileId
                }
            })
        },
        [updateWorkspace]
    )

    const closeFile = useCallback((id: string) => {
        updateWorkspace(prev => {
            const newOpenFileIds = prev.openFileIds.filter(fid => fid !== id)
            let newActiveFileId = prev.activeFileId
            if (newActiveFileId === id) {
                newActiveFileId = newOpenFileIds.length > 0 ? newOpenFileIds[0] : null
            }
            return {
                ...prev,
                openFileIds: newOpenFileIds,
                activeFileId: newActiveFileId
            }
        })
    }, [updateWorkspace])

    const setSplitViewMode = useCallback((mode: SplitViewMode) => {
        setSplitViewModeState(mode)
    }, [])

    const setShowMinimap = useCallback((enabled: boolean) => {
        updateWorkspace(prev => ({
            ...prev,
            uiState: { ...prev.uiState, minimapEnabled: enabled }
        }))
    }, [updateWorkspace])

    const setWordWrap = useCallback((enabled: boolean) => {
        updateWorkspace(prev => ({
            ...prev,
            uiState: { ...prev.uiState, wordWrap: enabled }
        }))
    }, [updateWorkspace])

    const addRoot = useCallback((name: string) => {
        updateWorkspace(prev => ({
            ...prev,
            roots: [...prev.roots, {
                id: crypto.randomUUID(),
                name,
                files: []
            }]
        }))
    }, [updateWorkspace])

    const removeRoot = useCallback((id: string) => {
        updateWorkspace(prev => ({
            ...prev,
            roots: prev.roots.filter(r => r.id !== id)
        }))
    }, [updateWorkspace])

    if (!isLoaded) return null // Prevent hydration mismatch

    return (
        <EditorContext.Provider
            value={{
                workspace,
                files,
                activeFileId: workspace.activeFileId,
                splitViewMode,
                activeFile,
                editorRef,
                createFile,
                updateFileContent,
                updateFileLanguage,
                switchFile,
                deleteFile,
                closeFile,
                setSplitViewMode,
                showMinimap: workspace.uiState.minimapEnabled,
                setShowMinimap,
                wordWrap: workspace.uiState.wordWrap,
                setWordWrap,
                addRoot,
                removeRoot
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
