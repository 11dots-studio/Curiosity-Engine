"use client"

import React, { memo } from "react"
import { useEditor } from "@/context/EditorContext"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Button } from "@/components/ui/button"
import {
    Tooltip,
    TooltipContent,
    TooltipProvider,
    TooltipTrigger,
} from "@/components/ui/tooltip"
import { X, FileCode } from "lucide-react"

export const FileTabs = memo(function FileTabs() {
    const { files, activeFileId, switchFile, deleteFile } = useEditor()

    if (files.length === 0) {
        return (
            <div className="flex items-center px-3 py-1 border-b text-xs text-muted-foreground">
                No files open
            </div>
        )
    }

    return (
        <TooltipProvider>
            <div className="flex items-center border-b border-zinc-200/50 dark:border-zinc-800/50 bg-zinc-50/50 dark:bg-zinc-950/50 overflow-hidden w-full">
                <Tabs value={activeFileId} onValueChange={switchFile} className="w-full flex min-w-0">
                    <TabsList
                        className="h-10 w-full flex items-center justify-start rounded-none bg-transparent px-2 gap-1 overflow-hidden"
                    >
                        {files.map((file) => (
                            <div key={file.id} className="relative flex items-center group/tab mt-1 shrink min-w-0 max-w-[180px]">
                                <TabsTrigger
                                    value={file.id}
                                    className="h-9 gap-2 pr-8 pl-3 text-xs font-medium rounded-t-md border border-transparent 
                                    data-[state=active]:border-zinc-200/50 dark:data-[state=active]:border-zinc-800/50 
                                    data-[state=active]:border-b-white dark:data-[state=active]:border-b-zinc-900 
                                    data-[state=active]:bg-white dark:data-[state=active]:bg-zinc-900
                                    data-[state=active]:shadow-[0_-2px_0_0_rgba(0,0,0,0.02)]
                                    text-zinc-500 hover:text-zinc-800 dark:text-zinc-400 dark:hover:text-zinc-200 
                                    hover:bg-zinc-200/50 dark:hover:bg-zinc-800/50 
                                    data-[state=active]:text-foreground 
                                    transition-all duration-200 ease-out flex w-full min-w-0"
                                >
                                    <FileCode className="size-3.5 shrink-0 opacity-70" />
                                    <span className="truncate whitespace-nowrap min-w-0 flex-1 text-left">{file.name}</span>
                                </TabsTrigger>
                                {files.length > 1 && (
                                    <Tooltip>
                                        <TooltipTrigger asChild>
                                            <Button
                                                variant="ghost"
                                                className="absolute right-1 top-[7px] w-5 h-5 p-0 rounded-sm opacity-0 group-hover/tab:opacity-100 hover:bg-zinc-200 dark:hover:bg-zinc-700 transition-all duration-200"
                                                onClick={(e) => {
                                                    e.stopPropagation()
                                                    deleteFile(file.id)
                                                }}
                                                aria-label={`Close ${file.name}`}
                                            >
                                                <X className="size-3 text-zinc-500 hover:text-zinc-900 dark:hover:text-zinc-100" />
                                            </Button>
                                        </TooltipTrigger>
                                        <TooltipContent>Close {file.name}</TooltipContent>
                                    </Tooltip>
                                )}
                            </div>
                        ))}
                    </TabsList>
                </Tabs>
            </div>
        </TooltipProvider>
    )
})
