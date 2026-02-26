"use client"

import React from "react"
import {
    CommandDialog,
    CommandEmpty,
    CommandGroup,
    CommandInput,
    CommandItem,
    CommandList,
    CommandSeparator,
} from "@/components/ui/command"

export interface Command {
    id: string
    label: string
    category: "File" | "Edit" | "Layout"
    shortcut?: string
    run: () => void
}

interface CommandPaletteProps {
    open: boolean
    onOpenChange: (open: boolean) => void
    commands: Command[]
}

export function CommandPalette({ open, onOpenChange, commands }: CommandPaletteProps) {
    return (
        <CommandDialog
            open={open}
            onOpenChange={onOpenChange}
            className="max-w-[600px] backdrop-blur-2xl bg-white/95 dark:bg-[#1c1c1e]/95 border-black/[0.08] dark:border-white/[0.08] shadow-[0_20px_60px_rgba(0,0,0,0.15)] dark:shadow-[0_20px_60px_rgba(0,0,0,0.45)]"
        >
            <CommandInput placeholder="Type a command or search..." />
            <CommandList>
                <CommandEmpty>No results found.</CommandEmpty>
                <CommandGroup heading="Actions">
                    {commands.map((command) => (
                        <CommandItem
                            key={command.id}
                            onSelect={() => {
                                command.run()
                                onOpenChange(false)
                            }}
                            className="flex items-center justify-between"
                        >
                            <div className="flex items-center gap-2">
                                <span className="text-[11px] font-semibold tracking-wider text-[#86868b] uppercase w-12">{command.category}</span>
                                <span className="text-[14px] font-[450]">{command.label}</span>
                            </div>
                            {command.shortcut && (
                                <kbd className="pointer-events-none inline-flex h-5 select-none items-center gap-0.5 rounded border border-black/[0.08] dark:border-white/[0.12] bg-[#f5f5f7] dark:bg-[#2c2c2e] px-1.5 font-sans text-[11px] font-[500] text-[#6e6e73] dark:text-zinc-400 opacity-100 shadow-[0_1px_1px_rgba(0,0,0,0.05)]">
                                    {command.shortcut.replace('Ctrl', '⌘').replace('Shift', '⇧').replace('Alt', '⌥')}
                                </kbd>
                            )}
                        </CommandItem>
                    ))}
                </CommandGroup>
            </CommandList>
        </CommandDialog>
    )
}
