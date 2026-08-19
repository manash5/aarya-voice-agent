"use client";

import { Hammer, Plus } from "lucide-react";

import { PageHeader } from "@/components/dashboard/PageHeader";
import { Badge, Button } from "@/components/ui/controls";
import { TOOL_CATALOG } from "@/lib/catalog";
import { useStore } from "@/lib/store";

export default function ToolsPage() {
  const { assistants } = useStore();

  const groups = TOOL_CATALOG.reduce<Record<string, typeof TOOL_CATALOG>>((acc, tool) => {
    (acc[tool.group] ??= []).push(tool);
    return acc;
  }, {});

  return (
    <>
      <PageHeader
        title="Tools"
        description="Functions an assistant can call mid-call. Attach them per assistant on its Tools tab."
        action={
          <Button variant="secondary" size="sm" disabled>
            <Plus className="h-3.5 w-3.5" />
            New custom tool
          </Button>
        }
      />

      <div className="min-h-0 flex-1 overflow-y-auto px-8 py-6">
        <div className="mx-auto max-w-4xl space-y-8">
          {Object.entries(groups).map(([group, tools]) => (
            <section key={group}>
              <h2 className="mb-3 text-xs font-semibold uppercase tracking-wider text-ink-dim">
                {group}
              </h2>
              <div className="grid gap-3 sm:grid-cols-2">
                {tools.map((tool) => {
                  const usedBy = assistants.filter((assistant) =>
                    assistant.tools.includes(tool.id),
                  ).length;
                  return (
                    <div key={tool.id} className="rounded-xl border border-line bg-panel p-4">
                      <div className="flex items-start justify-between gap-3">
                        <span className="flex items-center gap-2">
                          <span className="flex h-7 w-7 items-center justify-center rounded-md bg-elevated text-ink-dim">
                            <Hammer className="h-3.5 w-3.5" />
                          </span>
                          <span className="font-mono text-xs text-ink">{tool.name}</span>
                        </span>
                        {tool.status === "live" ? (
                          <Badge tone="accent">live</Badge>
                        ) : (
                          <Badge tone="warn">planned</Badge>
                        )}
                      </div>
                      <p className="mt-3 text-xs leading-relaxed text-ink-dim">
                        {tool.description}
                      </p>
                      <p className="mt-3 text-[11px] text-ink-dim">
                        {usedBy === 0
                          ? "Not attached to any assistant"
                          : `Used by ${usedBy} assistant${usedBy > 1 ? "s" : ""}`}
                      </p>
                    </div>
                  );
                })}
              </div>
            </section>
          ))}
        </div>
      </div>
    </>
  );
}
