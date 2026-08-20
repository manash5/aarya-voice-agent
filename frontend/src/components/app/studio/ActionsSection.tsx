"use client";

import { Lock, Plus, X } from "lucide-react";

import {
  Button,
  CheckBox,
  IconButton,
  MultiSelect,
  SelectCard,
  Status,
  Tag,
} from "@/components/ui";
import { TASK_CATALOG, TOOL_CATALOG, taskById, toolById, toolsForTasks } from "@/lib/catalog";
import type { Assistant } from "@/lib/types";

/**
 * What the agent can actually do on a call. Tasks are the operator's language;
 * capabilities are the functions those tasks resolve to.
 */
export function ActionsSection({
  assistant,
  onChange,
}: {
  assistant: Assistant;
  onChange: (patch: Partial<Assistant>) => void;
}) {
  function toggleTask(id: string) {
    const on = assistant.tasks.includes(id);
    const tasks = on ? assistant.tasks.filter((t) => t !== id) : [...assistant.tasks, id];

    // Keep capabilities in step with tasks, but never drop one another task
    // still needs, or one that was attached by hand.
    const needed = toolsForTasks(tasks);
    const removed = on ? (taskById(id)?.tools ?? []).filter((tool) => !needed.includes(tool)) : [];
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
    <div className="space-y-10">
      <div>
        <h3 className="text-ui font-medium text-text">Tasks</h3>
        <p className="mt-1 max-w-prose text-meta text-text-3">
          What this agent is allowed to do. This is what makes two agents on the same pipeline
          behave differently.
        </p>
        <div className="mt-4 grid gap-3 sm:grid-cols-2">
          {TASK_CATALOG.map((task) => {
            const selected = assistant.tasks.includes(task.id);
            const blocked =
              task.requiresAgentType !== undefined &&
              task.requiresAgentType !== assistant.agentType;

            return (
              <SelectCard
                key={task.id}
                selected={selected}
                disabled={blocked}
                onClick={() => toggleTask(task.id)}
              >
                <span className="flex w-full items-start gap-2.5">
                  <span className="mt-0.5">
                    <CheckBox checked={selected} />
                  </span>
                  <span className="min-w-0 flex-1">
                    <span className="flex items-center gap-1.5">
                      <span className="text-ui font-medium text-text">{task.name}</span>
                      {blocked ? (
                        <Lock className="h-3 w-3 shrink-0 text-text-3" strokeWidth={1.75} />
                      ) : null}
                    </span>
                    <span className="mt-1 block text-meta text-text-3">
                      {blocked ? "Needs the knowledge base pipeline" : task.description}
                    </span>
                  </span>
                </span>
              </SelectCard>
            );
          })}
        </div>
      </div>

      <div className="border-t border-line pt-8">
        <h3 className="text-ui font-medium text-text">Capabilities</h3>
        <p className="mt-1 max-w-prose text-meta text-text-3">
          The functions behind those tasks. Attached automatically when you pick a task; add extras
          if the agent needs them.
        </p>

        <div className="mt-4">
          <MultiSelect
            items={toolItems}
            selected={assistant.tools}
            onChange={(tools) => onChange({ tools })}
            placeholder="No capabilities attached"
          />
        </div>

        {assistant.tools.length > 0 ? (
          <ul className="mt-5 divide-y divide-line border-y border-line">
            {assistant.tools.map((id) => {
              const tool = toolById(id);
              if (!tool) return null;
              const required = requiredTools.includes(id);
              return (
                <li key={id} className="group flex items-start gap-4 py-3">
                  <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="font-mono text-ui text-text">{tool.name}</span>
                      {required ? <Tag>from a task</Tag> : <Tag>manual</Tag>}
                    </div>
                    <p className="mt-1 text-meta text-text-3">{tool.description}</p>
                  </div>
                  <span className="hidden w-24 shrink-0 pt-0.5 sm:block">
                    {tool.status === "live" ? (
                      <Status tone="live">Ready</Status>
                    ) : (
                      <Status tone="warn">Not built</Status>
                    )}
                  </span>
                  <IconButton
                    label={`Remove ${tool.name}`}
                    size="sm"
                    className="opacity-0 transition-opacity focus-visible:opacity-100 group-hover:opacity-100"
                    onClick={() => onChange({ tools: assistant.tools.filter((t) => t !== id) })}
                  >
                    <X className="h-3.5 w-3.5" strokeWidth={1.75} />
                  </IconButton>
                </li>
              );
            })}
          </ul>
        ) : (
          <p className="mt-5 text-meta text-text-3">
            Nothing attached yet. Pick a task above, or add a capability by hand.
          </p>
        )}

        <div className="mt-6">
          <Button variant="secondary" disabled>
            <Plus className="h-3.5 w-3.5" strokeWidth={2.25} />
            Add custom capability
          </Button>
          <p className="mt-2 text-meta text-text-3">
            Points the agent at your own HTTP endpoint. Needs the backend.
          </p>
        </div>
      </div>
    </div>
  );
}
