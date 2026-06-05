"use client"

import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog"

interface ConfirmModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  title: string
  description: string
  confirmLabel?: string
  cancelLabel?: string
  variant?: "danger" | "default"
  onConfirm: () => void
}

export function ConfirmModal({
  open,
  onOpenChange,
  title,
  description,
  confirmLabel = "Konfirmasi",
  cancelLabel = "Batal",
  variant = "default",
  onConfirm,
}: ConfirmModalProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[400px] rounded-lg border-neutral-200 shadow-lg">
        <DialogHeader>
          <DialogTitle className="text-base font-semibold text-neutral-900">{title}</DialogTitle>
          <DialogDescription className="text-sm text-neutral-500">{description}</DialogDescription>
        </DialogHeader>
        <DialogFooter className="flex gap-2 sm:gap-2">
          <button
            onClick={() => onOpenChange(false)}
            className="flex-1 px-4 py-2.5 border border-neutral-200 text-neutral-700 rounded-lg text-sm font-medium hover:bg-neutral-50 transition-colors"
          >
            {cancelLabel}
          </button>
          <button
            onClick={() => { onConfirm(); onOpenChange(false) }}
            className={`flex-1 px-4 py-2.5 rounded-lg text-sm font-medium text-white transition-all shadow-sm ${
              variant === "danger" ? "bg-red-600 hover:bg-red-700" : "bg-neutral-900 hover:bg-neutral-800"
            }`}
          >
            {confirmLabel}
          </button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
