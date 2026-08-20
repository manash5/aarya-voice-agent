"use client";

import { X } from "lucide-react";
import { useEffect } from "react";
import type { ReactNode } from "react";

import { IconButton } from "@/components/ui/Button";
import { cn } from "@/lib/cn";

/**
 * Contextual side panel. At xl it's a column in the layout; below that it
 * becomes an overlay, because a permanent third column on a laptop leaves the
 * work itself too narrow to use.
 */
export function Drawer({
  open,
  onClose,
  title,
  children,
}: {
  open: boolean;
  onClose: () => void;
  title: string;
  children: ReactNode;
}) {
  useEffect(() => {
    if (!open) return;
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") onClose();
    };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [open, onClose]);

  return (
    <>
      <div
        className={cn(
          "fixed inset-0 z-40 bg-text/12 transition-opacity duration-[--base] xl:hidden",
          open ? "opacity-100" : "pointer-events-none opacity-0",
        )}
        onClick={onClose}
        aria-hidden
      />
      <aside
        aria-label={title}
        className={cn(
          "fixed inset-y-0 right-0 z-50 w-[340px] max-w-[90vw] overflow-y-auto border-l border-line bg-rail",
          "transition-transform duration-[--base] ease-[--ease-out]",
          // At xl it stops being an overlay and becomes a column, so it must
          // always be visible and reachable there regardless of `open`.
          "xl:static xl:z-auto xl:w-[320px] xl:max-w-none xl:visible xl:translate-x-0 xl:bg-transparent",
          open ? "translate-x-0" : "invisible translate-x-full",
        )}
      >
        <div className="flex h-14 items-center justify-between gap-3 px-5 xl:hidden xl:px-6">
          <span className="eyebrow">{title}</span>
          <div className="xl:hidden">
            <IconButton label="Close panel" onClick={onClose}>
              <X className="h-4 w-4" strokeWidth={1.75} />
            </IconButton>
          </div>
        </div>
        <div className="px-5 pb-10 xl:px-6 xl:pt-6">{children}</div>
      </aside>
    </>
  );
}
