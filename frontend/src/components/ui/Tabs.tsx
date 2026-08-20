"use client";

import { useEffect, useRef, useState } from "react";

import { cn } from "@/lib/cn";

/**
 * Underline tabs with an indicator that travels between them. Measured from
 * the live DOM rather than assumed, so it stays correct when labels change
 * width, the font loads late, or the strip scrolls on a narrow screen.
 */
export function Tabs<T extends string>({
  tabs,
  value,
  onChange,
  className,
}: {
  tabs: readonly T[];
  value: T;
  onChange: (tab: T) => void;
  className?: string;
}) {
  const listRef = useRef<HTMLDivElement>(null);
  const refs = useRef(new Map<string, HTMLButtonElement>());
  const [indicator, setIndicator] = useState<{ left: number; width: number } | null>(null);

  useEffect(() => {
    const node = refs.current.get(value);
    const list = listRef.current;
    if (!node || !list) return;

    const measure = () => {
      setIndicator({
        left: node.offsetLeft,
        width: node.offsetWidth,
      });
    };
    measure();

    const observer = new ResizeObserver(measure);
    observer.observe(list);
    observer.observe(node);
    // Web fonts land after first paint and change label widths.
    void document.fonts?.ready.then(measure);
    return () => observer.disconnect();
  }, [value, tabs]);

  return (
    <div className={cn("relative border-b border-line", className)}>
      <div
        ref={listRef}
        role="tablist"
        aria-orientation="horizontal"
        className="relative -mb-px flex gap-1 overflow-x-auto"
        onKeyDown={(event) => {
          const delta = event.key === "ArrowRight" ? 1 : event.key === "ArrowLeft" ? -1 : 0;
          if (!delta) return;
          event.preventDefault();
          const index = tabs.indexOf(value);
          const next = tabs[(index + delta + tabs.length) % tabs.length];
          onChange(next);
          refs.current.get(next)?.focus();
        }}
      >
        {tabs.map((tab) => {
          const active = tab === value;
          return (
            <button
              key={tab}
              ref={(node) => {
                if (node) refs.current.set(tab, node);
                else refs.current.delete(tab);
              }}
              role="tab"
              type="button"
              aria-selected={active}
              tabIndex={active ? 0 : -1}
              onClick={() => onChange(tab)}
              className={cn(
                "shrink-0 whitespace-nowrap px-2.5 pb-2.5 pt-1 text-ui",
                "transition-colors duration-[--fast] ease-[--ease]",
                active ? "font-medium text-text" : "text-text-3 hover:text-text-2",
              )}
            >
              {tab}
            </button>
          );
        })}

        {indicator ? (
          <span
            aria-hidden
            className="absolute bottom-0 h-px bg-text transition-[left,width] duration-[--base] ease-[--ease-out]"
            style={{ left: indicator.left, width: indicator.width }}
          />
        ) : null}
      </div>
    </div>
  );
}
