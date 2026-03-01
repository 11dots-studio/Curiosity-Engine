"use client"

import React, { useState, useRef, useEffect, useMemo, memo } from "react"
import { AppSidebar } from "@/components/editor-sidebar"
import { Separator } from "@/components/ui/separator"
import {
  SidebarInset,
  SidebarProvider,
  SidebarTrigger,
  useSidebar,
} from "@/components/ui/sidebar"

import { EditorProvider, useEditor } from "@/context/EditorContext"
import { EditorToolbar } from "@/components/editor/EditorToolbar"
import { EditorContainer } from "@/components/editor/EditorContainer"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"
import { ChevronLeft, Code, Terminal, Bot, MessageSquare } from "lucide-react"
import Link from "next/link"
import { GlobalSearchBar } from "@/components/global-search-bar"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip"
import { CommandPalette, type Command } from "@/components/editor/CommandPalette"

const EditorAppMenuBar = memo(function EditorAppMenuBar() {
  const { createFile, activeFile, splitViewMode, setSplitViewMode, editorRef, deleteFile, showMinimap, setShowMinimap, wordWrap, setWordWrap } = useEditor()
  const { toggleSidebar } = useSidebar()

  const handleCommand = (cmd: string) => {
    editorRef.current?.getAction(cmd)?.run()
  }

  const triggerBasicAction = (action: string) => {
    if (editorRef.current) {
      editorRef.current.trigger('source', action, null)
    }
  }

  return (
    <div className="flex items-center gap-1 overflow-hidden">
      {/* Files Menu */}
      <DropdownMenu>
        <DropdownMenuTrigger className="text-[13px] font-[450] px-2.5 py-1 text-zinc-500 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-100 hover:bg-black/[0.06] dark:hover:bg-white/[0.07] rounded-md outline-none cursor-default transition-all duration-150 ease-out focus-visible:outline-none">
          Files
        </DropdownMenuTrigger>
        <DropdownMenuContent align="start" className="w-48 text-sm">
          <DropdownMenuItem onClick={() => createFile('Untitled', 'typescript')}>New File</DropdownMenuItem>
          <DropdownMenuItem disabled>New Folder</DropdownMenuItem>
          <DropdownMenuSeparator />
          <DropdownMenuItem disabled={!activeFile} onClick={() => { }}>Rename File</DropdownMenuItem>
          <DropdownMenuItem disabled={!activeFile} onClick={() => { if (activeFile) deleteFile(activeFile.id) }}>Delete File</DropdownMenuItem>
          <DropdownMenuSeparator />
          <DropdownMenuItem disabled={!activeFile}>Save</DropdownMenuItem>
          <DropdownMenuItem disabled={!activeFile}>Save All</DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      {/* Edit Menu */}
      <DropdownMenu>
        <DropdownMenuTrigger className="text-[13px] font-[450] px-2.5 py-1 text-zinc-500 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-100 hover:bg-black/[0.06] dark:hover:bg-white/[0.07] rounded-md outline-none cursor-default transition-all duration-150 ease-out focus-visible:outline-none">
          Edit
        </DropdownMenuTrigger>
        <DropdownMenuContent align="start" className="w-48 text-sm">
          <DropdownMenuItem onClick={() => triggerBasicAction('undo')}>Undo</DropdownMenuItem>
          <DropdownMenuItem onClick={() => triggerBasicAction('redo')}>Redo</DropdownMenuItem>
          <DropdownMenuSeparator />
          <DropdownMenuItem onClick={() => triggerBasicAction('editor.action.clipboardCutAction')}>Cut</DropdownMenuItem>
          <DropdownMenuItem onClick={() => triggerBasicAction('editor.action.clipboardCopyAction')}>Copy</DropdownMenuItem>
          <DropdownMenuItem onClick={() => triggerBasicAction('editor.action.clipboardPasteAction')}>Paste</DropdownMenuItem>
          <DropdownMenuSeparator />
          <DropdownMenuItem onClick={() => handleCommand('actions.find')}>Find</DropdownMenuItem>
          <DropdownMenuItem onClick={() => handleCommand('editor.action.startFindReplaceAction')}>Replace</DropdownMenuItem>
          <DropdownMenuSeparator />
          <DropdownMenuItem onClick={() => handleCommand('editor.action.rename')}>Rename Symbol</DropdownMenuItem>
          <DropdownMenuItem onClick={() => handleCommand('editor.action.formatDocument')}>Format Document</DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      {/* Layout Menu */}
      <DropdownMenu>
        <DropdownMenuTrigger className="text-[13px] font-[450] px-2.5 py-1 text-zinc-500 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-100 hover:bg-black/[0.06] dark:hover:bg-white/[0.07] rounded-md outline-none cursor-default transition-all duration-150 ease-out focus-visible:outline-none">
          Layout
        </DropdownMenuTrigger>
        <DropdownMenuContent align="start" className="w-48 text-sm">
          <DropdownMenuItem onClick={toggleSidebar}>Toggle Sidebar</DropdownMenuItem>
          <DropdownMenuItem>Toggle Panel</DropdownMenuItem>
          <DropdownMenuSeparator />
          <DropdownMenuItem onClick={() => setSplitViewMode(splitViewMode === 'horizontal' ? 'single' : 'horizontal')}>
            {splitViewMode === 'horizontal' ? '✓ ' : ''}Split Horizontally
          </DropdownMenuItem>
          <DropdownMenuItem onClick={() => setSplitViewMode(splitViewMode === 'vertical' ? 'single' : 'vertical')}>
            {splitViewMode === 'vertical' ? '✓ ' : ''}Split Vertically
          </DropdownMenuItem>
          <DropdownMenuSeparator />
          <DropdownMenuItem onClick={() => setShowMinimap(!showMinimap)}>
            {showMinimap ? '✓ ' : ''}Toggle Minimap
          </DropdownMenuItem>
          <DropdownMenuItem onClick={() => setWordWrap(!wordWrap)}>
            {wordWrap ? '✓ ' : ''}Toggle Word Wrap
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  )
})

const ViewToggle = memo(function ViewToggle() {
  const { viewMode, setViewMode } = useEditor()

  const modes = [
    { id: 'code', label: 'Code', icon: Code },
    { id: 'chat', label: 'Chat', icon: MessageSquare },
    { id: 'web', label: 'Web', icon: Bot },
  ] as const

  return (
    <div className="flex items-center gap-1">
      {modes.map((mode) => (
        <Button
          key={mode.id}
          variant="ghost"
          size="sm"
          className={cn(
            "h-7 px-3 text-[11px] font-[500] rounded-lg transition-all gap-1.5",
            viewMode === mode.id
              ? "bg-white dark:bg-white/10 shadow-sm text-[#0071e3] dark:text-[#0a84ff] hover:bg-white dark:hover:bg-white/10"
              : "text-[#86868b] hover:bg-black/[0.04] dark:hover:bg-white/[0.06]"
          )}
          onClick={() => setViewMode(mode.id)}
        >
          <mode.icon className="size-3.5" />
          {mode.label}
        </Button>
      ))}
    </div>
  )
})

const EditorHeader = memo(function EditorHeader() {
  const [title, setTitle] = useState("Curiosity Context")
  const [isEditingTitle, setIsEditingTitle] = useState(false)
  const inputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    if (isEditingTitle && inputRef.current) {
      inputRef.current.focus()
      inputRef.current.select()
    }
  }, [isEditingTitle])

  const handleTitleSubmit = () => {
    setIsEditingTitle(false)
    if (!title.trim()) {
      setTitle("Untitled Project")
    }
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      handleTitleSubmit()
    } else if (e.key === "Escape") {
      setIsEditingTitle(false)
    }
  }

  return (
    <header className="fixed top-0 left-0 right-0 z-30 flex h-11 w-full shrink-0 items-center border-b border-black/[0.06] dark:border-white/[0.06] bg-white/95 dark:bg-[#1c1c1e]/95 backdrop-blur-xl px-3 gap-4" style={{ boxShadow: 'var(--hig-shadow-sm)' }}>
      {/* Left Section: Dashboard Icon, Sidebar Trigger, and Menu Bar */}
      <div className="flex items-center gap-1 min-w-0">
        <div className="flex items-center">
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Link href="/" className="text-[#6e6e73] hover:text-[#1d1d1f] dark:text-zinc-400 dark:hover:text-zinc-100 transition-all duration-150 ease-out flex items-center justify-center size-8 rounded-md hover:bg-black/[0.06] dark:hover:bg-white/[0.07]">
                  <ChevronLeft className="size-5" />
                </Link>
              </TooltipTrigger>
              <TooltipContent side="bottom">Back to Dashboard</TooltipContent>
            </Tooltip>
          </TooltipProvider>
          <Separator orientation="vertical" className="h-4 bg-black/[0.08] dark:bg-white/[0.08] mx-1" />
          <SidebarTrigger className="text-[#6e6e73] hover:text-[#1d1d1f] dark:text-zinc-400 dark:hover:text-zinc-100 transition-all duration-150 ease-out size-8 [&>svg]:size-4 hover:bg-black/[0.06] dark:hover:bg-white/[0.07] rounded-md" />
        </div>
        <Separator orientation="vertical" className="h-4 bg-black/[0.08] dark:bg-white/[0.08] mx-1" />
        <div className="flex items-center px-1">
          <EditorAppMenuBar />
        </div>
      </div>

      {/* Center Section: View Toggle */}
      <div className="flex-1 flex justify-center">
        <div className="flex items-center bg-black/[0.04] dark:bg-white/[0.04] p-1 rounded-xl border border-black/[0.06] dark:border-white/[0.06]">
          <ViewToggle />
        </div>
      </div>

      {/* Right Section: Toolbar (Split View, Theme) */}
      <div className="flex items-center justify-end min-w-0 pr-1 gap-4">
        <div
          className="flex items-center gap-2 px-3 py-1 rounded-full bg-black/[0.03] dark:bg-white/[0.04] border border-black/[0.05] dark:border-white/[0.05] hover:border-black/10 dark:hover:border-white/10 transition-all cursor-text group max-w-[200px]"
          onClick={() => setIsEditingTitle(true)}
        >
          {isEditingTitle ? (
            <input
              ref={inputRef}
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              onBlur={handleTitleSubmit}
              onKeyDown={handleKeyDown}
              className="bg-transparent border-none outline-none text-[12px] font-[500] text-right w-full min-w-[80px]"
            />
          ) : (
            <span className="text-[12px] font-[500] truncate">
              {title}
            </span>
          )}
        </div>
        <EditorToolbar />
      </div>
    </header>
  )
})

import { ChatPanel } from "@/components/editor/ChatPanel"

function EditorPageContent() {
  const { toggleSidebar } = useSidebar()
  const { createFile, deleteFile, activeFile, splitViewMode, setSplitViewMode, editorRef, wordWrap, setWordWrap, showMinimap, setShowMinimap } = useEditor()
  const [isPaletteOpen, setIsPaletteOpen] = useState(false)

  const commands: Command[] = useMemo(() => [
    { id: "new-file", label: "New File", category: "File", run: () => createFile("Untitled", "typescript") },
    { id: "delete-file", label: "Delete File", category: "File", run: () => { if (activeFile) deleteFile(activeFile.id) } },
    { id: "toggle-sidebar", label: "Toggle Sidebar", category: "Layout", shortcut: "Ctrl+B", run: toggleSidebar },
    { id: "toggle-split-h", label: "Split Horizontal", category: "Layout", run: () => setSplitViewMode(splitViewMode === 'horizontal' ? 'single' : 'horizontal') },
    { id: "toggle-split-v", label: "Split Vertical", category: "Layout", run: () => setSplitViewMode(splitViewMode === 'vertical' ? 'single' : 'vertical') },
    { id: "format-doc", label: "Format Document", category: "Edit", shortcut: "Shift+Alt+F", run: () => editorRef.current?.getAction('editor.action.formatDocument')?.run() },
    { id: "rename-sym", label: "Rename Symbol", category: "Edit", shortcut: "F2", run: () => editorRef.current?.getAction('editor.action.rename')?.run() },
    { id: "undo", label: "Undo", category: "Edit", shortcut: "Ctrl+Z", run: () => editorRef.current?.trigger('source', 'undo', null) },
    { id: "redo", label: "Redo", category: "Edit", shortcut: "Ctrl+Y", run: () => editorRef.current?.trigger('source', 'redo', null) },
  ], [createFile, activeFile, deleteFile, toggleSidebar, splitViewMode, setSplitViewMode, editorRef])

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      const isMac = navigator.platform.toUpperCase().indexOf('MAC') >= 0
      const modifier = isMac ? e.metaKey : e.ctrlKey

      // Command Palette: Ctrl/Cmd + Shift + P
      if (modifier && e.shiftKey && e.key.toLowerCase() === 'p') {
        e.preventDefault()
        setIsPaletteOpen(prev => !prev)
      }
      // Toggle Sidebar: Ctrl/Cmd + B
      else if (modifier && e.key.toLowerCase() === 'b') {
        e.preventDefault()
        toggleSidebar()
      }
      // Save: Ctrl/Cmd + S
      else if (modifier && e.key.toLowerCase() === 's') {
        e.preventDefault()
        // Save logic placeholder
      }
      // Toggle Panel: Ctrl/Cmd + J
      else if (modifier && e.key.toLowerCase() === 'j') {
        e.preventDefault()
        // Toggle panel logic placeholder
      }
      // Close Tab: Ctrl/Cmd + W (Careful, this often closes the browser tab)
      else if (modifier && e.key.toLowerCase() === 'w') {
        // e.preventDefault() // Often blocked by browsers
        if (activeFile) deleteFile(activeFile.id)
      }
      // Toggle Word Wrap: Alt + Z
      else if (e.altKey && e.key.toLowerCase() === 'z') {
        e.preventDefault()
        setWordWrap(!wordWrap)
      }
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [toggleSidebar, activeFile, deleteFile, editorRef, wordWrap, setWordWrap])

  return (
    <>
      <EditorHeader />
      <div className="flex flex-1 min-h-0 overflow-hidden relative w-full pt-11">
        <AppSidebar className="top-11 h-[calc(100vh-2.75rem)]" />
        <SidebarInset className="bg-transparent m-0 rounded-none border-none outline-none flex flex-col h-full flex-1 min-w-0 overflow-hidden p-0 relative">
          <div className="flex w-full h-full p-0 flex-1 min-h-0 overflow-hidden">
            <EditorContainer />
          </div>
        </SidebarInset>
      </div>
      <GlobalSearchBar />
      {isPaletteOpen && (
        <CommandPalette
          open={isPaletteOpen}
          onOpenChange={setIsPaletteOpen}
          commands={commands}
        />
      )}
    </>
  )
}

export default function Page() {
  return (
    <EditorPageContent />
  )
}
