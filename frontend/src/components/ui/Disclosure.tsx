"use client";

import { ChevronRight } from "lucide-react";
import { useId, useState } from "react";
import type { ReactNode } from "react";

import { cn } from "@/lib/cn";

/**
 * Advanced configuration that shouldn't cost anything to ignore. Collapsed by
 * default, and the summary keeps stating the current value so you rarely need
 * to open it at all.
 */
export function Disclosure({
  label,
  summary,
  defaultOpen = false,
  children,
}: {
  label: string;
  summary?: ReactNode;
  defaultOpen?: boolean;
  children: ReactNode;
}) {
  const [open, setOpen] = useState(defaultOpen);
  const id = useId();

  return (
    <div className="border-t border-line">
      <button
        type="button"
        aria-expanded={open}
        aria-controls={id}
        onClick={() => setOpen((value) => !value)}
        className="group flex w-full items-center gap-2.5 py-3 text-left"
      >
        <ChevronRight
          className={cn(
            "h-3.5 w-3.5 shrink-0 text-text-3 transition-transform duration-[--base] ease-[--ease]",
            open && "rotate-90",
          )}
          strokeWidth={2}
        />
        <span className="text-ui font-medium text-text">{label}</span>
        {summary && !open ? (
          <span className="ml-auto truncate text-meta text-text-3">{summary}</span>
        ) : null}
      </button>
      {open ? (
        <div id={id} className="animate-fade pb-5 pl-6">
          {children}
        </div>
      ) : null}
    </div>
  );
}
