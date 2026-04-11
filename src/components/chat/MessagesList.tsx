import type React from "react";
import type { Message } from "ai";
import { forwardRef } from "react";
import ChatMessage from "./ChatMessage";
import { SetupBanner } from "../SetupBanner";
import { useSettings } from "@/hooks/useSettings";
import { useStreamChat } from "@/hooks/useStreamChat";
import { selectedChatIdAtom } from "@/atoms/chatAtoms";
import { useAtom, useAtomValue } from "jotai";
import { RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";

interface MessagesListProps {
  messages: Message[];
  messagesEndRef: React.RefObject<HTMLDivElement | null>;
}

export const MessagesList = forwardRef<HTMLDivElement, MessagesListProps>(
  function MessagesList({ messages, messagesEndRef }, ref) {
    const { streamMessage, isStreaming, error, setError } = useStreamChat();
    const { isAnyProviderSetup } = useSettings();
    const selectedChatId = useAtomValue(selectedChatIdAtom);
    return (
      <div className="flex-1 overflow-y-auto px-4 md:px-8 py-6 flex flex-col items-center w-full" ref={ref}>
        <div className="w-full max-w-3xl flex-1 flex flex-col">
        {messages.length > 0 ? (
          messages.map((message, index) => (
            <ChatMessage key={index} message={message} />
          ))
        ) : (
          <div className="flex flex-col items-center justify-center h-full max-w-2xl mx-auto opacity-80 mt-12 mb-16">
            <div className="flex flex-col items-center justify-center mb-8">
              <div className="w-16 h-16 bg-secondary/50 rounded-2xl flex items-center justify-center mb-6 border border-border/50 shadow-soft transition-all hover:scale-[1.02] duration-300">
                <span className="text-3xl opacity-80">✨</span>
              </div>
              <h3 className="text-[26px] font-semibold tracking-tight text-foreground mb-2">How can I help you today?</h3>
              <p className="text-[15px] text-muted-foreground/80">Select an option below or type a message to begin.</p>
            </div>
            {!isAnyProviderSetup() && <SetupBanner />}
          </div>
        )}
        {messages.length > 0 && !isStreaming && (
          <div className="flex justify-center mt-6 mb-4 w-full">
            <Button
              variant="outline"
              size="sm"
              className="rounded-full shadow-soft hover:shadow-hover border-border/80 transition-all duration-300 px-5 bg-card text-muted-foreground hover:text-foreground"
              onClick={() => {
                if (!selectedChatId) {
                  console.error("No chat selected");
                  return;
                }
                // Find the last user message
                const lastUserMessage = [...messages]
                  .reverse()
                  .find((message) => message.role === "user");
                if (!lastUserMessage) {
                  console.error("No user message found");
                  return;
                }
                streamMessage({
                  prompt: lastUserMessage.content,
                  chatId: selectedChatId,
                  redo: true,
                });
              }}
            >
              <RefreshCw size={16} />
              Retry
            </Button>
          </div>
        )}
        <div ref={messagesEndRef} className="h-6" />
        </div>
      </div>
    );
  }
);
