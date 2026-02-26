import { Search, Mic } from "lucide-react"

export function GlobalSearchBar() {
    return (
        <>
            <div className="fixed bottom-0 left-0 right-0 h-24 bg-gradient-to-t from-black/[0.02] dark:from-black/40 to-transparent pointer-events-none z-40" />
            <div className="fixed bottom-8 left-1/2 -translate-x-1/2 z-50 w-[90%] max-w-2xl px-4">
                <div className="flex items-center gap-2 px-4 py-2.5 bg-white/95 dark:bg-[#1c1c1e]/95 border border-black/[0.08] dark:border-white/[0.08] rounded-full shadow-[0_8px_32px_rgba(0,0,0,0.08)] dark:shadow-[0_12px_48px_rgba(0,0,0,0.4)] backdrop-blur-xl transition-all duration-200 ease-out focus-within:ring-2 focus-within:ring-[#0071e3]/30 dark:focus-within:ring-[#0a84ff]/30 ring-1 ring-black/[0.04] group/search">
                    <Search className="size-4 text-[#86868b] group-focus-within:text-[#0071e3] transition-colors" />
                    <input
                        type="text"
                        placeholder="Ask Curiosity Engine..."
                        className="flex-1 bg-transparent border-none outline-none text-[15px] px-1 text-[#1d1d1f] dark:text-[#f5f5f7] placeholder:text-[#86868b] font-[450]"
                    />
                    <button className="p-1.5 hover:bg-black/[0.06] dark:hover:bg-white/[0.10] rounded-full transition-all duration-150 text-[#86868b] hover:text-[#1d1d1f] dark:hover:text-[#f5f5f7]">
                        <Mic className="size-4" />
                    </button>
                </div>
            </div>
        </>
    )
}
