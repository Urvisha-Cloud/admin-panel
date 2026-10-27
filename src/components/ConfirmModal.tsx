import React, { useEffect } from "react";
import { createPortal } from "react-dom";
import { AlertTriangle, CheckCircle2, Info, Loader2, X } from "lucide-react";

interface ConfirmModalProps {
  isOpen: boolean;
  title: string;
  message: string;
  confirmText?: string;
  cancelText?: string;
  variant?: "danger" | "success" | "primary";
  isLoading?: boolean;
  icon?: React.ReactNode;
  onConfirm: () => void;
  onCancel: () => void;
}

const VARIANT_STYLES = {
  danger: {
    icon: <AlertTriangle size={22} />,
    iconWrap: "bg-[rgba(239,68,68,0.12)] text-red-400 ring-[rgba(239,68,68,0.08)]",
    button: "bg-admin-danger text-white hover:bg-red-600",
  },
  success: {
    icon: <CheckCircle2 size={22} />,
    iconWrap: "bg-[rgba(16,185,129,0.12)] text-admin-success ring-[rgba(16,185,129,0.08)]",
    button: "bg-admin-success text-white hover:opacity-90",
  },
  primary: {
    icon: <Info size={22} />,
    iconWrap: "bg-[rgba(244,114,182,0.12)] text-admin-primary ring-[rgba(244,114,182,0.08)]",
    button: "bg-admin-primary text-white hover:opacity-90",
  },
};

export const ConfirmModal: React.FC<ConfirmModalProps> = ({
  isOpen,
  title,
  message,
  confirmText = "Delete",
  cancelText = "Cancel",
  variant = "danger",
  isLoading = false,
  icon,
  onConfirm,
  onCancel,
}) => {
  // Close on Escape (unless an action is in progress)
  useEffect(() => {
    if (!isOpen) return;
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === "Escape" && !isLoading) onCancel();
    };
    window.addEventListener("keydown", handleKey);
    return () => window.removeEventListener("keydown", handleKey);
  }, [isOpen, isLoading, onCancel]);

  if (!isOpen) return null;

  const styles = VARIANT_STYLES[variant];

  // Portal to body so the overlay covers the whole viewport, including the header
  return createPortal(
    <div
      onClick={() => !isLoading && onCancel()}
      className="fixed inset-0 z-[110] flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-fade-in"
    >
      <div
        role="alertdialog"
        aria-modal="true"
        aria-labelledby="confirm-modal-title"
        aria-describedby="confirm-modal-message"
        onClick={(e) => e.stopPropagation()}
        className="relative w-full max-w-[400px] rounded-admin-lg border border-[rgba(244,114,182,0.14)] bg-admin-card px-6 pb-6 pt-7 text-center shadow-[0_24px_60px_rgba(0,0,0,0.55)]"
      >
        <button
          type="button"
          aria-label="Close"
          onClick={onCancel}
          disabled={isLoading}
          className="absolute right-3 top-3 flex h-8 w-8 items-center justify-center rounded-full text-admin-muted transition-colors hover:bg-admin-surface hover:text-white disabled:opacity-40"
        >
          <X size={16} />
        </button>

        <div
          className={`mx-auto flex h-12 w-12 items-center justify-center rounded-full ring-8 ${styles.iconWrap}`}
        >
          {icon ?? styles.icon}
        </div>

        <h3 id="confirm-modal-title" className="mt-5 text-lg font-semibold text-white">
          {title}
        </h3>
        <p id="confirm-modal-message" className="mx-auto mt-1.5 max-w-[320px] text-sm leading-relaxed text-admin-muted">
          {message}
        </p>

        <div className="mt-6 grid grid-cols-2 gap-3">
          <button
            type="button"
            onClick={onCancel}
            disabled={isLoading}
            className="h-10 rounded-admin border border-[rgba(244,114,182,0.15)] bg-admin-surface text-sm font-medium text-admin-muted transition-colors hover:text-white disabled:opacity-50"
          >
            {cancelText}
          </button>
          <button
            type="button"
            onClick={onConfirm}
            disabled={isLoading}
            autoFocus
            className={`flex h-10 items-center justify-center gap-2 rounded-admin text-sm font-semibold transition-colors disabled:opacity-70 ${styles.button}`}
          >
            {isLoading && <Loader2 size={15} className="animate-spin" />}
            {isLoading ? "Processing..." : confirmText}
          </button>
        </div>
      </div>
    </div>,
    document.body
  );
};
