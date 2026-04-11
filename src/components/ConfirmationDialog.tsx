import React from "react";

interface ConfirmationDialogProps {
  isOpen: boolean;
  title: string;
  message: string;
  confirmText?: string;
  cancelText?: string;
  confirmButtonClass?: string;
  onConfirm: () => void;
  onCancel: () => void;
}

export default function ConfirmationDialog({
  isOpen,
  title,
  message,
  confirmText = "Confirm",
  cancelText = "Cancel",
  confirmButtonClass = "bg-red-600 hover:bg-red-700 focus:ring-red-500",
  onConfirm,
  onCancel,
}: ConfirmationDialogProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      <div className="flex min-h-screen items-center justify-center p-4 text-center sm:p-0">
        <div
          className="fixed inset-0 bg-background/60 backdrop-blur-sm transition-opacity"
          onClick={onCancel}
        />

        <div className="relative transform overflow-hidden rounded-[28px] bg-card text-left shadow-elevated transition-all sm:my-8 sm:w-full sm:max-w-lg border border-border/60">
          <div className="bg-card px-4 pb-4 pt-5 sm:p-8 sm:pb-6">
            <div className="sm:flex sm:items-start">
              <div className="mx-auto flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-2xl bg-destructive/10 sm:mx-0 sm:h-12 sm:w-12 border border-destructive/20">
                <svg
                  className="h-6 w-6 text-destructive"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
                  />
                </svg>
              </div>
              <div className="mt-4 text-center sm:ml-6 sm:mt-0 sm:text-left">
                <h3 className="text-xl font-semibold leading-tight text-foreground tracking-tight">
                  {title}
                </h3>
                <div className="mt-3">
                  <p className="text-[15px] text-muted-foreground/90 leading-relaxed font-medium">
                    {message}
                  </p>
                </div>
              </div>
            </div>
          </div>
          <div className="bg-secondary/40 px-6 py-4 sm:flex sm:flex-row-reverse sm:px-8 gap-3 border-t border-border/40">
            <button
              type="button"
              className={`inline-flex w-full justify-center rounded-xl px-5 py-2.5 text-sm font-semibold text-white shadow-soft transition-all active:scale-95 sm:w-auto ${confirmButtonClass}`}
              onClick={onConfirm}
            >
              {confirmText}
            </button>
            <button
              type="button"
              className="mt-3 inline-flex w-full justify-center rounded-xl border border-border bg-background px-5 py-2.5 text-sm font-semibold text-foreground shadow-sm hover:bg-secondary transition-all active:scale-95 sm:mt-0 sm:w-auto"
              onClick={onCancel}
            >
              {cancelText}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
