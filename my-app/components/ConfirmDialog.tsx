"use client";

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

type ConfirmDialogProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title: string;
  message: string;
  confirmLabel?: string;
  cancelLabel?: string;
  onConfirm: () => void;
  // When true, the confirm button uses the destructive (red) style.
  destructive?: boolean;
  // Disables buttons and shows a pending label while an action is in flight.
  loading?: boolean;
};

// Reusable confirmation modal that matches the app's design, replacing the
// browser's native window.confirm() for destructive actions (user deletion,
// recommendation/applicant/advisor deletion, and any future confirmations).
export default function ConfirmDialog({
  open,
  onOpenChange,
  title,
  message,
  confirmLabel = "Confirm",
  cancelLabel = "Cancel",
  onConfirm,
  destructive = false,
  loading = false,
}: ConfirmDialogProps) {
  const confirmClasses = destructive
    ? "bg-red-600 hover:bg-red-700"
    : "bg-[#2F7FA8] hover:bg-[#286E92]";

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
          <DialogDescription>{message}</DialogDescription>
        </DialogHeader>

        <DialogFooter>
          <button
            type="button"
            onClick={() => onOpenChange(false)}
            disabled={loading}
            className="inline-flex items-center justify-center rounded-lg border border-zinc-300 px-4 py-2 text-sm font-medium text-zinc-700 hover:bg-zinc-50 disabled:opacity-60"
          >
            {cancelLabel}
          </button>
          <button
            type="button"
            onClick={onConfirm}
            disabled={loading}
            className={`inline-flex items-center justify-center rounded-lg px-4 py-2 text-sm font-medium text-white disabled:opacity-60 ${confirmClasses}`}
          >
            {loading ? "Working..." : confirmLabel}
          </button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
