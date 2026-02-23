"use client"

import * as React from "react"
import { ChevronRight, File, Folder, FilePlus, Trash2 } from "lucide-react"

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
  SidebarMenu,
  SidebarMenuAction,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarMenuSub,
  SidebarRail,
} from "@/components/ui/sidebar"
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

const LANGUAGE_DISPLAY_NAMES: Record<SupportedLanguage, string> = {
  typescript: "TypeScript",
  javascript: "JavaScript",
  json: "JSON",
  python: "Python",
  html: "HTML",
  css: "CSS",
}

// ─── Static tree data (preserved from original) ────────────────────────────
type TreeItem = string | TreeItem[]

function Tree({ item }: { item: TreeItem }) {
  const [name, ...items] = Array.isArray(item) ? item : [item]

  if (!items.length) {
    return (
      <SidebarMenuButton className="data-[active=true]:bg-transparent">
        <File />
        {name}
      </SidebarMenuButton>
    )
  }

  return (
    <SidebarMenuItem>
      <Collapsible
        className="group/collapsible [&[data-state=open]>button>svg:first-child]:rotate-90"
        defaultOpen={name === "components" || name === "ui"}
      >
        <CollapsibleTrigger asChild>
          <SidebarMenuButton>
            <ChevronRight className="transition-transform" />
            <Folder />
            {name}
          </SidebarMenuButton>
        </CollapsibleTrigger>
        <CollapsibleContent>
          <SidebarMenuSub>
            {items.map((subItem, index) => (
              <Tree key={index} item={subItem} />
            ))}
          </SidebarMenuSub>
        </CollapsibleContent>
      </Collapsible>
    </SidebarMenuItem>
  )
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
              className="group/file"
            >
              <File />
              <span className="flex-1 truncate">{file.name}</span>
            </SidebarMenuButton>
          </TooltipTrigger>
          <TooltipContent side="right">
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
          className="hover:text-destructive"
        >
          <Trash2 className="size-4" />
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
  const [lang, setLang] = React.useState<SupportedLanguage>("typescript")

  const handleCreate = () => {
    if (!name.trim()) return
    createFile(name.trim(), lang)
    setName("")
    setLang("typescript")
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
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" size="sm" className="justify-between">
                {LANGUAGE_DISPLAY_NAMES[lang]}
                <ChevronRight className="size-3 rotate-90 opacity-60" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="start" className="w-48">
              <DropdownMenuLabel className="text-xs">Language</DropdownMenuLabel>
              <DropdownMenuSeparator />
              {SUPPORTED_LANGUAGES.map((l) => (
                <DropdownMenuItem
                  key={l}
                  onSelect={() => setLang(l)}
                  className="text-xs"
                >
                  {LANGUAGE_DISPLAY_NAMES[l]}
                  {lang === l && <span className="ml-auto text-primary">✓</span>}
                </DropdownMenuItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>
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
  const { files } = useEditor()
  const [dialogOpen, setDialogOpen] = React.useState(false)

  return (
    <>
      <Sidebar {...props}>
        <SidebarContent>
          {/* Open Files — driven by EditorContext */}
          <SidebarGroup>
            <SidebarGroupLabel>Open Files</SidebarGroupLabel>
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <SidebarGroupAction
                    onClick={() => setDialogOpen(true)}
                    aria-label="New file"
                  >
                    <FilePlus />
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

          {/* Static file tree (preserved from original editor-sidebar) */}
          <SidebarGroup>
            <SidebarGroupLabel>Files</SidebarGroupLabel>
            <SidebarGroupContent>
              <SidebarMenu>
                {[
                  ["app", ["api", ["hello", ["route.ts"]], "page.tsx", "layout.tsx", ["blog", ["page.tsx"]]]],
                  ["components", ["ui", "button.tsx", "card.tsx"], "header.tsx", "footer.tsx"],
                  ["lib", ["util.ts"]],
                  ["public", "favicon.ico", "vercel.svg"],
                  ".eslintrc.json",
                  ".gitignore",
                  "next.config.js",
                  "tailwind.config.js",
                  "package.json",
                  "README.md",
                ].map((item, index) => (
                  <Tree key={index} item={item} />
                ))}
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>
        </SidebarContent>
        <SidebarRail />
      </Sidebar>

      <NewFileDialog open={dialogOpen} onOpenChange={setDialogOpen} />
    </>
  )
}
