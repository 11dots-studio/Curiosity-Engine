"use client"

import React, { useState, useRef, useEffect } from "react"
import { Search, Mic, Send, X, Sparkles, User, Bot, Wand2, Globe, Plus, Command as CmdIcon } from "lucide-react"
import { useAI } from "@/context/AIContext"
import { useEditor } from "@/context/EditorContext"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"
import { Separator } from "@/components/ui/separator"
import {
    Tooltip,
    TooltipContent,
    TooltipProvider,
    TooltipTrigger,
} from "@/components/ui/tooltip"

export function GlobalSearchBar() {
    const {
        activeSession,
        sendMessage,
        isStreaming,
        currentStreamedMessage,
        clearChat,
        searchMode,
        setSearchMode,
        createSession
    } = useAI()
    const { activeFile, createMultipleFiles } = useEditor()
    const [input, setInput] = useState("")
    const [showResults, setShowResults] = useState(false)
    const [isFocused, setIsFocused] = useState(false)
    const scrollRef = useRef<HTMLDivElement>(null)
    const textareaRef = useRef<HTMLTextAreaElement>(null)

    const messages = activeSession?.messages || []

    // Global Shortcuts
    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            const isMac = navigator.platform.toUpperCase().indexOf('MAC') >= 0
            const modifier = isMac ? e.metaKey : e.ctrlKey

            if ((modifier && e.key.toLowerCase() === 'k') || e.key === '/') {
                if (document.activeElement?.tagName !== 'INPUT' && document.activeElement?.tagName !== 'TEXTAREA') {
                    e.preventDefault()
                    textareaRef.current?.focus()
                }
            }
        }
        window.addEventListener('keydown', handleKeyDown)
        return () => window.removeEventListener('keydown', handleKeyDown)
    }, [])

    useEffect(() => {
        if (scrollRef.current) {
            scrollRef.current.scrollTop = scrollRef.current.scrollHeight
        }
    }, [messages, currentStreamedMessage])

    const handleSend = async () => {
        if (!input.trim() || isStreaming) return

        if (searchMode === "web") {
            // Future: Implement actual web search logic
            // For now, redirect to Google or just show a message
            window.open(`https://www.google.com/search?q=${encodeURIComponent(input)}`, '_blank')
            setInput("")
            return
        }

        const content = input
        setInput("")
        setShowResults(true)

        const context = activeFile ? `\n\nActive File: ${activeFile.name}\nContent:\n${activeFile.content}` : ""
        await sendMessage(content + context, "You are a professional AI IDE assistant. Provide concise answers. For project generation, use JSON structure.")
    }

    const handleApplyAll = (content: string) => {
        try {
            const jsonMatch = content.match(/```json\n([\s\S]*?)\n```/) || content.match(/\{[\s\S]*?\}/)
            if (jsonMatch) {
                const data = JSON.parse(jsonMatch[1] || jsonMatch[0])
                if (data.files) {
                    createMultipleFiles(data.files)
                }
            }
        } catch (e) {
            console.error("Failed to apply files:", e)
        }
    }

    // Auto-grow textarea
    useEffect(() => {
        if (textareaRef.current) {
            textareaRef.current.style.height = "auto"
            textareaRef.current.style.height = `${Math.min(textareaRef.current.scrollHeight, 200)}px`
        }
    }, [input])

    const quickActions = [
        { label: "Fix bugs", icon: <Wand2 className="size-3" />, prompt: "Fix any bugs in the active file." },
        { label: "Explain", icon: <Bot className="size-3" />, prompt: "Explain how the code in the active file works." },
        { label: "Optimize", icon: <Sparkles className="size-3" />, prompt: "Help me optimize the performance of this code." },
        { label: "Summarize", icon: <Search className="size-3" />, prompt: "Summarize the project or context." },
    ]

    const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
        if (e.key === "Enter" && !e.shiftKey) {
            e.preventDefault()
            handleSend()
        }
    }

    return (
        <>
            <div className={cn(
                "fixed inset-0 bg-black/5 dark:bg-black/40 backdrop-blur-[4px] z-40 transition-all duration-500 pointer-events-none",
                isFocused ? "opacity-100" : "opacity-0"
            )} />

            <div className="fixed bottom-0 left-0 right-0 h-64 bg-gradient-to-t from-black/[0.2] dark:from-black/90 to-transparent pointer-events-none z-40" />

            <div className="fixed bottom-8 left-1/2 -translate-x-1/2 z-50 w-[95%] max-w-3xl flex flex-col items-center gap-4 transition-all duration-500 ease-[cubic-bezier(0.16,1,0.3,1)]">
                {/* Floating Response Area */}
                {(showResults || messages.length > 0) && (
                    <div className="w-full max-h-[500px] bg-white/80 dark:bg-[#1c1c1e]/85 border border-black/[0.08] dark:border-white/[0.1] rounded-[2.5rem] shadow-[0_32px_120px_rgba(0,0,0,0.25)] dark:shadow-[0_40px_150px_rgba(0,0,0,0.8)] backdrop-blur-3xl flex flex-col overflow-hidden animate-in fade-in zoom-in-95 slide-in-from-bottom-12 duration-700 ease-[cubic-bezier(0.16,1,0.3,1)]">
                        <div className="flex items-center justify-between px-8 py-5 border-b border-black/[0.04] dark:border-white/[0.06] bg-white/20 dark:bg-white/[0.01]">
                            <div className="flex items-center gap-3">
                                <div className="p-2 rounded-xl bg-gradient-to-br from-[#0071e3] to-[#00c6fb] shadow-lg shadow-[#0071e3]/20">
                                    <Sparkles className="size-4 text-white" />
                                </div>
                                <div className="flex flex-col">
                                    <span className="text-[15px] font-[600] tracking-tight text-[#1d1d1f] dark:text-[#f5f5f7]">Curiosity Assistant</span>
                                    <span className="text-[10px] text-[#86868b] font-medium uppercase tracking-widest">{searchMode === "ai" ? "AI ENGINE ACTIVE" : "WEB SEARCH ACTIVE"}</span>
                                </div>
                            </div>
                            <div className="flex items-center gap-3">
                                <Button
                                    variant="ghost"
                                    size="sm"
                                    className="h-9 px-4 rounded-full text-[13px] font-medium text-[#86868b] hover:text-[#1d1d1f] dark:hover:text-[#f5f5f7] hover:bg-black/[0.04] dark:hover:bg-white/[0.05] transition-all"
                                    onClick={clearChat}
                                >
                                    Clear History
                                </Button>
                                <Separator orientation="vertical" className="h-4 bg-black/[0.1] dark:bg-white/[0.1]" />
                                <Button
                                    variant="ghost"
                                    size="icon"
                                    className="size-9 rounded-full hover:bg-black/[0.05] dark:hover:bg-white/[0.05] transition-all hover:scale-110 active:scale-90 duration-300"
                                    onClick={() => {
                                        setShowResults(false)
                                        setIsFocused(false)
                                    }}
                                >
                                    <X className="size-5" />
                                </Button>
                            </div>
                        </div>

                        <div ref={scrollRef} className="flex-1 overflow-y-auto p-8 space-y-8 custom-scrollbar min-h-[160px]">
                            {messages.map((msg: any, i: number) => (
                                <div key={i} className={cn("flex flex-col gap-4", msg.role === "user" ? "items-end" : "items-start")}>
                                    <div className={cn(
                                        "max-w-[85%] rounded-[2rem] px-6 py-4 text-[15px] leading-[1.6] shadow-md transition-all animate-in fade-in slide-in-from-bottom-4 duration-500",
                                        msg.role === "user"
                                            ? "bg-[#0071e3] text-white rounded-tr-none font-[450]"
                                            : "bg-white dark:bg-[#2c2c2e] text-[#1d1d1f] dark:text-[#f5f5f7] rounded-tl-none border border-black/[0.05] dark:border-white/[0.08]"
                                    )}>
                                        {msg.content}
                                        {msg.role === "assistant" && msg.content.includes("```json") && (
                                            <Button
                                                variant="outline"
                                                size="sm"
                                                className="mt-5 w-full gap-2.5 h-11 border-[#0071e3]/30 hover:bg-[#0071e3]/10 dark:hover:bg-[#0a84ff]/10 bg-white/40 dark:bg-black/20 backdrop-blur-xl rounded-2xl font-[600] text-[#0071e3] dark:text-[#0a84ff] transition-all hover:scale-[1.02] active:scale-[0.98]"
                                                onClick={() => handleApplyAll(msg.content)}
                                            >
                                                <Wand2 className="size-4" />
                                                Integrate Changes
                                            </Button>
                                        )}
                                    </div>
                                </div>
                            ))}
                            {isStreaming && (
                                <div className="flex flex-col gap-4 items-start animate-fade-in">
                                    <div className="max-w-[85%] rounded-[2rem] rounded-tl-none px-6 py-4 text-[15px] leading-[1.6] bg-white dark:bg-[#2c2c2e] text-[#1d1d1f] dark:text-[#f5f5f7] border border-black/[0.05] dark:border-white/[0.08] shadow-md">
                                        {currentStreamedMessage}
                                        <span className="inline-block w-2 h-5 ml-2 bg-[#0071e3] animate-pulse align-middle rounded-full" />
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                )}

                {/* Input Bar Section */}
                <div className="w-full flex flex-col gap-3.5 items-center max-w-2xl px-2">
                    {/* Quick Action Chips (appearing when focused and empty) */}
                    {isFocused && !input && searchMode === "ai" && (
                        <div className="flex flex-wrap justify-center gap-2 mb-1 animate-in fade-in slide-in-from-bottom-4 duration-500">
                            {quickActions.map((action) => (
                                <button
                                    key={action.label}
                                    onClick={() => setInput(action.prompt)}
                                    className="flex items-center gap-2 px-4 py-2 rounded-full bg-white/80 dark:bg-[#2c2c2e]/80 border border-black/[0.06] dark:border-white/[0.08] text-[12px] font-[600] text-[#86868b] hover:text-[#1d1d1f] dark:hover:text-white hover:bg-white dark:hover:bg-[#3a3a3c] hover:border-[#0071e3]/30 dark:hover:border-[#0a84ff]/30 shadow-sm backdrop-blur-xl transition-all hover:scale-105 active:scale-95"
                                >
                                    {action.icon}
                                    {action.label}
                                </button>
                            ))}
                        </div>
                    )}

                    {/* Active File Context Tip */}
                    {activeFile && (
                        <div className="flex items-center gap-2.5 px-3.5 py-1.5 rounded-full bg-white/60 dark:bg-black/40 border border-black/[0.04] dark:border-white/[0.06] backdrop-blur-2xl animate-in fade-in slide-in-from-bottom-2 shadow-sm">
                            <div className="size-2 rounded-full bg-green-500 shadow-[0_0_8px_rgba(34,197,94,0.6)] animate-pulse" />
                            <span className="text-[10px] font-bold text-[#86868b] uppercase tracking-[0.1em] opacity-80">CONTEXT: {activeFile.name}</span>
                        </div>
                    )}

                    {/* The Bar - ChatGPT Style Enhanced */}
                    <div className={cn(
                        "w-full flex items-end gap-3 bg-white/95 dark:bg-[#2f2f2f] border border-black/[0.1] dark:border-white/[0.15] rounded-[30px] p-2 pl-4 shadow-[0_12px_48px_rgba(0,0,0,0.1)] dark:shadow-[0_20px_80px_rgba(0,0,0,0.6)] transition-all duration-500 ease-[cubic-bezier(0.16,1,0.3,1)] focus-within:ring-1 focus-within:ring-black/[0.08] dark:focus-within:ring-white/20 group/search min-h-[56px]",
                        isFocused && "shadow-[0_20px_80px_rgba(0,0,0,0.15)] dark:shadow-[0_24px_100px_rgba(0,0,0,0.8)] scale-[1.01]"
                    )}>
                        {/* Mode Selector Integrated */}
                        <div className="flex items-center bg-black/[0.04] dark:bg-white/[0.06] rounded-full p-1 border border-black/[0.04] dark:border-white/[0.04] mb-1">
                            <button
                                onClick={() => setSearchMode("ai")}
                                className={cn(
                                    "p-2.5 rounded-full transition-all duration-300",
                                    searchMode === "ai"
                                        ? "bg-white dark:bg-[#4a4a4a] shadow-md text-[#1d1d1f] dark:text-white scale-105"
                                        : "text-[#86868b] hover:text-[#1d1d1f] dark:hover:text-[#f5f5f7] hover:scale-110"
                                )}
                            >
                                <Sparkles className="size-4" />
                            </button>
                            <button
                                onClick={() => setSearchMode("web")}
                                className={cn(
                                    "p-2.5 rounded-full transition-all duration-300",
                                    searchMode === "web"
                                        ? "bg-white dark:bg-[#4a4a4a] shadow-md text-[#1d1d1f] dark:text-white scale-105"
                                        : "text-[#86868b] hover:text-[#1d1d1f] dark:hover:text-[#f5f5f7] hover:scale-110"
                                )}
                            >
                                <Globe className="size-4" />
                            </button>
                        </div>

                        <div className="flex-1 flex items-center min-h-[40px] py-1">
                            <textarea
                                ref={textareaRef}
                                rows={1}
                                value={input}
                                onFocus={() => setIsFocused(true)}
                                onBlur={() => setIsFocused(false)}
                                onChange={(e) => setInput(e.target.value)}
                                onKeyDown={handleKeyDown}
                                placeholder={searchMode === "ai" ? "Ask anything..." : "Search the web..."}
                                className="w-full bg-transparent border-none outline-none text-[16px] leading-[24px] text-[#1d1d1f] dark:text-[#f5f5f7] placeholder:text-[#86868b] font-[450] resize-none overflow-hidden max-h-[200px] py-2 px-1"
                            />
                        </div>

                        <div className="flex items-center gap-1.5 px-1 mb-1">
                            {searchMode === "ai" && (
                                <TooltipProvider>
                                    <Tooltip>
                                        <TooltipTrigger asChild>
                                            <button
                                                className="p-2.5 hover:bg-black/[0.05] dark:hover:bg-white/[0.08] rounded-full transition-all duration-200 text-[#86868b] hover:text-[#1d1d1f] dark:hover:text-white"
                                                onClick={() => createSession()}
                                            >
                                                <Plus className="size-5" />
                                            </button>
                                        </TooltipTrigger>
                                        <TooltipContent side="top" className="bg-black text-white dark:bg-white dark:text-black font-semibold">New Chat</TooltipContent>
                                    </Tooltip>
                                </TooltipProvider>
                            )}

                            <button className="p-2.5 hover:bg-black/[0.05] dark:hover:bg-white/[0.08] rounded-full transition-all duration-200 text-[#86868b] hover:text-[#1d1d1f] dark:hover:text-white">
                                <Mic className="size-5" />
                            </button>

                            <Button
                                size="icon"
                                className={cn(
                                    "size-9 rounded-full transition-all duration-500 shadow-lg shadow-black/5",
                                    input.trim()
                                        ? "bg-[#1d1d1f] dark:bg-white text-white dark:text-black opacity-100 scale-100 hover:scale-105 active:scale-95"
                                        : "bg-black/10 dark:bg-white/10 text-black/30 dark:text-white/30 scale-95 pointer-events-none"
                                )}
                                onClick={handleSend}
                                disabled={isStreaming}
                            >
                                <Send className="size-4.5 rotate-[-45deg] relative left-[1px] top-[-1px]" />
                            </Button>
                        </div>
                    </div>

                    {/* Shortcut Hint */}
                    {!isFocused && !input && (
                        <div className="flex items-center gap-4 text-[11px] font-[500] text-[#86868b] opacity-0 group-hover:opacity-100 transition-all duration-500 animate-in fade-in slide-in-from-top-1">
                            <div className="flex items-center gap-2">
                                <span className="px-1.5 py-0.5 rounded-md bg-black/[0.05] dark:bg-white/[0.08] flex items-center gap-1 border border-black/[0.05] dark:border-white/[0.05]">
                                    <CmdIcon className="size-2.5" />
                                    K
                                </span>
                                <span className="tracking-wide">QUICK FOCUS</span>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </>
    )
}

