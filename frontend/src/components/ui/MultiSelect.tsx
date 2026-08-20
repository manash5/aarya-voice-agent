"use client";

import { ChevronDown, Search } from "lucide-react";
import { useEffect, useMemo, useRef, useState } from "react";

import { CheckBox } from "@/components/ui/Form";
import { Tag } from "@/components/ui/Status";
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
        aria-expanded={open}
        onClick={() => setOpen((value) => !value)}
        className={cn(
          "flex min-h-9 w-full items-center justify-between gap-3 rounded-2 border bg-sunken px-3 py-1.5 text-left",
          "transition-colors duration-[--fast] ease-[--ease]",
          open ? "border-accent-line" : "border-line hover:border-line-strong",
        )}
      >
        <span className="flex flex-wrap items-center gap-1.5">
          {selected.length === 0 ? (
            <span className="text-ui text-text-3">{placeholder}</span>
          ) : (
            selected.map((id) => (
              <Tag key={id} tone="neutral" className="font-mono">
                {items.find((item) => item.id === id)?.name ?? id}
              </Tag>
            ))
          )}
        </span>
        <ChevronDown
          className={cn(
            "h-3.5 w-3.5 shrink-0 text-text-3 transition-transform duration-[--base] ease-[--ease]",
            open && "rotate-180",
          )}
          strokeWidth={1.75}
        />
      </button>

      {open ? (
        <div className="animate-menu absolute z-30 mt-1.5 w-full overflow-hidden rounded-3 border border-line bg-raised shadow-[var(--shadow-menu)]">
          <div className="flex items-center gap-2 border-b border-line px-3 py-2.5">
            <Search className="h-3.5 w-3.5 shrink-0 text-text-3" strokeWidth={1.75} />
            <input
              autoFocus
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder="Search tools"
              className="w-full bg-transparent text-ui text-text outline-none placeholder:text-text-3"
            />
          </div>
          <div className="max-h-72 overflow-y-auto p-1">
            {Object.entries(groups).map(([group, groupItems]) => (
              <div key={group}>
                <p className="eyebrow px-2.5 pb-1 pt-3">{group}</p>
                {groupItems.map((item) => (
                  <button
                    key={item.id}
                    type="button"
                    onClick={() => toggle(item.id)}
                    className="flex w-full items-start gap-2.5 rounded-2 px-2.5 py-2 text-left transition-colors duration-[--fast] hover:bg-raised-hover"
                  >
                    <span className="mt-0.5">
                      <CheckBox checked={selected.includes(item.id)} />
                    </span>
                    <span className="min-w-0">
                      <span className="flex items-center gap-2">
                        <span className="font-mono text-meta text-text">{item.name}</span>
                        {item.planned ? <Tag tone="warn">planned</Tag> : null}
                      </span>
                      {item.description ? (
                        <span className="mt-0.5 block text-meta text-text-3">
                          {item.description}
                        </span>
                      ) : null}
                    </span>
                  </button>
                ))}
              </div>
            ))}
            {Object.keys(groups).length === 0 ? (
              <p className="px-3 py-8 text-center text-meta text-text-3">
                No tools match that search.
              </p>
            ) : null}
          </div>
        </div>
      ) : null}
    </div>
  );
}
