"use client"

import React, { useState, useRef, useEffect } from "react"
import { useAI, Message } from "@/context/AIContext"
import { useEditor } from "@/context/EditorContext"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Bot, User, Send, Sparkles, Wand2, Terminal, Code, Plus, X } from "lucide-react"
import { cn } from "@/lib/utils"

export const ChatPanel = () => {
    const {
        sessions,
        activeSessionId,
        activeSession,
        sendMessage,
        isStreaming,
        currentStreamedMessage,
        clearChat,
        createSession,
        switchSession,
        deleteSession
    } = useAI()
    const { createMultipleFiles, activeFile } = useEditor()
    const [input, setInput] = useState("")
    const scrollRef = useRef<HTMLDivElement>(null)

    useEffect(() => {
        if (scrollRef.current) {
            scrollRef.current.scrollTop = scrollRef.current.scrollHeight
        }
    }, [activeSession?.messages, currentStreamedMessage])

    const handleSend = async () => {
        if (!input.trim() || isStreaming) return
        const content = input
        setInput("")

        // Context injection
        const context = activeFile ? `\n\nActive File: ${activeFile.name}\nContent:\n${activeFile.content}` : ""
        await sendMessage(content + context, "You are a professional AI IDE assistant. If user asks to create a multi-file project, provide a JSON structure like: ```json\n{\"files\": [{\"name\": \"page.tsx\", \"content\": \"...\"}]}\n```")
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

    return (
        <div className="flex flex-col h-full bg-white dark:bg-[#1c1c1e] w-full overflow-hidden">
            {/* Session Tabs */}
            <div className="flex items-center gap-1 px-2 py-2 border-b border-black/[0.06] dark:border-white/[0.06] overflow-x-auto no-scrollbar bg-black/[0.02] dark:bg-white/[0.02]">
                {sessions.map((s) => (
                    <div
                        key={s.id}
                        className={cn(
                            "group flex items-center gap-2 px-3 py-1.5 rounded-lg text-[12px] font-[500] whitespace-nowrap transition-all cursor-pointer",
                            s.id === activeSessionId
                                ? "bg-white dark:bg-white/10 shadow-sm text-[#0071e3] dark:text-[#0a84ff]"
                                : "text-[#86868b] hover:bg-black/[0.04] dark:hover:bg-white/[0.05]"
                        )}
                        onClick={() => switchSession(s.id)}
                    >
                        <span className="max-w-[100px] truncate">{s.name}</span>
                        {sessions.length > 1 && (
                            <X
                                className="size-3 opacity-0 group-hover:opacity-60 hover:opacity-100 transition-opacity"
                                onClick={(e) => {
                                    e.stopPropagation()
                                    deleteSession(s.id)
                                }}
                            />
                        )}
                    </div>
                ))}
                <Button
                    variant="ghost"
                    size="icon"
                    className="size-7 rounded-lg shrink-0"
                    onClick={() => createSession()}
                >
                    <Plus className="size-3.5" />
                </Button>
            </div>

            <div className="flex-1 overflow-y-auto p-4 custom-scrollbar" ref={scrollRef}>
                <div className="space-y-4">
                    {activeSession?.messages.map((msg, i) => (
                        <div key={i} className={cn("flex flex-col gap-2", msg.role === "user" ? "items-end" : "items-start")}>
                            <div className={cn(
                                "max-w-[85%] rounded-2xl px-4 py-2.5 text-[13px] leading-relaxed",
                                msg.role === "user"
                                    ? "bg-[#0071e3] text-white rounded-tr-none"
                                    : "bg-black/[0.04] dark:bg-white/[0.05] text-[#1d1d1f] dark:text-[#f5f5f7] rounded-tl-none border border-black/[0.06] dark:border-white/[0.06]"
                            )}>
                                {msg.content}
                                {msg.role === "assistant" && msg.content.includes("```json") && (
                                    <Button
                                        variant="outline"
                                        size="sm"
                                        className="mt-3 w-full gap-2 border-[#0071e3]/20 hover:bg-[#0071e3]/10"
                                        onClick={() => handleApplyAll(msg.content)}
                                    >
                                        <Wand2 className="size-3.5" />
                                        Apply Project Files
                                    </Button>
                                )}
                            </div>
                        </div>
                    ))}
                    {isStreaming && (
                        <div className="flex flex-col gap-2 items-start">
                            <div className="max-w-[85%] rounded-2xl rounded-tl-none px-4 py-2.5 text-[13px] leading-relaxed bg-black/[0.04] dark:bg-white/[0.05] text-[#1d1d1f] dark:text-[#f5f5f7] border border-black/[0.06] dark:border-white/[0.06]">
                                {currentStreamedMessage}
                                <span className="inline-block w-1.5 h-4 ml-1 bg-[#0071e3] animate-pulse align-middle" />
                            </div>
                        </div>
                    )}
                </div>
            </div>

        </div>
    )
}
