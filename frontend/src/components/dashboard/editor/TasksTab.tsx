"use client";

import { Check, Hammer, Lock, Plus, X } from "lucide-react";

import { MultiSelect } from "@/components/ui/MultiSelect";
import { Badge, Button, Panel } from "@/components/ui/controls";
import { TASK_CATALOG, TOOL_CATALOG, taskById, toolById, toolsForTasks } from "@/lib/catalog";
import { cn } from "@/lib/cn";
import type { Assistant } from "@/lib/types";

export function TasksTab({
  assistant,
  onChange,
}: {
  assistant: Assistant;
  onChange: (patch: Partial<Assistant>) => void;
}) {
  function toggleTask(id: string) {
    const on = assistant.tasks.includes(id);
    const tasks = on ? assistant.tasks.filter((t) => t !== id) : [...assistant.tasks, id];

    // Keep tools in step with tasks, but never drop a tool that another
    // selected task still needs, or one that was attached by hand.
    const needed = toolsForTasks(tasks);
    const removed = on
      ? (taskById(id)?.tools ?? []).filter((tool) => !needed.includes(tool))
      : [];
    const tools = [...new Set([...assistant.tools.filter((t) => !removed.includes(t)), ...needed])];

    onChange({ tasks, tools });
  }

  const toolItems = TOOL_CATALOG.map((tool) => ({
    id: tool.id,
    name: tool.name,
    group: tool.group,
    description: tool.description,
    planned: tool.status === "planned",
  }));

  const requiredTools = toolsForTasks(assistant.tasks);

  return (
    <div className="space-y-5">
      <Panel
        title="Tasks"
        description="What this assistant is allowed to do on a call. This is what makes two assistants on the same pipeline behave differently."
      >
        <div className="grid gap-2 sm:grid-cols-2">
          {TASK_CATALOG.map((task) => {
            const selected = assistant.tasks.includes(task.id);
            const blocked =
              task.requiresAgentType !== undefined && task.requiresAgentType !== assistant.agentType;

            return (
              <button
                key={task.id}
                type="button"
                disabled={blocked}
                onClick={() => toggleTask(task.id)}
                className={cn(
                  "flex items-start gap-2.5 rounded-lg border p-3 text-left transition-colors",
                  selected
                    ? "border-accent/60 bg-accent/[0.06]"
                    : "border-line bg-panel-2 hover:border-ink-dim",
                  blocked && "cursor-not-allowed opacity-45 hover:border-line",
                )}
              >
                <span
                  className={cn(
                    "mt-0.5 flex h-4 w-4 shrink-0 items-center justify-center rounded border",
                    selected ? "border-accent bg-accent text-accent-ink" : "border-line",
                  )}
                >
                  {selected ? <Check className="h-3 w-3" strokeWidth={3} /> : null}
                </span>
                <span className="min-w-0">
                  <span className="block text-sm text-ink">{task.name}</span>
                  <span className="mt-0.5 block text-[11px] leading-relaxed text-ink-dim">
                    {blocked ? "Needs the knowledge base agent type" : task.description}
                  </span>
                </span>
                {blocked ? <Lock className="mt-0.5 h-3 w-3 shrink-0 text-ink-dim" /> : null}
              </button>
            );
          })}
        </div>
      </Panel>

      <Panel
        title="Tools"
        description="The functions behind those tasks. Attached automatically, but you can add extras."
      >
        <MultiSelect
          items={toolItems}
          selected={assistant.tools}
          onChange={(tools) => onChange({ tools })}
          placeholder="No tools attached"
        />

        <div className="mt-4 space-y-2">
          {assistant.tools.map((id) => {
            const tool = toolById(id);
            if (!tool) return null;
            const required = requiredTools.includes(id);
            return (
              <div
                key={id}
                className="flex items-start gap-3 rounded-lg border border-line bg-panel-2 px-3 py-2.5"
              >
                <span className="mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-md bg-elevated text-ink-dim">
                  <Hammer className="h-3.5 w-3.5" />
                </span>
                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="font-mono text-xs text-ink">{tool.name}</span>
                    {required ? <Badge>from a task</Badge> : <Badge tone="outline">manual</Badge>}
                    {tool.status === "planned" ? (
                      <Badge tone="warn">not implemented</Badge>
                    ) : (
                      <Badge tone="accent">live</Badge>
                    )}
                  </div>
                  <p className="mt-1 text-xs leading-relaxed text-ink-dim">{tool.description}</p>
                </div>
                <button
                  type="button"
                  aria-label={`Remove ${tool.name}`}
                  onClick={() => onChange({ tools: assistant.tools.filter((tid) => tid !== id) })}
                  className="rounded-md p-1 text-ink-dim transition-colors hover:bg-elevated hover:text-ink"
                >
                  <X className="h-3.5 w-3.5" />
                </button>
              </div>
            );
          })}
          {assistant.tools.length === 0 ? (
            <p className="py-4 text-center text-xs text-ink-dim">
              No tools yet. Pick a task above, or attach one by hand.
            </p>
          ) : null}
        </div>
      </Panel>

      <Panel
        title="Custom tool"
        description="Point the assistant at your own HTTP endpoint with a JSON schema for its arguments."
      >
        <Button variant="secondary" disabled>
          <Plus className="h-3.5 w-3.5" />
          Add custom tool
        </Button>
      </Panel>
    </div>
  );
}
