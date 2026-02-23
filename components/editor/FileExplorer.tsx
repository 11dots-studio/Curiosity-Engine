"use client"

import React, { useState } from "react"
import {
    useEditor,
    SUPPORTED_LANGUAGES,
    type SupportedLanguage,
} from "@/context/EditorContext"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Separator } from "@/components/ui/separator"
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
import {
    ContextMenu,
    ContextMenuContent,
    ContextMenuItem,
    ContextMenuTrigger,
} from "@/components/ui/context-menu"
import { FilePlus, FileCode, Trash2, ChevronDown } from "lucide-react"

const LANGUAGE_DISPLAY_NAMES: Record<SupportedLanguage, string> = {
    typescript: "TypeScript",
    javascript: "JavaScript",
    json: "JSON",
    python: "Python",
    html: "HTML",
    css: "CSS",
}

export function FileExplorer() {
    const { files, activeFileId, switchFile, deleteFile, createFile } =
        useEditor()

    const [dialogOpen, setDialogOpen] = useState(false)
    const [newFileName, setNewFileName] = useState("")
    const [newFileLang, setNewFileLang] =
        useState<SupportedLanguage>("typescript")

    const handleCreate = () => {
        if (!newFileName.trim()) return
        createFile(newFileName.trim(), newFileLang)
        setNewFileName("")
        setNewFileLang("typescript")
        setDialogOpen(false)
    }

    const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
        if (e.key === "Enter") handleCreate()
    }

    return (
        <>
            <div className="flex h-full flex-col bg-muted/30 border-r">
                {/* Header */}
                <div className="flex items-center justify-between px-3 py-2">
                    <span className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">
                        Explorer
                    </span>
                    <Button
                        variant="ghost"
                        size="icon-xs"
                        onClick={() => setDialogOpen(true)}
                        aria-label="New file"
                    >
                        <FilePlus />
                    </Button>
                </div>

                <Separator />

                {/* File List */}
                <div className="flex-1 overflow-y-auto py-1">
                    {files.length === 0 ? (
                        <p className="px-3 py-2 text-xs text-muted-foreground">
                            No files yet.
                        </p>
                    ) : (
                        files.map((file) => (
                            <ContextMenu key={file.id}>
                                <ContextMenuTrigger asChild>
                                    <button
                                        onClick={() => switchFile(file.id)}
                                        className={`flex w-full items-center gap-2 px-3 py-1.5 text-xs transition-colors hover:bg-accent hover:text-accent-foreground ${activeFileId === file.id
                                                ? "bg-accent text-accent-foreground font-medium"
                                                : "text-muted-foreground"
                                            }`}
                                    >
                                        <FileCode className="size-3 shrink-0" />
                                        <span className="truncate">{file.name}</span>
                                    </button>
                                </ContextMenuTrigger>
                                <ContextMenuContent>
                                    <ContextMenuItem
                                        variant="destructive"
                                        onSelect={() => deleteFile(file.id)}
                                        disabled={files.length <= 1}
                                    >
                                        <Trash2 className="size-4" />
                                        Delete {file.name}
                                    </ContextMenuItem>
                                </ContextMenuContent>
                            </ContextMenu>
                        ))
                    )}
                </div>
            </div>

            {/* New File Dialog */}
            <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
                <DialogContent className="sm:max-w-sm">
                    <DialogHeader>
                        <DialogTitle>New File</DialogTitle>
                    </DialogHeader>

                    <div className="flex flex-col gap-3">
                        <Input
                            placeholder="filename (e.g. utils.ts)"
                            value={newFileName}
                            onChange={(e) => setNewFileName(e.target.value)}
                            onKeyDown={handleKeyDown}
                            autoFocus
                        />

                        <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                                <Button variant="outline" size="sm" className="justify-between">
                                    {LANGUAGE_DISPLAY_NAMES[newFileLang]}
                                    <ChevronDown className="size-3 opacity-60" />
                                </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="start" className="w-48">
                                <DropdownMenuLabel className="text-xs">
                                    Language
                                </DropdownMenuLabel>
                                <DropdownMenuSeparator />
                                {SUPPORTED_LANGUAGES.map((lang) => (
                                    <DropdownMenuItem
                                        key={lang}
                                        onSelect={() => setNewFileLang(lang)}
                                        className="text-xs"
                                    >
                                        {LANGUAGE_DISPLAY_NAMES[lang]}
                                        {newFileLang === lang && (
                                            <span className="ml-auto text-primary">✓</span>
                                        )}
                                    </DropdownMenuItem>
                                ))}
                            </DropdownMenuContent>
                        </DropdownMenu>
                    </div>

                    <DialogFooter showCloseButton>
                        <Button
                            size="sm"
                            onClick={handleCreate}
                            disabled={!newFileName.trim()}
                        >
                            Create
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </>
    )
}
