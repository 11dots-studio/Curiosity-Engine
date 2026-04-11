
import { XCircle, AlertTriangle } from "lucide-react"; // Assuming lucide-react is used

interface ChatErrorProps {
  error: string | null;
  onDismiss: () => void;
}

export function ChatError({ error, onDismiss }: ChatErrorProps) {
  if (!error) {
    return null;
  }

  return (
    <div className="relative flex items-center gap-3 text-destructive bg-destructive/10 border border-destructive/20 rounded-xl text-sm px-4 py-3 mx-4 mb-4 shadow-soft animate-in slide-in-from-bottom-2 duration-300">
      <AlertTriangle
        className="h-5 w-5 flex-shrink-0 opacity-80"
        aria-hidden="true"
      />
      <span className="flex-1 font-medium leading-tight">{error}</span>
      <button
        onClick={onDismiss}
        className="p-1.5 rounded-lg hover:bg-destructive/10 text-destructive/60 hover:text-destructive transition-colors focus:outline-none"
        aria-label="Dismiss error"
      >
        <XCircle className="h-4.5 w-4.5" />
      </button>
    </div>
  );
}
