"use client"

import React, { memo } from "react"
import { useTheme } from "next-themes"
import {
    useEditor,
    SUPPORTED_LANGUAGES,
    type SupportedLanguage,
} from "@/context/EditorContext"
import { Button } from "@/components/ui/button"
import { Separator } from "@/components/ui/separator"
import {
    Tooltip,
    TooltipContent,
    TooltipProvider,
    TooltipTrigger,
} from "@/components/ui/tooltip"
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { AlignLeft, ChevronDown, Moon, Sun, Tag, Columns, Rows, Square } from "lucide-react"

const LANGUAGE_DISPLAY_NAMES: Record<SupportedLanguage, string> = {
    typescript: "TypeScript",
    javascript: "JavaScript",
    json: "JSON",
    python: "Python",
    html: "HTML",
    css: "CSS",
}

export const EditorToolbar = memo(function EditorToolbar() {
    const { setTheme, theme, systemTheme } = useTheme()
    const { activeFile, editorRef, updateFileLanguage, splitViewMode, setSplitViewMode } = useEditor()

    const handleFormat = () => {
        editorRef.current?.getAction("editor.action.formatDocument")?.run()
    }

    const handleRename = () => {
        editorRef.current?.getAction("editor.action.rename")?.run()
    }

    const handleLanguageChange = (lang: SupportedLanguage) => {
        if (activeFile) updateFileLanguage(activeFile.id, lang)
    }

    const currentLang = activeFile?.language ?? "typescript"
    const displayName = LANGUAGE_DISPLAY_NAMES[currentLang as SupportedLanguage] ?? currentLang
    const currentTheme = theme === "system" ? systemTheme : theme

    return (
        <TooltipProvider>
            <div className="flex items-center gap-1">
                <Separator orientation="vertical" className="mx-1 h-3.5 bg-black/[0.08] dark:bg-white/[0.08]" />

                {/* Global App Theme toggle */}
                <Tooltip>
                    <TooltipTrigger asChild>
                        <Button
                            variant="ghost"
                            size="icon-sm"
                            onClick={() => setTheme(currentTheme === "dark" ? "light" : "dark")}
                            aria-label="Toggle theme"
                            className="text-zinc-500 hover:bg-black/[0.06] dark:hover:bg-white/[0.07] transition-all duration-150 ease-out"
                        >
                            {currentTheme === "dark" ? <Sun className="size-4" /> : <Moon className="size-4" />}
                        </Button>
                    </TooltipTrigger>
                    <TooltipContent>
                        {currentTheme === "dark" ? "Switch to Light Mode" : "Switch to Dark Mode"}
                    </TooltipContent>
                </Tooltip>
            </div>
        </TooltipProvider>
    )
})
