import { useAtom, useAtomValue } from "jotai";
import { selectedAppIdAtom, selectedVersionIdAtom } from "@/atoms/appAtoms";
import { useLoadVersions } from "@/hooks/useLoadVersions";
import { formatDistanceToNow } from "date-fns";
import { RotateCcw, X } from "lucide-react";
import type { Version } from "@/ipc/ipc_types";
import { IpcClient } from "@/ipc/ipc_client";
import { cn } from "@/lib/utils";
import { useEffect } from "react";

interface VersionPaneProps {
  isVisible: boolean;
  onClose: () => void;
}

export function VersionPane({ isVisible, onClose }: VersionPaneProps) {
  const appId = useAtomValue(selectedAppIdAtom);
  const { versions, loading, refreshVersions } = useLoadVersions(appId);
  const [selectedVersionId, setSelectedVersionId] = useAtom(
    selectedVersionIdAtom
  );
  useEffect(() => {
    // Refresh versions in case the user updated versions outside of the app
    // (e.g. manually using git).
    // Avoid loading state which causes brief flash of loading state.
    refreshVersions();
    if (!isVisible && selectedVersionId) {
      setSelectedVersionId(null);
      IpcClient.getInstance().checkoutVersion({
        appId: appId!,
        versionId: "main",
      });
    }
  }, [isVisible, refreshVersions]);
  if (!isVisible) {
    return null;
  }

  return (
    <div className="h-full border-l border-border bg-background/50 backdrop-blur-sm w-full animate-in slide-in-from-right duration-300">
      <div className="p-4 border-b border-border/60 flex items-center justify-between bg-card/50">
        <h2 className="text-[15px] font-semibold text-foreground tracking-tight pl-1">Version History</h2>
        <button
          onClick={onClose}
          className="p-1.5 hover:bg-secondary text-muted-foreground hover:text-foreground rounded-lg transition-all"
          aria-label="Close version pane"
        >
          <X size={18} />
        </button>
      </div>
      <div className="overflow-y-auto h-[calc(100%-60px)] custom-scrollbar">
        {loading ? (
          <div className="p-8 text-center text-sm text-muted-foreground flex flex-col items-center gap-2">
            <div className="w-5 h-5 border-2 border-primary/30 border-t-primary rounded-full animate-spin"></div>
            <span>Loading history...</span>
          </div>
        ) : versions.length === 0 ? (
          <div className="p-8 text-center text-sm text-muted-foreground">No versions available</div>
        ) : (
          <div className="flex flex-col">
            {versions.map((version: Version, index) => (
              <div
                key={version.oid}
                className={cn(
                  "px-5 py-4 cursor-pointer transition-all border-b border-border/40 group",
                  selectedVersionId === version.oid
                    ? "bg-secondary/80 border-l-4 border-l-primary shadow-inner"
                    : "hover:bg-secondary/40 border-l-4 border-l-transparent"
                )}
                onClick={() => {
                  IpcClient.getInstance().checkoutVersion({
                    appId: appId!,
                    versionId: version.oid,
                  });
                  setSelectedVersionId(version.oid);
                }}
              >
                <div className="flex items-center justify-between mb-1.5">
                  <span className="font-semibold text-[13px] text-foreground/90 uppercase tracking-widest">
                    v{versions.length - index}
                  </span>
                  <span className="text-[11px] font-medium text-muted-foreground bg-secondary px-2 py-0.5 rounded-md border border-border/50">
                    {formatDistanceToNow(new Date(version.timestamp * 1000), {
                      addSuffix: true,
                    })}
                  </span>
                </div>
                <div className="flex items-start justify-between gap-3">
                  {version.message && (
                    <p className="text-sm text-muted-foreground leading-relaxed flex-1 italic line-clamp-2">
                      "{version.message.startsWith(
                        "Reverted all changes back to version "
                      )
                        ? version.message.replace(
                            /Reverted all changes back to version ([a-f0-9]+)/,
                            (_, hash) => {
                              const targetIndex = versions.findIndex(
                                (v) => v.oid === hash
                              );
                              return targetIndex !== -1
                               ? `Reverted to v${versions.length - targetIndex}`
                                : version.message;
                            }
                          )
                        : version.message}"
                    </p>
                  )}

                  <button
                    onClick={async (e) => {
                      e.stopPropagation();
                      setSelectedVersionId(null);
                      await IpcClient.getInstance().revertVersion({
                        appId: appId!,
                        previousVersionId: version.oid,
                      });
                      refreshVersions();
                    }}
                    className={cn(
                      "opacity-0 scale-90 flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold bg-primary text-primary-foreground hover:shadow-soft rounded-lg transition-all",
                      selectedVersionId === version.oid && "opacity-100 scale-100",
                      "group-hover:opacity-100 group-hover:scale-100"
                    )}
                    aria-label="Undo to this version"
                  >
                    <RotateCcw size={13} strokeWidth={2.5} />
                    <span>Undo</span>
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
