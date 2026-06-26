"use client";

import { useEffect, type ReactNode } from "react";
import { X } from "lucide-react";
import { cn } from "@/lib/utils";

interface Props {
  open: boolean;
  onClose: () => void;
  title?: ReactNode;
  /** Aside content rendered to the left of the body — used for tab nav. */
  aside?: ReactNode;
  children: ReactNode;
  /** When false the modal does not render a Close button (e.g. blocking onboarding). */
  dismissible?: boolean;
  className?: string;
}

/**
 * Generic centered modal with a translucent backdrop and ESC-to-close.
 * Width and height are responsive; aside slot doubles as a tab rail.
 */
export function Modal({
  open,
  onClose,
  title,
  aside,
  children,
  dismissible = true,
  className,
}: Props) {
  useEffect(() => {
    if (!open || !dismissible) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKey);
    document.body.style.overflow = "hidden";
    return () => {
      window.removeEventListener("keydown", onKey);
      document.body.style.overflow = "";
    };
  }, [open, dismissible, onClose]);

  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-ink-900/40 backdrop-blur-sm animate-fade-in p-4"
      onClick={dismissible ? onClose : undefined}
      role="dialog"
      aria-modal="true"
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className={cn(
          "relative flex w-full max-w-3xl max-h-[90vh] overflow-hidden rounded-2xl border border-cream-300 dark:border-ink-500 bg-cream-50 dark:bg-ink-700 shadow-xl animate-slide-up",
          className,
        )}
      >
        {aside && (
          <nav className="hidden md:flex w-48 shrink-0 flex-col border-r border-cream-300 dark:border-ink-500 bg-cream-100 dark:bg-ink-800 py-4 px-2">
            {aside}
          </nav>
        )}

        <div className="flex flex-1 flex-col min-w-0">
          {(title || dismissible) && (
            <header className="flex items-center justify-between border-b border-cream-300 dark:border-ink-500 px-5 py-3">
              <h2 className="text-sm font-semibold tracking-tight">{title}</h2>
              {dismissible && (
                <button
                  onClick={onClose}
                  className="flex h-8 w-8 items-center justify-center rounded-lg text-ink-400 hover:bg-cream-200 dark:hover:bg-ink-600 hover:text-ink-700 dark:hover:text-ink-100 transition-colors"
                  aria-label="Close"
                >
                  <X size={16} />
                </button>
              )}
            </header>
          )}

          <div className="flex-1 overflow-y-auto scrollbar-thin">{children}</div>
        </div>
      </div>
    </div>
  );
}
