"use client";

import { X } from "lucide-react";
import { useEffect, useRef } from "react";
import type { ReactNode } from "react";

import { IconButton } from "@/components/ui/Button";
import { cn } from "@/lib/cn";

const FOCUSABLE =
  'a[href],button:not([disabled]),textarea:not([disabled]),input:not([disabled]),select:not([disabled]),[tabindex]:not([tabindex="-1"])';

export function Modal({
  open,
  onClose,
  title,
  description,
  children,
  footer,
  className,
}: {
  open: boolean;
  onClose: () => void;
  title: string;
  description?: string;
  children: ReactNode;
  footer?: ReactNode;
  className?: string;
}) {
  const panelRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;

    const previous = document.activeElement as HTMLElement | null;
    // Lock the page behind the dialog so the backdrop can't scroll away.
    const overflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    const panel = panelRef.current;
    panel?.querySelector<HTMLElement>(FOCUSABLE)?.focus();

    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        onClose();
        return;
      }
      if (event.key !== "Tab" || !panel) return;
      // Keep Tab inside the dialog while it's the only thing on screen.
      const items = [...panel.querySelectorAll<HTMLElement>(FOCUSABLE)];
      if (items.length === 0) return;
      const first = items[0];
      const last = items[items.length - 1];
      if (event.shiftKey && document.activeElement === first) {
        event.preventDefault();
        last.focus();
      } else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault();
        first.focus();
      }
    };

    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = overflow;
      previous?.focus();
    };
  }, [open, onClose]);

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center overflow-y-auto p-4 sm:p-8">
      <div className="animate-fade fixed inset-0 bg-text/14" onClick={onClose} aria-hidden />
      <div
        ref={panelRef}
        role="dialog"
        aria-modal="true"
        aria-label={title}
        className={cn(
          "animate-dialog relative z-10 my-auto w-full max-w-lg rounded-4 border border-line bg-raised",
          "shadow-[var(--shadow-dialog)]",
          className,
        )}
      >
        <header className="flex items-start justify-between gap-6 px-6 pb-5 pt-6">
          <div className="min-w-0">
            <h2 className="display text-title text-text">{title}</h2>
            {description ? (
              <p className="mt-2 max-w-md text-meta text-text-3">{description}</p>
            ) : null}
          </div>
          <IconButton label="Close" onClick={onClose} className="-mr-2 -mt-1">
            <X className="h-4 w-4" strokeWidth={1.75} />
          </IconButton>
        </header>

        <div className="px-6">{children}</div>

        {footer ? (
          <footer className="mt-6 flex items-center justify-end gap-2 border-t border-line px-6 py-4">
            {footer}
          </footer>
        ) : (
          <div className="h-6" />
        )}
      </div>
    </div>
  );
}
