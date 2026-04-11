import { SendIcon, StopCircleIcon, X, Plus, Settings2, Mic } from "lucide-react";
import type React from "react";
import { useEffect, useRef, useState } from "react";
import { ModelPicker } from "@/components/ModelPicker";
import { useSettings } from "@/hooks/useSettings";
import { IpcClient } from "@/ipc/ipc_client";
import { chatInputValueAtom } from "@/atoms/chatAtoms";
import { useAtom } from "jotai";
import { useStreamChat } from "@/hooks/useStreamChat";
import { useChats } from "@/hooks/useChats";
import { useLoadApp } from "@/hooks/useLoadApp";
import { selectedAppIdAtom } from "@/atoms/appAtoms";
import { showInfo } from "@/lib/toast";

interface ChatInputProps {
  chatId?: number;
  onSubmit?: () => void;
  variant?: "landing" | "workspace";
}

export function ChatInput({ chatId, onSubmit, variant = "workspace" }: ChatInputProps) {
  const [inputValue, setInputValue] = useAtom(chatInputValueAtom);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const { settings, updateSettings } = useSettings();
  const { streamMessage, isStreaming, setIsStreaming, error, setError } =
    useStreamChat();
  const [selectedAppId] = useAtom(selectedAppIdAtom);
  const [showError, setShowError] = useState(true);

  const adjustHeight = () => {
    const textarea = textareaRef.current;
    if (textarea) {
      textarea.style.height = "0px";
      const scrollHeight = textarea.scrollHeight;
      console.log("scrollHeight", scrollHeight);
      textarea.style.height = `${scrollHeight + 4}px`;
    }
  };

  useEffect(() => {
    adjustHeight();
  }, [inputValue]);

  useEffect(() => {
    if (error) {
      setShowError(true);
    }
  }, [error]);

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      submitHandler();
    }
  };

  const handleSubmit = async () => {
    if (!inputValue.trim() || isStreaming || !chatId) {
      return;
    }

    const currentInput = inputValue;
    setInputValue("");
    await streamMessage({ prompt: currentInput, chatId });
  };
  const submitHandler = onSubmit ? onSubmit : handleSubmit;

  const handleCancel = () => {
    if (chatId) {
      IpcClient.getInstance().cancelChatStream(chatId);
    }
    setIsStreaming(false);
  };

  const dismissError = () => {
    setShowError(false);
  };

  if (!settings) {
    return null; // Or loading state
  }

  if (variant === "landing") {
    return (
      <div className="w-full max-w-3xl mx-auto">
        {error && showError && (
          <div className="relative mb-4 bg-red-50 border border-red-200 rounded-[16px] shadow-sm p-3">
            <button
              onClick={dismissError}
              className="absolute top-2 right-2 p-1 hover:bg-red-100 rounded"
            >
              <X size={16} className="text-red-500" />
            </button>
            <div className="pr-8 text-sm text-red-700">{error}</div>
          </div>
        )}
        <div className="flex flex-col bg-card border border-border/60 hover:border-border rounded-full shadow-elevated focus-within:ring-2 focus-within:ring-primary/20 transition-all duration-300">
          <div className="flex items-end px-3 py-2 min-h-[64px]">
            <div className="flex items-center gap-1.5 pb-1.5 mr-2">
              <button
                type="button"
                onClick={() => showInfo("Tools coming soon")}
                className="p-2.5 rounded-full text-muted-foreground hover:text-foreground hover:bg-secondary/60 transition-colors"
                title="Tools"
              >
                <Plus size={22} className="opacity-90" />
              </button>
              <div className="hidden sm:block">
                <ModelPicker
                  selectedModel={settings.selectedModel}
                  onModelSelect={(model) =>
                    updateSettings({ selectedModel: model })
                  }
                />
              </div>
            </div>

            <textarea
              ref={textareaRef}
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder="Ask Curiosity Engine to build..."
              className="flex-1 bg-transparent text-foreground placeholder:text-muted-foreground outline-none focus:outline-none resize-none pt-3.5 pb-3 text-[17px] leading-relaxed max-h-[200px]"
              rows={1}
              disabled={isStreaming}
            />

            <div className="flex items-center gap-2 pb-1 ml-2">
              {isStreaming ? (
                <button
                  onClick={handleCancel}
                  className="p-3 bg-secondary hover:bg-secondary/80 text-secondary-foreground rounded-full transition-all duration-200 hover:scale-105 active:scale-95"
                  title="Cancel generation"
                >
                  <StopCircleIcon size={20} />
                </button>
              ) : inputValue.trim() ? (
                <button
                  onClick={submitHandler}
                  className="p-3 bg-primary text-primary-foreground hover:bg-primary/90 rounded-full transition-all duration-200 hover:scale-105 active:scale-95 shadow-sm"
                >
                  <SendIcon size={20} />
                </button>
              ) : (
                <button
                  type="button"
                  onClick={() => showInfo("Voice input coming soon")}
                  className="p-2.5 rounded-full text-muted-foreground hover:text-foreground hover:bg-secondary/60 transition-colors"
                  title="Voice input"
                >
                  <Mic size={22} className="opacity-90" />
                </button>
              )}
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <>
      {error && showError && (
        <div className="relative mt-2 bg-red-50 border border-red-200 rounded-md shadow-sm p-2">
          <button
            onClick={dismissError}
            className="absolute top-1 left-1 p-1 hover:bg-red-100 rounded"
          >
            <X size={14} className="text-red-500" />
          </button>
          <div className="px-6 py-1 text-sm">
            <div className="text-red-700 text-wrap">{error}</div>
          </div>
        </div>
      )}
      <div className="p-4 max-w-3xl mx-auto w-full">
        <div className="flex flex-col space-y-2 border border-border/80 rounded-2xl bg-card shadow-sm hover:shadow-md focus-within:shadow-md focus-within:border-primary/30 transition-all duration-300">
          <div className="flex items-start space-x-2 pt-2 px-2">
            <textarea
              ref={textareaRef}
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder="Ask Curiosity Engine to build..."
              className="flex-1 p-3 bg-transparent text-foreground placeholder:text-muted-foreground outline-none focus:outline-none overflow-y-auto min-h-[44px] max-h-[200px]"
              style={{ resize: "none" }}
              disabled={isStreaming}
            />
            {isStreaming ? (
              <button
                onClick={handleCancel}
                className="p-2.5 mt-1 mr-2 bg-secondary/50 hover:bg-secondary text-secondary-foreground rounded-xl transition-all duration-200 hover:scale-105 active:scale-95"
                title="Cancel generation"
              >
                <StopCircleIcon size={20} />
              </button>
            ) : (
              <button
                onClick={submitHandler}
                disabled={!inputValue.trim()}
                className="p-2.5 mt-1 mr-2 bg-primary text-primary-foreground hover:bg-primary/90 rounded-xl disabled:opacity-50 transition-all duration-200 hover:scale-105 active:scale-95"
              >
                <SendIcon size={20} />
              </button>
            )}
          </div>
          <div className="px-4 pb-3 flex justify-between items-center">
            <ModelPicker
              selectedModel={settings.selectedModel}
              onModelSelect={(model) =>
                updateSettings({ selectedModel: model })
              }
            />
          </div>
        </div>
      </div>
    </>
  );
}
