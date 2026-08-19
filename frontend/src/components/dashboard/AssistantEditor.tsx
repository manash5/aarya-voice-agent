"use client";

import { Copy, Mic, Trash2 } from "lucide-react";
import { useState } from "react";

import { AdvancedTab } from "@/components/dashboard/editor/AdvancedTab";
import { AgentTab } from "@/components/dashboard/editor/AgentTab";
import { KnowledgeTab } from "@/components/dashboard/editor/KnowledgeTab";
import { LogsTab } from "@/components/dashboard/editor/LogsTab";
import { PlaygroundTab } from "@/components/dashboard/editor/PlaygroundTab";
import { TasksTab } from "@/components/dashboard/editor/TasksTab";
import { VoiceTab } from "@/components/dashboard/editor/VoiceTab";
import { Badge, Button } from "@/components/ui/controls";
import { cn } from "@/lib/cn";
import { formatRelative } from "@/lib/format";
import type { Assistant } from "@/lib/types";

const TABS = [
  "Agent",
  "Tasks",
  "Voice",
  "Knowledge",
  "Advanced",
  "Playground",
  "Logs",
] as const;
type Tab = (typeof TABS)[number];

export function AssistantEditor({
  assistant,
  onChange,
  onDuplicate,
  onDelete,
}: {
  assistant: Assistant;
  onChange: (patch: Partial<Assistant>) => void;
  onDuplicate: () => void;
  onDelete: () => void;
}) {
  const [tab, setTab] = useState<Tab>("Agent");

  return (
    <div className="flex min-w-0 flex-1 flex-col overflow-hidden">
      <header className="border-b border-line px-8 pt-5">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div className="min-w-0">
            <input
              value={assistant.name}
              onChange={(event) => onChange({ name: event.target.value })}
              className="w-full min-w-0 max-w-md rounded-md bg-transparent text-lg font-semibold text-ink outline-none focus:bg-panel-2 focus:px-2"
            />
            <div className="mt-1.5 flex flex-wrap items-center gap-2 text-[11px] text-ink-dim">
              {assistant.companyName ? (
                <span className="text-ink-muted">{assistant.companyName}</span>
              ) : (
                <span className="italic">No company set</span>
              )}
              <span>·</span>
              <span className="font-mono">{assistant.id}</span>
              <span>·</span>
              <span>edited {formatRelative(assistant.updatedAt)}</span>
              {assistant.status === "published" ? (
                <Badge tone="accent">published</Badge>
              ) : (
                <Badge tone="outline">draft</Badge>
              )}
            </div>
          </div>

          <div className="flex shrink-0 flex-wrap items-center justify-end gap-2">
            <Button variant="ghost" size="sm" onClick={onDuplicate}>
              <Copy className="h-3.5 w-3.5" />
              Duplicate
            </Button>
            <Button variant="ghost" size="sm" onClick={onDelete}>
              <Trash2 className="h-3.5 w-3.5" />
              Delete
            </Button>
            <Button variant="secondary" size="sm" onClick={() => setTab("Playground")}>
              <Mic className="h-3.5 w-3.5" />
              Test call
            </Button>
            <Button
              variant="primary"
              size="sm"
              onClick={() =>
                onChange({ status: assistant.status === "published" ? "draft" : "published" })
              }
            >
              {assistant.status === "published" ? "Unpublish" : "Publish"}
            </Button>
          </div>
        </div>

        <nav className="-mb-px mt-4 flex gap-1">
          {TABS.map((item) => (
            <button
              key={item}
              type="button"
              onClick={() => setTab(item)}
              className={cn(
                "border-b-2 px-3 py-2.5 text-sm transition-colors",
                item === tab
                  ? "border-accent font-medium text-ink"
                  : "border-transparent text-ink-muted hover:text-ink",
              )}
            >
              {item}
            </button>
          ))}
        </nav>
      </header>

      <div className="min-h-0 flex-1 overflow-y-auto px-8 py-6">
        <div className="mx-auto max-w-3xl">
          {tab === "Agent" ? <AgentTab assistant={assistant} onChange={onChange} /> : null}
          {tab === "Tasks" ? <TasksTab assistant={assistant} onChange={onChange} /> : null}
          {tab === "Voice" ? <VoiceTab assistant={assistant} onChange={onChange} /> : null}
          {tab === "Knowledge" ? <KnowledgeTab assistant={assistant} onChange={onChange} /> : null}
          {tab === "Advanced" ? <AdvancedTab assistant={assistant} onChange={onChange} /> : null}
          {tab === "Playground" ? <PlaygroundTab assistant={assistant} /> : null}
          {tab === "Logs" ? <LogsTab assistant={assistant} /> : null}
        </div>
      </div>
    </div>
  );
}
