"use client";

import { AnimatePresence, motion } from "motion/react";

type ConfirmDialogProps = {
  open: boolean;
  title: string;
  description: string;
  confirmLabel?: string;
  cancelLabel?: string;
  pending?: boolean;
  onConfirm: () => void;
  onCancel: () => void;
};

export function ConfirmDialog({
  open,
  title,
  description,
  confirmLabel = "Borrar",
  cancelLabel = "Cancelar",
  pending = false,
  onConfirm,
  onCancel,
}: ConfirmDialogProps) {
  return (
    <AnimatePresence>
      {open ? (
        <motion.div
          className="fixed inset-0 z-50 flex items-end justify-center bg-black/60 backdrop-blur-sm sm:items-center"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onCancel}
        >
          <motion.div
            role="alertdialog"
            aria-modal="true"
            className="w-full max-w-sm rounded-2xl border border-surface-border bg-blanco p-6 shadow-xl shadow-piedra/10"
            initial={{ opacity: 0, y: 24, scale: 0.97 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 12, scale: 0.97 }}
            transition={{ duration: 0.2, ease: "easeOut" }}
            onClick={(e) => e.stopPropagation()}
          >
            <h2 className="text-lg font-bold text-foreground">{title}</h2>
            <p className="mt-2 text-sm text-muted-foreground">
              {description}
            </p>
            <div className="mt-6 flex justify-end gap-2">
              <button
                type="button"
                onClick={onCancel}
                className="inline-flex h-11 min-h-[44px] items-center justify-center rounded-full px-5 text-sm font-medium text-muted-foreground transition-transform duration-150 hover:text-foreground active:scale-95"
              >
                {cancelLabel}
              </button>
              <button
                type="button"
                onClick={onConfirm}
                disabled={pending}
                className="inline-flex h-11 min-h-[44px] items-center justify-center rounded-full bg-lust px-5 text-sm font-semibold text-blanco transition-transform duration-150 hover:opacity-90 active:scale-95 disabled:opacity-60"
              >
                {pending ? "Borrando…" : confirmLabel}
              </button>
            </div>
          </motion.div>
        </motion.div>
      ) : null}
    </AnimatePresence>
  );
}
