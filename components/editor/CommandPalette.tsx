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
            className="max-w-[600px] backdrop-blur-sm"
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
                                <span className="text-xs text-muted-foreground w-12">{command.category}</span>
                                <span>{command.label}</span>
                            </div>
                            {command.shortcut && (
                                <kbd className="pointer-events-none inline-flex h-5 select-none items-center gap-1 rounded border bg-muted px-1.5 font-mono text-[10px] font-medium text-muted-foreground opacity-100">
                                    {command.shortcut}
                                </kbd>
                            )}
                        </CommandItem>
                    ))}
                </CommandGroup>
            </CommandList>
        </CommandDialog>
    )
}
