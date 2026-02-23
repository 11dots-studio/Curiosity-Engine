import { Search, Mic } from "lucide-react"

export function GlobalSearchBar() {
    return (
        <>
            <div className="fixed bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-zinc-50 dark:from-zinc-950 to-transparent pointer-events-none z-40" />
            <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 w-[90%] max-w-2xl">
                <div className="flex items-center gap-2 px-4 py-3 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-full shadow-lg hover:shadow-xl transition-shadow ring-1 ring-zinc-200/50 dark:ring-zinc-800/50">
                    <Search className="size-5 text-zinc-400" />
                    <input
                        type="text"
                        placeholder="Ask Curiosity Engine..."
                        className="flex-1 bg-transparent border-none outline-none text-sm px-2 text-zinc-900 dark:text-zinc-100 placeholder:text-zinc-500"
                    />
                    <button className="p-1.5 hover:bg-zinc-100 dark:hover:bg-zinc-800 rounded-full transition-colors text-zinc-400">
                        <Mic className="size-5" />
                    </button>
                </div>
            </div>
        </>
    )
}
