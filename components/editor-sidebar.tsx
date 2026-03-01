"use client"

import * as React from "react"
import { ChevronRight, File, Folder, FilePlus, Trash2 } from "lucide-react"
import { FileIcon } from "@/components/editor/FileIcon"

import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible"
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupAction,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuAction,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarMenuSub,
  SidebarRail,
} from "@/components/ui/sidebar"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { ChatPanel } from "@/components/editor/ChatPanel"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip"
import {
  useEditor,
  SUPPORTED_LANGUAGES,
  type SupportedLanguage,
  type FileModel,
} from "@/context/EditorContext"
import { type FileNode } from "@/types/workspace"

const LANGUAGE_DISPLAY_NAMES: Record<SupportedLanguage, string> = {
  typescript: "TypeScript",
  javascript: "JavaScript",
  json: "JSON",
  python: "Python",
  html: "HTML",
  css: "CSS",
}

// ─── Virtualized Tree Types ──────────────────────────────────────────────
interface VirtualNode {
  id: string
  name: string
  depth: number
  type: "file" | "folder"
  path: string
  language?: string
  children?: FileNode[]
}

// ─── Helper: Flattening the tree ──────────────────────────────────────────
function flattenTree(
  nodes: FileNode[],
  expandedFolders: Record<string, boolean>,
  depth = 0
): VirtualNode[] {
  let result: VirtualNode[] = []
  nodes.forEach((node) => {
    const isFolder = !!node.children
    result.push({
      id: node.id,
      name: node.name,
      depth,
      type: isFolder ? "folder" : "file",
      path: node.path,
      language: node.language,
      children: node.children
    })

    if (isFolder && expandedFolders[node.id]) {
      result = result.concat(flattenTree(node.children!, expandedFolders, depth + 1))
    }
  })
  return result
}


// ─── File item in the open-files section ───────────────────────────────────
function FileItem({ file }: { file: FileModel }) {
  const { activeFileId, switchFile, deleteFile, files } = useEditor()

  return (
    <SidebarMenuItem>
      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger asChild>
            <SidebarMenuButton
              isActive={file.id === activeFileId}
              onClick={() => switchFile(file.id)}
              className={[
                "h-9 px-2 gap-2 text-[13px] font-[450] transition-all duration-150 ease-out group/file",
                "data-[active=true]:bg-[#0071e3]/10 dark:data-[active=true]:bg-[#0a84ff]/15",
                "data-[active=true]:text-[#0071e3] dark:data-[active=true]:text-[#0a84ff]",
                "hover:bg-black/[0.04] dark:hover:bg-white/[0.05]"
              ].join(" ")}
            >
              <FileIcon
                language={file.language}
                className="size-3.5 opacity-60 group-data-[active=true]/file:opacity-100"
              />
              <span className="flex-1 truncate">{file.name}</span>
            </SidebarMenuButton>
          </TooltipTrigger>
          <TooltipContent side="right" className="text-[11px] font-[450]">
            {file.path} · {LANGUAGE_DISPLAY_NAMES[file.language as SupportedLanguage] ?? file.language}
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>
      {files.length > 1 && (
        <SidebarMenuAction
          showOnHover
          onClick={(e) => {
            e.stopPropagation()
            deleteFile(file.id)
          }}
          aria-label={`Delete ${file.name}`}
          className="hover:bg-black/[0.06] dark:hover:bg-white/[0.10] hover:text-hig-danger transition-colors duration-150 rounded-md top-2 right-1.5 h-5 w-5 p-0"
        >
          <Trash2 className="size-3" />
        </SidebarMenuAction>
      )}
    </SidebarMenuItem>
  )
}

// ─── New-file dialog ────────────────────────────────────────────────────────
function NewFileDialog({
  open,
  onOpenChange,
}: {
  open: boolean
  onOpenChange: (v: boolean) => void
}) {
  const { createFile } = useEditor()
  const [name, setName] = React.useState("")

  const handleCreate = () => {
    if (!name.trim()) return
    createFile(name.trim())
    setName("")
    onOpenChange(false)
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-sm">
        <DialogHeader>
          <DialogTitle>New File</DialogTitle>
        </DialogHeader>
        <div className="flex flex-col gap-3">
          <Input
            placeholder="filename (e.g. utils.ts)"
            value={name}
            onChange={(e) => setName(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleCreate()}
            autoFocus
          />
        </div>
        <DialogFooter showCloseButton>
          <Button size="sm" onClick={handleCreate} disabled={!name.trim()}>
            Create
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

// ─── Main sidebar export ────────────────────────────────────────────────────
export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
  const { workspace, files, activeFileId, switchFile, createFile } = useEditor()
  const [dialogOpen, setDialogOpen] = React.useState(false)
  const [activeTab, setActiveTab] = React.useState("files")

  // Virtualization state
  const scrollContainerRef = React.useRef<HTMLDivElement>(null)
  const [scrollTop, setScrollTop] = React.useState(0)
  const [expandedFolders, setExpandedFolders] = React.useState<Record<string, boolean>>({
    "root-1": true // Expand first root by default
  })

  const ROW_HEIGHT = 32
  const BUFFER = 5

  // Flatten all roots into a single list
  const flattenedNodes = React.useMemo(() => {
    let all: VirtualNode[] = []
    workspace.roots.forEach(root => {
      // Root itself as a node
      all.push({
        id: root.id,
        name: root.name,
        depth: 0,
        type: "folder",
        path: `/${root.name}`
      })
      if (expandedFolders[root.id]) {
        all = all.concat(flattenTree(root.files, expandedFolders, 1))
      }
    })
    return all
  }, [workspace.roots, expandedFolders])

  const totalHeight = flattenedNodes.length * ROW_HEIGHT
  const containerHeight = 600 // Fallback, will be dynamic or use height from ref

  const visibleStartIndex = Math.max(0, Math.floor(scrollTop / ROW_HEIGHT) - BUFFER)
  const visibleEndIndex = Math.min(
    flattenedNodes.length,
    Math.ceil((scrollTop + containerHeight) / ROW_HEIGHT) + BUFFER
  )

  const visibleNodes = flattenedNodes.slice(visibleStartIndex, visibleEndIndex)

  const handleScroll = (e: React.UIEvent<HTMLDivElement>) => {
    setScrollTop(e.currentTarget.scrollTop)
  }

  const toggleFolder = (id: string) => {
    setExpandedFolders(prev => ({ ...prev, [id]: !prev[id] }))
  }

  const handleNodeClick = (node: VirtualNode) => {
    if (node.type === "folder") {
      toggleFolder(node.id)
    } else {
      switchFile(node.id)
    }
  }

  return (
    <>
      <Sidebar {...props}>
        <SidebarContent className="flex-1 overflow-hidden h-full">
          <div className="flex-1 overflow-y-auto m-0 p-0 flex flex-col h-full">
            {/* Open Files — driven by EditorContext */}
            <SidebarGroup className="px-2 shrink-0">
              <SidebarGroupLabel className="text-[10px] uppercase font-semibold tracking-[0.1em] text-[#86868b] dark:text-[rgba(235,235,240,0.35)] py-2 px-2">Open Files</SidebarGroupLabel>
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <SidebarGroupAction
                      onClick={() => setDialogOpen(true)}
                      aria-label="New file"
                      className="hover:bg-black/[0.06] dark:hover:bg-white/[0.10] rounded-md transition-colors size-5 top-2 right-3"
                    >
                      <FilePlus className="size-3.5" />
                    </SidebarGroupAction>
                  </TooltipTrigger>
                  <TooltipContent side="right">New File</TooltipContent>
                </Tooltip>
              </TooltipProvider>
              <SidebarGroupContent>
                <SidebarMenu>
                  {files.map((file) => (
                    <FileItem key={file.id} file={file} />
                  ))}
                </SidebarMenu>
              </SidebarGroupContent>
            </SidebarGroup>

            {/* Virtualized Files Explorer */}
            <SidebarGroup className="px-2 flex-1 min-h-0">
              <SidebarGroupLabel className="text-[10px] uppercase font-semibold tracking-[0.1em] text-[#86868b] dark:text-[rgba(235,235,240,0.35)] py-2 px-2">Explorer</SidebarGroupLabel>
              <SidebarGroupContent
                ref={scrollContainerRef}
                onScroll={handleScroll}
                className="relative overflow-y-auto overflow-x-hidden h-full"
              >
                <div style={{ height: totalHeight, width: '100%' }}>
                  {visibleNodes.map((node, index) => {
                    const realIndex = visibleStartIndex + index
                    const isActive = node.id === activeFileId
                    return (
                      <div
                        key={node.id}
                        onClick={() => handleNodeClick(node)}
                        className={[
                          "absolute left-0 right-0 flex items-center gap-1.5 px-2 cursor-default group transition-all duration-150 ease-out",
                          "text-[13px] font-[450] hover:bg-black/[0.04] dark:hover:bg-white/[0.05]",
                          isActive ? "bg-[#0071e3]/10 text-[#0071e3] dark:bg-[#0a84ff]/15 dark:text-[#0a84ff]" : "text-[#1d1d1f] dark:text-[#f5f5f7]"
                        ].join(" ")}
                        style={{
                          top: realIndex * ROW_HEIGHT,
                          height: ROW_HEIGHT,
                          paddingLeft: (node.depth * 12) + 8
                        }}
                      >
                        {node.type === "folder" ? (
                          <>
                            <ChevronRight className={["size-3.5 transition-transform opacity-50", expandedFolders[node.id] ? "rotate-90" : ""].join(" ")} />
                            <Folder className="size-3.5 opacity-60" />
                          </>
                        ) : (
                          <FileIcon language={node.language} className={["size-3.5 opacity-60 ml-5", isActive ? "opacity-100" : ""].join(" ")} />
                        )}
                        <span className="flex-1 truncate">{node.name}</span>
                      </div>
                    )
                  })}
                </div>
              </SidebarGroupContent>
            </SidebarGroup>
          </div>
        </SidebarContent>
        <SidebarRail />
      </Sidebar>

      <NewFileDialog open={dialogOpen} onOpenChange={setDialogOpen} />
    </>
  )
}
