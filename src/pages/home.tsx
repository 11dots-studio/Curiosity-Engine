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

const getGreeting = () => {
  const hour = new Date().getHours();
  if (hour < 12) {
    const greetings = [
      "Good morning, Aatharva.",
      "Ready to build something great today?",
      "Good morning! Let's write some code.",
      "Morning! Let's shape your ideas."
    ];
    return greetings[Math.floor(Math.random() * greetings.length)];
  } else if (hour < 18) {
    const greetings = [
      "Good afternoon, Aatharva.",
      "What are we building next?",
      "Good afternoon! Let's ship something awesome.",
      "Afternoon! Time to focus and build."
    ];
    return greetings[Math.floor(Math.random() * greetings.length)];
  } else if (hour < 22) {
    const greetings = [
      "Good evening, Aatharva.",
      "Let's ship something awesome tonight.",
      "Good evening. Ready for a coding session?",
      "Hope you had a great day. Let's code."
    ];
    return greetings[Math.floor(Math.random() * greetings.length)];
  } else {
    const greetings = [
      "Working late tonight?",
      "Late night coding session?",
      "The best code is written at night.",
      "Still awake? Let's build something cool."
    ];
    return greetings[Math.floor(Math.random() * greetings.length)];
  }
};

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
  const [greeting, setGreeting] = useState("");

  useEffect(() => {
    setGreeting(getGreeting());
  }, []);

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
    <div className="flex flex-col items-center justify-center min-h-[85vh] max-w-[800px] mx-auto px-6 py-12 animate-in fade-in duration-700 zoom-in-95">
      <div className="w-full flex flex-col items-center mb-10 space-y-2">
        <h2 className="text-[16px] text-muted-foreground font-medium tracking-wide">
          {greeting || "Hello, Aatharva."}
        </h2>
        <h1 className="text-[40px] sm:text-[46px] font-semibold tracking-tight text-foreground leading-tight text-center drop-shadow-sm">
          What do you want to build?
        </h1>
      </div>

      {!isAnyProviderSetup() && <div className="mb-8 w-full"><SetupBanner /></div>}

      <div className="w-full flex flex-col items-center">
        <div className="w-full">
          <ChatInput onSubmit={handleSubmit} variant="landing" />
        </div>

        <div className="flex flex-wrap justify-center gap-4 mt-12 w-full max-w-[640px]">
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
              className="px-[18px] py-[10px] rounded-full text-[13px] font-medium transition-all duration-200 
                         bg-secondary/40 text-secondary-foreground/90 border border-border/80
                         hover:bg-secondary/90 hover:border-border hover:shadow-soft hover:-translate-y-[2px] active:scale-[0.98] cursor-pointer"
            >
              {label}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
