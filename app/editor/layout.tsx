"use client"

import { EditorProvider } from "@/context/EditorContext"
import { AIProvider } from "@/context/AIContext"
import { SidebarProvider } from "@/components/ui/sidebar"

export default function EditorLayout({
    children,
}: {
    children: React.ReactNode
}) {
    return (
        <EditorProvider>
            <AIProvider>
                <SidebarProvider className="flex flex-col h-screen w-full overflow-hidden bg-[#fafafa] dark:bg-[#141414] text-[#1d1d1f] dark:text-[#f5f5f7] selection:bg-[#0071e3]/15 dark:selection:bg-[#0a84ff]/20 p-0 m-0">
                    {children}
                </SidebarProvider>
            </AIProvider>
        </EditorProvider>
    )
}
