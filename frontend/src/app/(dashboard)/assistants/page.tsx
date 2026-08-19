"use client";

import { Bot, Plus, Search } from "lucide-react";
import { useMemo, useState } from "react";

import { AssistantEditor } from "@/components/dashboard/AssistantEditor";
import { CreateAssistantModal } from "@/components/dashboard/CreateAssistantModal";
import { Button, EmptyState } from "@/components/ui/controls";
import { AGENT_TYPES } from "@/lib/catalog";
import { cn } from "@/lib/cn";
import { formatRelative } from "@/lib/format";
import { useStore } from "@/lib/store";

export default function AssistantsPage() {
  const { assistants, hydrated, add, update, duplicate, remove } = useStore();
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [query, setQuery] = useState("");
  const [creating, setCreating] = useState(false);

  const filtered = useMemo(() => {
    const needle = query.trim().toLowerCase();
    if (!needle) return assistants;
    return assistants.filter(
      (assistant) =>
        assistant.name.toLowerCase().includes(needle) ||
        assistant.companyName.toLowerCase().includes(needle),
    );
  }, [assistants, query]);

  // Falls back to the first assistant so a delete or a fresh load always lands
  // on something without an effect syncing the selection.
  const selected =
    assistants.find((assistant) => assistant.id === selectedId) ?? assistants[0] ?? null;

  return (
    <div className="flex h-full min-h-0">
      <div className="flex w-72 shrink-0 flex-col border-r border-line bg-panel">
        <div className="space-y-3 border-b border-line-soft px-4 py-4">
          <div className="flex items-center justify-between">
            <h1 className="text-sm font-semibold text-ink">Assistants</h1>
            <span className="text-[11px] text-ink-dim">{assistants.length}</span>
          </div>
          <Button variant="primary" size="sm" className="w-full" onClick={() => setCreating(true)}>
            <Plus className="h-3.5 w-3.5" />
            Create assistant
          </Button>
          <div className="flex items-center gap-2 rounded-lg border border-line bg-panel-2 px-2.5">
            <Search className="h-3.5 w-3.5 shrink-0 text-ink-dim" />
            <input
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder="Search"
              className="h-8 w-full bg-transparent text-xs text-ink outline-none placeholder:text-ink-dim"
            />
          </div>
        </div>

        <div className="min-h-0 flex-1 overflow-y-auto p-2">
          {filtered.map((assistant) => {
            const type = AGENT_TYPES[assistant.agentType];
            const active = assistant.id === selected?.id;
            return (
              <button
                key={assistant.id}
                type="button"
                onClick={() => setSelectedId(assistant.id)}
                className={cn(
                  "mb-1 flex w-full items-start gap-2.5 rounded-lg px-2.5 py-2.5 text-left transition-colors",
                  active ? "bg-elevated" : "hover:bg-elevated/60",
                )}
              >
                <span
                  className="mt-1.5 h-2 w-2 shrink-0 rounded-full"
                  style={{ background: type.accent }}
                />
                <span className="min-w-0 flex-1">
                  <span className="block truncate text-sm text-ink">{assistant.name}</span>
                  <span className="mt-0.5 flex items-center gap-1.5 text-[11px] text-ink-dim">
                    <span className="truncate">
                      {assistant.companyName || "No company"}
                    </span>
                    <span>·</span>
                    <span className="shrink-0">{formatRelative(assistant.updatedAt)}</span>
                  </span>
                </span>
                {assistant.status === "published" ? (
                  <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-accent" />
                ) : null}
              </button>
            );
          })}

          {hydrated && filtered.length === 0 ? (
            <p className="px-3 py-8 text-center text-xs text-ink-dim">
              {assistants.length === 0 ? "No assistants yet." : "Nothing matches that search."}
            </p>
          ) : null}
        </div>
      </div>

      {selected ? (
        <AssistantEditor
          key={selected.id}
          assistant={selected}
          onChange={(patch) => update(selected.id, patch)}
          onDuplicate={() => {
            const copy = duplicate(selected.id);
            if (copy) setSelectedId(copy.id);
          }}
          onDelete={() => remove(selected.id)}
        />
      ) : (
        <div className="flex flex-1 items-center justify-center p-10">
          <EmptyState
            icon={<Bot className="h-4 w-4" />}
            title="No assistant selected"
            description="Create an assistant to give it a company, tasks, a voice and a knowledge base."
            action={
              <Button variant="primary" size="sm" onClick={() => setCreating(true)}>
                <Plus className="h-3.5 w-3.5" />
                Create assistant
              </Button>
            }
          />
        </div>
      )}

      <CreateAssistantModal
        open={creating}
        onClose={() => setCreating(false)}
        onCreate={(input) => setSelectedId(add(input).id)}
      />
    </div>
  );
}
