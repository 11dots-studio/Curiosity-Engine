import { useAtomValue } from "jotai";
import { selectedAppIdAtom } from "../../atoms/appAtoms";
import { PreviewIframe } from "./PreviewIframe";
import {
  ChevronDown,
  ChevronUp,
  Logs,
  RefreshCw,
} from "lucide-react";
import { useEffect, useRef, useState, useCallback } from "react";
import { PanelGroup, Panel, PanelResizeHandle } from "react-resizable-panels";
import { Console } from "./Console";
import { useRunApp } from "@/hooks/useRunApp";

interface PreviewHeaderProps {
  onRestart: () => void;
}

// Preview Header component
const PreviewHeader = ({ onRestart }: PreviewHeaderProps) => (
  <div className="flex items-center justify-between px-4 py-2 border-b border-border">
    <span className="text-sm font-medium">Preview</span>
    <button
      onClick={onRestart}
      className="flex items-center space-x-1 px-3 py-1 rounded-md text-sm hover:bg-[var(--background-darkest)] transition-colors"
      title="Restart App"
    >
      <RefreshCw size={16} />
      <span>Restart</span>
    </button>
  </div>
);

// Console header component
const ConsoleHeader = ({
  isOpen,
  onToggle,
}: {
  isOpen: boolean;
  onToggle: () => void;
}) => (
  <div
    onClick={onToggle}
    className="flex items-center gap-2 px-4 py-1.5 border-t border-border cursor-pointer hover:bg-[var(--background-darkest)] transition-colors"
  >
    <Logs size={16} />
    <span className="text-sm font-medium">System Messages</span>
    <div className="flex-1" />
    {isOpen ? <ChevronDown size={16} /> : <ChevronUp size={16} />}
  </div>
);

// Main PreviewPanel component
export function PreviewPanel() {
  const selectedAppId = useAtomValue(selectedAppIdAtom);
  const [isConsoleOpen, setIsConsoleOpen] = useState(false);
  const { runApp, stopApp, restartApp, error, loading } = useRunApp();
  const runningAppIdRef = useRef<number | null>(null);

  const handleRestart = useCallback(() => {
    if (selectedAppId !== null) {
      restartApp(selectedAppId);
    }
  }, [selectedAppId, restartApp]);

  useEffect(() => {
    const previousAppId = runningAppIdRef.current;

    // Check if the selected app ID has changed
    if (selectedAppId !== previousAppId) {
      // Stop the previously running app, if any
      if (previousAppId !== null) {
        console.debug("Stopping previous app", previousAppId);
        stopApp(previousAppId);
      }

      // Start the new app if an ID is selected
      if (selectedAppId !== null) {
        console.debug("Starting new app", selectedAppId);
        runApp(selectedAppId);
        runningAppIdRef.current = selectedAppId;
      } else {
        runningAppIdRef.current = null;
      }
    }

    const appToStopOnUnmount = runningAppIdRef.current;
    return () => {
      if (appToStopOnUnmount !== null) {
        const currentRunningApp = runningAppIdRef.current;
        if (currentRunningApp !== null) {
          console.debug(
            "Component unmounting or selectedAppId changing, stopping app",
            currentRunningApp
          );
          stopApp(currentRunningApp);
          runningAppIdRef.current = null;
        }
      }
    };
  }, [selectedAppId, runApp, stopApp]);

  return (
    <div className="flex flex-col h-full">
      <PreviewHeader onRestart={handleRestart} />
      <div className="flex-1 overflow-hidden">
        <PanelGroup direction="vertical">
          <Panel id="content" minSize={30}>
            <div className="h-full overflow-y-auto">
              <PreviewIframe loading={loading} error={error} />
            </div>
          </Panel>
          {isConsoleOpen && (
            <>
              <PanelResizeHandle className="h-1 bg-border hover:bg-gray-400 transition-colors cursor-row-resize" />
              <Panel id="console" minSize={10} defaultSize={30}>
                <div className="flex flex-col h-full">
                  <ConsoleHeader
                    isOpen={true}
                    onToggle={() => setIsConsoleOpen(false)}
                  />
                  <Console />
                </div>
              </Panel>
            </>
          )}
        </PanelGroup>
      </div>
      {!isConsoleOpen && (
        <ConsoleHeader isOpen={false} onToggle={() => setIsConsoleOpen(true)} />
      )}
    </div>
  );
}
