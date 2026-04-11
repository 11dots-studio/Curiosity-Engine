import { useState } from "react";
import { useTheme } from "../contexts/ThemeContext";
import { ProviderSettingsGrid } from "@/components/ProviderSettings";
import ConfirmationDialog from "@/components/ConfirmationDialog";
import { IpcClient } from "@/ipc/ipc_client";
import { showSuccess, showError } from "@/lib/toast";

export default function SettingsPage() {
  const { theme, setTheme } = useTheme();
  const [isResetDialogOpen, setIsResetDialogOpen] = useState(false);
  const [isResetting, setIsResetting] = useState(false);

  const handleResetEverything = async () => {
    setIsResetting(true);
    try {
      const ipcClient = IpcClient.getInstance();
      const result = await ipcClient.resetAll();
      if (result.success) {
        showSuccess("Successfully reset everything. Restart the application.");
      } else {
        showError(result.message || "Failed to reset everything.");
      }
    } catch (error) {
      console.error("Error resetting:", error);
      showError(
        error instanceof Error ? error.message : "An unknown error occurred"
      );
    } finally {
      setIsResetting(false);
      setIsResetDialogOpen(false);
    }
  };

  return (
    <div className="min-h-screen p-8">
      <div className="max-w-5xl mx-auto">
        <h1 className="text-3xl font-bold mb-8 text-foreground tracking-tight">
          Settings
        </h1>

        <div className="space-y-6">
          <div className="bg-card rounded-[24px] shadow-soft p-6 border border-border/80">
            <h2 className="text-lg font-semibold text-foreground mb-4">
              Appearance
            </h2>

            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <label className="text-sm font-medium text-muted-foreground/80 tracking-wide uppercase">
                  Theme
                </label>

                <div className="relative bg-secondary/60 rounded-xl p-1.5 flex border border-border/40">
                  {(["system", "light", "dark"] as const).map((option) => (
                    <button
                      key={option}
                      onClick={() => setTheme(option)}
                      className={`
                        px-4 py-1.5 text-sm font-medium rounded-lg
                        transition-all duration-200
                        ${
                          theme === option
                            ? "bg-background text-foreground shadow-sm border border-border/40"
                            : "text-muted-foreground hover:text-foreground hover:bg-secondary/80"
                        }
                      `}
                    >
                      {option.charAt(0).toUpperCase() + option.slice(1)}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>

          <div className="bg-card rounded-[24px] shadow-soft border border-border/80">
            <ProviderSettingsGrid configuredProviders={[]} />
          </div>

          {/* Danger Zone */}
          <div className="bg-card rounded-[24px] shadow-soft p-6 border-2 border-destructive/20 relative overflow-hidden">
            <div className="absolute inset-0 bg-destructive/5 pointer-events-none"></div>
            <h2 className="text-lg font-semibold text-destructive mb-4 relative z-10">
              Danger Zone
            </h2>

            <div className="space-y-4">
              <div className="flex items-start justify-between flex-col sm:flex-row sm:items-center gap-4">
                <div className="relative z-10">
                  <h3 className="text-sm font-medium text-foreground">
                    Reset Everything
                  </h3>
                  <p className="text-sm text-muted-foreground/80 mt-1">
                    This will delete all your apps, chats, and settings. This
                    action cannot be undone.
                  </p>
                </div>
                <button
                  onClick={() => setIsResetDialogOpen(true)}
                  disabled={isResetting}
                  className="rounded-md border border-transparent bg-red-600 px-4 py-2 text-sm font-medium text-white hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isResetting ? "Resetting..." : "Reset Everything"}
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      <ConfirmationDialog
        isOpen={isResetDialogOpen}
        title="Reset Everything"
        message="Are you sure you want to reset everything? This will delete all your apps, chats, and settings. This action cannot be undone."
        confirmText="Reset Everything"
        cancelText="Cancel"
        onConfirm={handleResetEverything}
        onCancel={() => setIsResetDialogOpen(false)}
      />
    </div>
  );
}
