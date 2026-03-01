import React, { memo } from "react"
import { useEditor, type FileModel } from "@/context/EditorContext"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Button } from "@/components/ui/button"
import {
    Tooltip,
    TooltipContent,
    TooltipProvider,
    TooltipTrigger,
} from "@/components/ui/tooltip"
import { X, FileCode } from "lucide-react"
import { FileIcon } from "@/components/editor/FileIcon"

export const FileTabs = memo(function FileTabs() {
    const { files, activeFileId, switchFile, closeFile } = useEditor()

    const getTabLabel = (file: FileModel) => {
        const hasCollision = files.some(f => f.name === file.name && f.id !== file.id)
        if (!hasCollision) return file.name
        // Show relative path if there's a name collision
        const parts = file.path.split('/')
        if (parts.length > 1) {
            const parent = parts[parts.length - 2]
            return parent ? `${parent}/${file.name}` : file.name
        }
        return file.name
    }

    if (files.length === 0) {
        return (
            <div className="flex items-center px-4 py-2 border-b border-black/[0.06] dark:border-white/[0.06] text-[12px] text-[#86868b]">
                No files open
            </div>
        )
    }

    return (
        <TooltipProvider>
            <div className="flex items-center border-b border-black/[0.06] dark:border-white/[0.06] bg-[#f5f5f7] dark:bg-[#1c1c1e] overflow-hidden w-full">
                <div className="w-full flex min-w-0">
                    <div className="h-10 w-full flex items-center justify-start rounded-none bg-transparent px-2 gap-0.5 overflow-hidden">
                        {files.map((file) => (
                            <div
                                key={file.id}
                                onClick={() => switchFile(file.id)}
                                className={[
                                    "relative flex items-center group/tab mt-1 shrink min-w-0 max-w-[180px] h-[34px] gap-1.5 pr-8 pl-3 text-[12px] font-[450] rounded-t-[6px] border border-transparent cursor-default transition-all duration-160 ease-out",
                                    activeFileId === file.id
                                        ? "bg-white dark:bg-[#1e1e1e] border-black/[0.07] dark:border-white/[0.07] border-b-white dark:border-b-[#1e1e1e] text-[#1d1d1f] dark:text-[#f5f5f7] shadow-[0_-1px_0_0_var(--hig-accent)_inset]"
                                        : "text-[#86868b] dark:text-[rgba(235,235,240,0.45)] hover:text-[#1d1d1f] dark:hover:text-[#f5f5f7] hover:bg-black/[0.05] dark:hover:bg-white/[0.05]"
                                ].join(" ")}
                            >
                                <FileIcon language={file.language} className="size-3 shrink-0 opacity-60" />
                                <span className="truncate whitespace-nowrap min-w-0 flex-1 text-left">{getTabLabel(file)}</span>
                                <Tooltip>
                                    <TooltipTrigger asChild>
                                        <Button
                                            variant="ghost"
                                            className="absolute right-1.5 top-[7px] w-[18px] h-[18px] p-0 rounded-[4px] opacity-0 group-hover/tab:opacity-50 hover:!opacity-100 hover:bg-black/[0.08] dark:hover:bg-white/[0.10] transition-all duration-150 ease-out"
                                            onClick={(e) => {
                                                e.stopPropagation()
                                                closeFile(file.id)
                                            }}
                                            aria-label={`Close ${file.name}`}
                                        >
                                            <X className="size-2.5 text-[#6e6e73] dark:text-zinc-400" />
                                        </Button>
                                    </TooltipTrigger>
                                    <TooltipContent side="bottom" className="text-[11px]">Close {file.name}</TooltipContent>
                                </Tooltip>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </TooltipProvider>
    )
})
