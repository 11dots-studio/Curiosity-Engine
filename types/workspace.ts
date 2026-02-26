export interface UIState {
    sidebarOpen: boolean
    panelOpen: boolean
    minimapEnabled: boolean
    wordWrap: boolean
}

export interface FileNode {
    id: string
    name: string
    path: string
    language: string
    content: string
    children?: FileNode[]
}

export interface RootFolder {
    id: string
    name: string
    files: FileNode[]
}

export interface Workspace {
    id: string
    name: string
    roots: RootFolder[]
    openFileIds: string[]
    activeFileId: string | null
    uiState: UIState
}

export interface WorkspaceState {
    version: number
    activeWorkspaceId: string
    workspaces: Workspace[]
}
