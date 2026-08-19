"use client";

import { Check } from "lucide-react";

import { Field, Input, Panel, Select, Slider, Textarea } from "@/components/ui/controls";
import {
  AGENT_TYPE_LIST,
  LLM_MODELS,
  LLM_PROVIDERS,
  agentTypeDefaults,
  taskById,
  toolsForTasks,
} from "@/lib/catalog";
import { cn } from "@/lib/cn";
import type { Assistant, AgentTypeId } from "@/lib/types";

export function AgentTab({
  assistant,
  onChange,
}: {
  assistant: Assistant;
  onChange: (patch: Partial<Assistant>) => void;
}) {
  const { model } = assistant;
  const models = LLM_MODELS[model.provider] ?? [];

  function patchModel(patch: Partial<Assistant["model"]>) {
    onChange({ model: { ...model, ...patch } });
  }

  /**
   * Voice, transcriber and endpointing belong to the pipeline, so switching
   * type resets those to the new pipeline's defaults. The prompt, company and
   * tasks are the user's, so they survive.
   */
  function switchAgentType(agentType: AgentTypeId) {
    if (agentType === assistant.agentType) return;
    const defaults = agentTypeDefaults(agentType);
    const tasks = assistant.tasks.filter((id) => {
      const required = taskById(id)?.requiresAgentType;
      return required === undefined || required === agentType;
    });

    onChange({
      agentType,
      tasks,
      tools: [...new Set([...assistant.tools, ...toolsForTasks(tasks)])],
      voice: defaults.voice,
      transcriber: defaults.transcriber,
      advanced: { ...assistant.advanced, maxDelay: defaults.advanced.maxDelay },
    });
  }

  return (
    <div className="space-y-5">
      <Panel
        title="Agent type"
        description="Which pipeline in voice-agent/ runs this assistant. Switching resets the voice, transcriber and endpointing to that pipeline's defaults."
      >
        <div className="grid gap-2 sm:grid-cols-3">
          {AGENT_TYPE_LIST.map((type) => {
            const selected = type.id === assistant.agentType;
            return (
              <button
                key={type.id}
                type="button"
                onClick={() => switchAgentType(type.id)}
                className={cn(
                  "rounded-lg border p-3 text-left transition-colors",
                  selected
                    ? "border-accent/60 bg-accent/[0.06]"
                    : "border-line bg-panel-2 hover:border-ink-dim",
                )}
              >
                <span className="flex items-center justify-between gap-2">
                  <span className="flex items-center gap-2">
                    <span
                      className="h-2 w-2 shrink-0 rounded-full"
                      style={{ background: type.accent }}
                    />
                    <span className="text-sm text-ink">{type.name}</span>
                  </span>
                  {selected ? <Check className="h-3.5 w-3.5 shrink-0 text-accent" /> : null}
                </span>
                <span className="mt-1.5 block text-[11px] leading-relaxed text-ink-dim">
                  {type.tagline}
                </span>
                <span className="mt-2 block font-mono text-[10px] text-ink-dim">{type.worker}</span>
              </button>
            );
          })}
        </div>
      </Panel>

      <Panel
        title="First message"
        description="Spoken the moment the call connects, before the caller says anything."
      >
        <Input
          value={model.firstMessage}
          onChange={(event) => patchModel({ firstMessage: event.target.value })}
          placeholder="Hey, thanks for calling…"
        />
      </Panel>

      <Panel
        title="System prompt"
        description="Layered on top of the shared Aarya persona. Keep it about this assistant's rules, not about how it talks."
      >
        <Textarea
          rows={10}
          value={model.systemPrompt}
          onChange={(event) => patchModel({ systemPrompt: event.target.value })}
          className="font-mono text-xs"
        />
      </Panel>

      <Panel title="Model">
        <div className="grid gap-4 sm:grid-cols-2">
          <Field label="Provider">
            <Select
              options={LLM_PROVIDERS}
              value={model.provider}
              onChange={(event) => {
                const provider = event.target.value;
                patchModel({ provider, model: LLM_MODELS[provider]?.[0]?.value ?? "" });
              }}
            />
          </Field>
          <Field label="Model" hint={models.find((option) => option.value === model.model)?.hint}>
            <Select
              options={models}
              value={model.model}
              onChange={(event) => patchModel({ model: event.target.value })}
            />
          </Field>
          <Field label="Temperature" hint="Lower is steadier on the phone.">
            <Slider
              value={model.temperature}
              min={0}
              max={1}
              step={0.05}
              onChange={(temperature) => patchModel({ temperature })}
              format={(value) => value.toFixed(2)}
            />
          </Field>
          <Field label="Max response tokens" hint="Caps how long a single spoken reply can run.">
            <Slider
              value={model.maxTokens}
              min={40}
              max={400}
              step={10}
              onChange={(maxTokens) => patchModel({ maxTokens })}
            />
          </Field>
        </div>
      </Panel>
    </div>
  );
}
