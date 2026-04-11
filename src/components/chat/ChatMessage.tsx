import { memo } from "react";
import type { Message } from "ai";
import { CuriosityEngineMarkdownParser } from "./CuriosityEngineMarkdownParser";
import { motion } from "framer-motion";
import { useStreamChat } from "@/hooks/useStreamChat";

interface ChatMessageProps {
  message: Message;
}

const ChatMessage = memo(
  ({ message }: ChatMessageProps) => {
    return (
      <div
        className={`flex w-full mb-8 ${
          message.role === "assistant" ? "justify-start" : "justify-end"
        }`}
      >
        <div
          className={`transition-all duration-200 mt-2 ${
            message.role === "assistant"
              ? "w-full max-w-3xl mx-auto py-2 px-2"
              : "bg-primary/5 text-foreground border border-primary/10 dark:bg-primary/20 dark:border-primary/20 rounded-2xl px-5 py-3.5 max-w-[85%] shadow-sm"
          }`}
        >
          {message.role === "assistant" && !message.content ? (
            <div className="flex h-6 items-center space-x-2 p-2">
              <motion.div
                className="h-3 w-3 rounded-full bg-(--primary) dark:bg-blue-500"
                animate={{ y: [0, -12, 0] }}
                transition={{
                  repeat: Number.POSITIVE_INFINITY,
                  duration: 0.4,
                  ease: "easeOut",
                  repeatDelay: 1.2,
                }}
              />
              <motion.div
                className="h-3 w-3 rounded-full bg-(--primary) dark:bg-blue-500"
                animate={{ y: [0, -12, 0] }}
                transition={{
                  repeat: Number.POSITIVE_INFINITY,
                  duration: 0.4,
                  ease: "easeOut",
                  delay: 0.4,
                  repeatDelay: 1.2,
                }}
              />
              <motion.div
                className="h-3 w-3 rounded-full bg-(--primary) dark:bg-blue-500"
                animate={{ y: [0, -12, 0] }}
                transition={{
                  repeat: Number.POSITIVE_INFINITY,
                  duration: 0.4,
                  ease: "easeOut",
                  delay: 0.8,
                  repeatDelay: 1.2,
                }}
              />
            </div>
          ) : (
            <div
              className="prose dark:prose-invert prose-headings:mb-3 prose-headings:font-semibold prose-p:my-2 prose-pre:my-0 max-w-none text-base leading-relaxed tracking-[0.01em]"
              suppressHydrationWarning
            >
              <CuriosityEngineMarkdownParser content={message.content} />
            </div>
          )}
        </div>
      </div>
    );
  },
  (prevProps, nextProps) => {
    return prevProps.message.content === nextProps.message.content;
  }
);

ChatMessage.displayName = "ChatMessage";

export default ChatMessage;
