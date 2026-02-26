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
                {/* Language switcher */}
                <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="sm" className="gap-1.5 text-[13px] font-[450] h-7 px-2.5 text-zinc-500 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-100 hover:bg-black/[0.06] dark:hover:bg-white/[0.07] rounded-md transition-all duration-150 ease-out">
                            {displayName}
                            <ChevronDown className="size-3 opacity-50" />
                        </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="start">
                        <DropdownMenuLabel className="text-xs">Language</DropdownMenuLabel>
                        <DropdownMenuSeparator />
                        {SUPPORTED_LANGUAGES.map((lang) => (
                            <DropdownMenuItem
                                key={lang}
                                onSelect={() => handleLanguageChange(lang)}
                                className="text-xs"
                            >
                                {LANGUAGE_DISPLAY_NAMES[lang]}
                                {currentLang === lang && (
                                    <span className="ml-auto text-primary">✓</span>
                                )}
                            </DropdownMenuItem>
                        ))}
                    </DropdownMenuContent>
                </DropdownMenu>

                <Separator orientation="vertical" className="mx-1 h-3.5 bg-black/[0.08] dark:bg-white/[0.08] hidden sm:block" />

                {/* Split View modes */}
                <div className="hidden sm:flex items-center gap-0.5">
                    <Tooltip>
                        <TooltipTrigger asChild>
                            <Button
                                variant="ghost"
                                size="icon-sm"
                                onClick={() => setSplitViewMode("single")}
                                className={splitViewMode === "single" ? "bg-[#0071e3]/10 text-[#0071e3] dark:bg-[#0a84ff]/15 dark:text-[#0a84ff]" : "text-zinc-500 hover:bg-black/[0.06] dark:hover:bg-white/[0.07]"}
                                aria-label="Single view"
                            >
                                <Square className="size-3.5" />
                            </Button>
                        </TooltipTrigger>
                        <TooltipContent>Single View</TooltipContent>
                    </Tooltip>

                    <Tooltip>
                        <TooltipTrigger asChild>
                            <Button
                                variant="ghost"
                                size="icon-sm"
                                onClick={() => setSplitViewMode("horizontal")}
                                className={splitViewMode === "horizontal" ? "bg-[#0071e3]/10 text-[#0071e3] dark:bg-[#0a84ff]/15 dark:text-[#0a84ff]" : "text-zinc-500 hover:bg-black/[0.06] dark:hover:bg-white/[0.07]"}
                                aria-label="Split horizontal"
                            >
                                <Columns className="size-3.5" />
                            </Button>
                        </TooltipTrigger>
                        <TooltipContent>Split Horizontal</TooltipContent>
                    </Tooltip>

                    <Tooltip>
                        <TooltipTrigger asChild>
                            <Button
                                variant="ghost"
                                size="icon-sm"
                                onClick={() => setSplitViewMode("vertical")}
                                className={splitViewMode === "vertical" ? "bg-[#0071e3]/10 text-[#0071e3] dark:bg-[#0a84ff]/15 dark:text-[#0a84ff]" : "text-zinc-500 hover:bg-black/[0.06] dark:hover:bg-white/[0.07]"}
                                aria-label="Split vertical"
                            >
                                <Rows className="size-3.5" />
                            </Button>
                        </TooltipTrigger>
                        <TooltipContent>Split Vertical</TooltipContent>
                    </Tooltip>
                </div>

                <Separator orientation="vertical" className="mx-1 h-3.5 bg-black/[0.08] dark:bg-white/[0.08]" />

                {/* Format */}
                <Tooltip>
                    <TooltipTrigger asChild>
                        <Button
                            variant="ghost"
                            size="icon-sm"
                            onClick={handleFormat}
                            disabled={!activeFile}
                            aria-label="Format document"
                            className="text-zinc-500 hover:bg-black/[0.06] dark:hover:bg-white/[0.07] disabled:opacity-30"
                        >
                            <AlignLeft className="size-4" />
                        </Button>
                    </TooltipTrigger>
                    <TooltipContent>Format Document (Shift+Alt+F)</TooltipContent>
                </Tooltip>

                {/* Rename */}
                <Tooltip>
                    <TooltipTrigger asChild>
                        <Button
                            variant="ghost"
                            size="icon-sm"
                            onClick={handleRename}
                            disabled={!activeFile}
                            aria-label="Rename symbol"
                            className="text-zinc-500 hover:bg-black/[0.06] dark:hover:bg-white/[0.07] disabled:opacity-30"
                        >
                            <Tag className="size-4" />
                        </Button>
                    </TooltipTrigger>
                    <TooltipContent>Rename Symbol (F2)</TooltipContent>
                </Tooltip>

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
