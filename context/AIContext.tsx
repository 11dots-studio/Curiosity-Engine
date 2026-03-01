"use client"

import React, { createContext, useContext, useState, useCallback, useRef, useEffect } from "react"
import { v4 as uuidv4 } from "uuid"

export interface Message {
    role: "user" | "assistant" | "system"
    content: string
}

export interface AISession {
    id: string
    name: string
    messages: Message[]
    createdAt: number
}

interface AIContextValue {
    sessions: AISession[]
    activeSessionId: string
    activeSession: AISession | undefined
    isStreaming: boolean
    currentStreamedMessage: string
    sendMessage: (content: string, systemPrompt?: string) => Promise<void>
    createSession: (name?: string) => string
    switchSession: (id: string) => void
    deleteSession: (id: string) => void
    clearChat: () => void
    searchMode: "ai" | "web"
    setSearchMode: (mode: "ai" | "web") => void
}

const AIContext = createContext<AIContextValue | null>(null)

export function AIProvider({ children }: { children: React.ReactNode }) {
    const [sessions, setSessions] = useState<AISession[]>([])
    const [activeSessionId, setActiveSessionId] = useState<string>("")
    const [isStreaming, setIsStreaming] = useState(false)
    const [currentStreamedMessage, setCurrentStreamedMessage] = useState("")
    const abortControllerRef = useRef<AbortController | null>(null)

    // Initialize with a default session if none exist
    useEffect(() => {
        if (sessions.length === 0) {
            const id = uuidv4()
            const newSession: AISession = {
                id,
                name: "New Chat",
                messages: [],
                createdAt: Date.now()
            }
            setSessions([newSession])
            setActiveSessionId(id)
        }
    }, [sessions.length])

    const activeSession = sessions.find(s => s.id === activeSessionId)

    const createSession = useCallback((name = "New Chat") => {
        const id = uuidv4()
        const newSession: AISession = {
            id,
            name,
            messages: [],
            createdAt: Date.now()
        }
        setSessions(prev => [newSession, ...prev])
        setActiveSessionId(id)
        return id
    }, [])

    const switchSession = useCallback((id: string) => {
        setActiveSessionId(id)
    }, [])

    const deleteSession = useCallback((id: string) => {
        setSessions(prev => {
            const filtered = prev.filter(s => s.id !== id)
            if (filtered.length === 0) {
                const newId = uuidv4()
                return [{ id: newId, name: "New Chat", messages: [], createdAt: Date.now() }]
            }
            return filtered
        })
        if (activeSessionId === id) {
            setSessions(prev => {
                const filtered = prev.filter(s => s.id !== id)
                if (filtered.length > 0) setActiveSessionId(filtered[0].id)
                return prev
            })
        }
    }, [activeSessionId])

    const sendMessage = useCallback(async (content: string, systemPrompt?: string) => {
        if (!content.trim() || !activeSessionId) return

        const userMessage: Message = { role: "user", content }

        // Update active session locally
        setSessions(prev => prev.map(s => {
            if (s.id === activeSessionId) {
                // Auto-rename if first message
                const name = s.messages.length === 0 ? content.slice(0, 30) + (content.length > 30 ? "..." : "") : s.name
                return { ...s, name, messages: [...s.messages, userMessage] }
            }
            return s
        }))

        setIsStreaming(true)
        setCurrentStreamedMessage("")

        if (abortControllerRef.current) {
            abortControllerRef.current.abort()
        }
        abortControllerRef.current = new AbortController()

        try {
            const currentMessages = activeSession?.messages || []
            const response = await fetch("/api/chat", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    messages: [...currentMessages, userMessage],
                    systemPrompt,
                }),
                signal: abortControllerRef.current.signal,
            })

            if (!response.ok) throw new Error("Failed to fetch AI response")

            const reader = response.body?.getReader()
            const decoder = new TextDecoder()
            let assistantContent = ""

            if (reader) {
                while (true) {
                    const { done, value } = await reader.read()
                    if (done) break

                    const chunk = decoder.decode(value)
                    const lines = chunk.split("\n")
                    for (const line of lines) {
                        if (line.startsWith("data: ")) {
                            const dataStr = line.replace("data: ", "").trim()
                            if (dataStr === "[DONE]") break
                            try {
                                const data = JSON.parse(dataStr)
                                const contentChunk = data.choices[0]?.delta?.content || ""
                                assistantContent += contentChunk
                                setCurrentStreamedMessage(assistantContent)
                            } catch (e) {
                                // Ignore parse errors for incomplete chunks
                            }
                        }
                    }
                }
            }

            setSessions(prev => prev.map(s => {
                if (s.id === activeSessionId) {
                    return { ...s, messages: [...s.messages, { role: "assistant", content: assistantContent }] }
                }
                return s
            }))
        } catch (error: any) {
            if (error.name !== "AbortError") {
                console.error("Chat Error:", error)
                setSessions(prev => prev.map(s => {
                    if (s.id === activeSessionId) {
                        return { ...s, messages: [...s.messages, { role: "assistant", content: "Sorry, I encountered an error." }] }
                    }
                    return s
                }))
            }
        } finally {
            setIsStreaming(false)
            setCurrentStreamedMessage("")
            abortControllerRef.current = null
        }
    }, [activeSessionId, activeSession?.messages])

    const clearChat = useCallback(() => {
        setSessions(prev => prev.map(s => {
            if (s.id === activeSessionId) {
                return { ...s, messages: [] }
            }
            return s
        }))
        setCurrentStreamedMessage("")
        if (abortControllerRef.current) {
            abortControllerRef.current.abort()
        }
    }, [activeSessionId])

    const [searchMode, setSearchMode] = useState<"ai" | "web">("ai")

    return (
        <AIContext.Provider value={{
            sessions,
            activeSessionId,
            activeSession,
            isStreaming,
            sendMessage,
            createSession,
            switchSession,
            deleteSession,
            clearChat,
            currentStreamedMessage,
            searchMode,
            setSearchMode,
        }}>
            {children}
        </AIContext.Provider>
    )
}

export function useAI() {
    const ctx = useContext(AIContext)
    if (!ctx) throw new Error("useAI must be used within AIProvider")
    return ctx
}
