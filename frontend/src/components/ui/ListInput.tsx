"use client";

import { Plus, X } from "lucide-react";
import { useState } from "react";

import { IconButton } from "@/components/ui/Button";
import { cn } from "@/lib/cn";

/**
 * A short, ordered list of one-line statements - goals, rules. Editing each
 * item in place beats a textarea full of dashes, because the shape of the list
 * is the thing being configured.
 */
export function ListInput({
  items,
  onChange,
  placeholder = "Add an item",
  addLabel = "Add",
}: {
  items: string[];
  onChange: (next: string[]) => void;
  placeholder?: string;
  addLabel?: string;
}) {
  const [draft, setDraft] = useState("");

  function commit() {
    const value = draft.trim();
    if (!value) return;
    onChange([...items, value]);
    setDraft("");
  }

  return (
    <div>
      {items.length > 0 ? (
        <ul className="mb-2 divide-y divide-line border-y border-line">
          {items.map((item, index) => (
            <li key={`${index}-${item}`} className="group flex items-center gap-2 py-1">
              <span aria-hidden className="select-none text-meta text-text-3">
                —
              </span>
              <input
                value={item}
                onChange={(event) => {
                  const next = [...items];
                  next[index] = event.target.value;
                  onChange(next);
                }}
                aria-label={`Item ${index + 1}`}
                className={cn(
                  "min-w-0 flex-1 rounded-1 bg-transparent py-1 text-ui text-text outline-none",
                  "transition-colors duration-[--fast] focus:bg-raised-hover",
                )}
              />
              <IconButton
                label={`Remove item ${index + 1}`}
                size="sm"
                onClick={() => onChange(items.filter((_, i) => i !== index))}
                className="opacity-0 transition-opacity focus-visible:opacity-100 group-hover:opacity-100"
              >
                <X className="h-3.5 w-3.5" strokeWidth={1.75} />
              </IconButton>
            </li>
          ))}
        </ul>
      ) : null}

      <div className="flex items-center gap-2">
        <input
          value={draft}
          onChange={(event) => setDraft(event.target.value)}
          onKeyDown={(event) => {
            if (event.key === "Enter") {
              event.preventDefault();
              commit();
            }
          }}
          placeholder={placeholder}
          aria-label={addLabel}
          className={cn(
            "min-w-0 flex-1 rounded-2 border border-line bg-sunken px-3 py-1.5 text-ui text-text",
            "outline-none transition-colors duration-[--fast]",
            "placeholder:text-text-3 hover:border-line-strong focus:border-accent-line",
          )}
        />
        <IconButton label={addLabel} size="sm" onClick={commit} disabled={!draft.trim()}>
          <Plus className="h-3.5 w-3.5" strokeWidth={2} />
        </IconButton>
      </div>
    </div>
  );
}
