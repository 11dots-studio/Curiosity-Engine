"use client"

import React, { useState, useEffect, useRef } from "react"
import { useAI } from "@/context/AIContext"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Sparkles, X, Check, Loader2 } from "lucide-react"
import { cn } from "@/lib/utils"

interface InlineEditProps {
    selection: { startLine: number; endLine: number } | null
    onApply: (content: string) => void
    onCancel: () => void
    fileContext: string
}

export const InlineEdit = ({ selection, onApply, onCancel, fileContext }: InlineEditProps) => {
    const [input, setInput] = useState("")
    const { sendMessage, isStreaming, currentStreamedMessage } = useAI()
    const [result, setResult] = useState("")
    const inputRef = useRef<HTMLInputElement>(null)

    useEffect(() => {
        if (inputRef.current) inputRef.current.focus()
    }, [])

    const handleSubmit = async () => {
        if (!input.trim() || isStreaming) return

        const prompt = `
Refactor the following code based on this instruction: "${input}"

File Context:
${fileContext}

Selected Code (Lines ${selection?.startLine}-${selection?.endLine}):
${fileContext.split("\n").slice((selection?.startLine || 1) - 1, selection?.endLine).join("\n")}

Respond ONLY with the refactored code block for the selection. No markdown, no explanation.
`
        await sendMessage(prompt, "You are a code refactoring expert. Return ONLY the code.")
    }

    useEffect(() => {
        if (!isStreaming && currentStreamedMessage) {
            setResult(currentStreamedMessage)
        }
    }, [isStreaming, currentStreamedMessage])

    return (
        <div className="flex flex-col gap-2 p-2 bg-white dark:bg-[#1c1c1e] border border-black/[0.1] dark:border-white/[0.1] rounded-lg shadow-2xl animate-in fade-in slide-in-from-top-2 duration-200 w-[400px]">
            <div className="flex items-center gap-2">
                <Sparkles className="size-3.5 text-[#0071e3]" />
                <Input
                    ref={inputRef}
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    onKeyDown={(e) => {
                        if (e.key === "Enter") handleSubmit()
                        if (e.key === "Escape") onCancel()
                    }}
                    placeholder="Refactor this code..."
                    className="h-8 text-[12px] bg-transparent border-none focus-visible:ring-0 px-0"
                />
                {isStreaming ? (
                    <Loader2 className="size-4 animate-spin text-[#86868b]" />
                ) : (
                    <Button variant="ghost" size="icon" className="size-6" onClick={onCancel}>
                        <X className="size-3.5" />
                    </Button>
                )}
            </div>

            {currentStreamedMessage && (
                <div className="flex flex-col gap-2 border-t border-black/[0.06] dark:border-white/[0.06] pt-2">
                    <pre className="text-[11px] font-mono p-2 bg-black/[0.02] dark:bg-white/[0.02] rounded overflow-x-auto max-h-[200px]">
                        {currentStreamedMessage}
                    </pre>
                    <div className="flex justify-end gap-2">
                        <Button variant="ghost" size="sm" className="h-7 text-[11px]" onClick={onCancel}>Discard</Button>
                        <Button size="sm" className="h-7 text-[11px] bg-[#0071e3] hover:bg-[#005bb5]" onClick={() => onApply(currentStreamedMessage)}>
                            <Check className="size-3 mr-1" /> Apply
                        </Button>
                    </div>
                </div>
            )}
        </div>
    )
}
