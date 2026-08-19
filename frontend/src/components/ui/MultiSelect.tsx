"use client";

import { Check, ChevronDown, Search } from "lucide-react";
import { useEffect, useMemo, useRef, useState } from "react";

import { Badge } from "@/components/ui/controls";
import { cn } from "@/lib/cn";

export interface MultiSelectItem {
  id: string;
  name: string;
  group: string;
  description?: string;
  planned?: boolean;
}

export function MultiSelect({
  items,
  selected,
  onChange,
  placeholder = "Select…",
}: {
  items: MultiSelectItem[];
  selected: string[];
  onChange: (next: string[]) => void;
  placeholder?: string;
}) {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const rootRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    const onPointerDown = (event: MouseEvent) => {
      if (!rootRef.current?.contains(event.target as Node)) setOpen(false);
    };
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") setOpen(false);
    };
    document.addEventListener("mousedown", onPointerDown);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("mousedown", onPointerDown);
      document.removeEventListener("keydown", onKey);
    };
  }, [open]);

  const groups = useMemo(() => {
    const needle = query.trim().toLowerCase();
    const filtered = needle
      ? items.filter(
          (item) =>
            item.name.toLowerCase().includes(needle) ||
            item.group.toLowerCase().includes(needle),
        )
      : items;

    return filtered.reduce<Record<string, MultiSelectItem[]>>((acc, item) => {
      (acc[item.group] ??= []).push(item);
      return acc;
    }, {});
  }, [items, query]);

  function toggle(id: string) {
    onChange(selected.includes(id) ? selected.filter((v) => v !== id) : [...selected, id]);
  }

  return (
    <div className="relative" ref={rootRef}>
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className="flex min-h-9 w-full items-center justify-between gap-3 rounded-lg border border-line bg-panel-2 px-3 py-1.5 text-left text-sm transition-colors hover:border-ink-dim"
      >
        <span className="flex flex-wrap items-center gap-1.5">
          {selected.length === 0 ? (
            <span className="text-ink-dim">{placeholder}</span>
          ) : (
            selected.map((id) => (
              <Badge key={id} tone="accent" className="font-mono">
                {items.find((item) => item.id === id)?.name ?? id}
              </Badge>
            ))
          )}
        </span>
        <ChevronDown className={cn("h-4 w-4 shrink-0 text-ink-dim transition-transform", open && "rotate-180")} />
      </button>

      {open ? (
        <div className="absolute z-30 mt-1.5 w-full overflow-hidden rounded-xl border border-line bg-elevated shadow-2xl shadow-black/50">
          <div className="flex items-center gap-2 border-b border-line-soft px-3 py-2">
            <Search className="h-3.5 w-3.5 text-ink-dim" />
            <input
              autoFocus
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder="Search tools"
              className="w-full bg-transparent text-xs text-ink outline-none placeholder:text-ink-dim"
            />
          </div>
          <div className="max-h-72 overflow-y-auto py-1">
            {Object.entries(groups).map(([group, groupItems]) => (
              <div key={group}>
                <p className="px-3 py-1.5 text-[10px] font-semibold uppercase tracking-wider text-ink-dim">
                  {group}
                </p>
                {groupItems.map((item) => {
                  const isSelected = selected.includes(item.id);
                  return (
                    <button
                      key={item.id}
                      type="button"
                      onClick={() => toggle(item.id)}
                      className="flex w-full items-start gap-2.5 px-3 py-2 text-left transition-colors hover:bg-panel-2"
                    >
                      <span
                        className={cn(
                          "mt-0.5 flex h-4 w-4 shrink-0 items-center justify-center rounded border",
                          isSelected ? "border-accent bg-accent text-accent-ink" : "border-line",
                        )}
                      >
                        {isSelected ? <Check className="h-3 w-3" strokeWidth={3} /> : null}
                      </span>
                      <span className="min-w-0">
                        <span className="flex items-center gap-2">
                          <span className="font-mono text-xs text-ink">{item.name}</span>
                          {item.planned ? <Badge tone="outline">planned</Badge> : null}
                        </span>
                        {item.description ? (
                          <span className="mt-0.5 block text-[11px] leading-relaxed text-ink-dim">
                            {item.description}
                          </span>
                        ) : null}
                      </span>
                    </button>
                  );
                })}
              </div>
            ))}
            {Object.keys(groups).length === 0 ? (
              <p className="px-3 py-6 text-center text-xs text-ink-dim">No tools match that search.</p>
            ) : null}
          </div>
        </div>
      ) : null}
    </div>
  );
}
