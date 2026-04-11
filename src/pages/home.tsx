import { useNavigate, useSearch } from "@tanstack/react-router";
import { useAtom, useSetAtom } from "jotai";
import { chatInputValueAtom } from "../atoms/chatAtoms";
import { selectedAppIdAtom, appsListAtom } from "@/atoms/appAtoms";
import { IpcClient } from "@/ipc/ipc_client";
import { generateCuteAppName } from "@/lib/utils";
import { useLoadApps } from "@/hooks/useLoadApps";
import { useSettings } from "@/hooks/useSettings";
import { SetupBanner } from "@/components/SetupBanner";
import { ChatInput } from "@/components/chat/ChatInput";
import { isPreviewOpenAtom } from "@/atoms/viewAtoms";
import { useState, useEffect } from "react";
import { useStreamChat } from "@/hooks/useStreamChat";

export default function HomePage() {
  const [inputValue, setInputValue] = useAtom(chatInputValueAtom);
  const navigate = useNavigate();
  const search = useSearch({ from: "/" });
  const [appsList] = useAtom(appsListAtom);
  const setSelectedAppId = useSetAtom(selectedAppIdAtom);
  const { refreshApps } = useLoadApps();
  const { isAnyProviderSetup } = useSettings();
  const setIsPreviewOpen = useSetAtom(isPreviewOpenAtom);
  const [isLoading, setIsLoading] = useState(false);
  const { streamMessage } = useStreamChat();

  // Get the appId from search params
  const appId = search.appId ? Number(search.appId) : null;

  // Redirect to app details page if appId is present
  useEffect(() => {
    if (appId) {
      navigate({ to: "/app-details", search: { appId } });
    }
  }, [appId, navigate]);

  const handleSubmit = async () => {
    if (!inputValue.trim()) return;

    try {
      setIsLoading(true);
      // Create the chat and navigate
      const result = await IpcClient.getInstance().createApp({
        name: generateCuteAppName(),
        path: "./apps/foo",
      });

      // Add a 2-second timeout *after* the streamMessage call
      // This makes the loading UI feel less janky.
      streamMessage({ prompt: inputValue, chatId: result.chatId });
      await new Promise((resolve) => setTimeout(resolve, 2000));

      setInputValue("");
      setSelectedAppId(result.app.id);
      setIsPreviewOpen(false);
      refreshApps();
      navigate({ to: "/chat", search: { id: result.chatId } });
    } catch (error) {
      console.error("Failed to create chat:", error);
      setIsLoading(false);
    }
  };

  // Loading overlay
  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center max-w-3xl m-auto p-8">
        <div className="w-full flex flex-col items-center">
          <div className="relative w-24 h-24 mb-8">
            <div className="absolute top-0 left-0 w-full h-full border-8 border-gray-200 dark:border-gray-700 rounded-full"></div>
            <div className="absolute top-0 left-0 w-full h-full border-8 border-t-(--primary) rounded-full animate-spin"></div>
          </div>
          <h2 className="text-2xl font-bold mb-2 text-gray-800 dark:text-gray-200">
            Building your app
          </h2>
          <p className="text-gray-600 dark:text-gray-400 text-center max-w-md mb-8">
            We're setting up your app with AI magic. <br />
            This might take a moment...
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center justify-center min-h-[85vh] max-w-4xl mx-auto px-6 py-12 animate-in fade-in duration-700 zoom-in-95">
      <div className="w-full text-center mb-10 space-y-3">
        <h2 className="text-[18px] text-muted-foreground opacity-80 font-medium tracking-wide">
          Good {new Date().getHours() < 12 ? 'morning' : new Date().getHours() < 18 ? 'afternoon' : 'evening'}
        </h2>
        <h1 className="text-[44px] font-semibold tracking-[-0.5px] text-foreground leading-tight">
          Where should we start?
        </h1>
      </div>

      {!isAnyProviderSetup() && <div className="mb-6 w-full max-w-3xl mx-auto"><SetupBanner /></div>}

      <div className="w-full">
        <ChatInput onSubmit={handleSubmit} variant="landing" />

        <div className="flex flex-wrap justify-center gap-2.5 mt-8 max-w-2xl mx-auto">
          {[
            "Build a to-do app",
            "Design a landing page",
            "Create a blog template",
            "Build a weather dashboard",
            "Design a signup form"
          ].map((label, index) => (
            <button
              type="button"
              key={index}
              onClick={() => setInputValue(label)}
              className="px-[18px] py-[10px] rounded-full text-[14px] font-medium transition-all duration-200 
                         bg-secondary/40 text-secondary-foreground border border-black/5 dark:border-white/5
                         hover:bg-secondary/80 hover:shadow-sm active:scale-95"
            >
              {label}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
