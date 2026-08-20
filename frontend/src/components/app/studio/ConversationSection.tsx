"use client";

import { Field, Select, Slider, Toggle } from "@/components/ui";
import { LLM_MODELS, LLM_PROVIDERS } from "@/lib/catalog";
import type { Assistant } from "@/lib/types";

/** How the agent thinks and how it takes its turn. */
export function ConversationSection({
  assistant,
  onChange,
}: {
  assistant: Assistant;
  onChange: (patch: Partial<Assistant>) => void;
}) {
  const { model, advanced } = assistant;
  const models = LLM_MODELS[model.provider] ?? [];

  function patchModel(patch: Partial<Assistant["model"]>) {
    onChange({ model: { ...model, ...patch } });
  }

  return (
    <div className="space-y-10">
      <div className="grid gap-6 sm:grid-cols-2">
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
        <Field
          label="Consistency"
          hint="Lower keeps the agent saying the same thing to the same question."
        >
          <Slider
            label="Temperature"
            value={model.temperature}
            min={0}
            max={1}
            step={0.05}
            onChange={(temperature) => patchModel({ temperature })}
            format={(value) => value.toFixed(2)}
          />
        </Field>
        <Field label="Reply length" hint="Caps how long a single spoken reply can run.">
          <Slider
            label="Max response tokens"
            value={model.maxTokens}
            min={40}
            max={400}
            step={10}
            onChange={(maxTokens) => patchModel({ maxTokens })}
            format={(value) => `${value} tokens`}
          />
        </Field>
      </div>

      <div className="border-t border-line pt-8">
        <h3 className="text-ui font-medium text-text">Turn taking</h3>
        <p className="mt-1 max-w-prose text-meta text-text-3">
          How long the agent waits before it decides the caller has finished talking. Too short and
          it interrupts; too long and it feels slow.
        </p>

        <div className="mt-5 max-w-md">
          <Field label="Endpointing delay" hint="0.60s English · 0.70s knowledge base · 0.85s Nepali.">
            <Slider
              label="Endpointing delay"
              value={advanced.maxDelay}
              min={0.3}
              max={1.5}
              step={0.05}
              onChange={(maxDelay) => onChange({ advanced: { ...advanced, maxDelay } })}
              format={(value) => `${value.toFixed(2)}s`}
            />
          </Field>
        </div>

        <div className="mt-6 divide-y divide-line border-y border-line">
          <Toggle
            label="Allow interruptions"
            description="The caller can talk over the agent and it stops mid-sentence."
            checked={advanced.allowInterruptions}
            onChange={(allowInterruptions) =>
              onChange({ advanced: { ...advanced, allowInterruptions } })
            }
          />
        </div>
      </div>
    </div>
  );
}
