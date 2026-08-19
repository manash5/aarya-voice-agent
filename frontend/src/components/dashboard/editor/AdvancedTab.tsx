"use client";

import { Field, Panel, Select, Slider, Toggle } from "@/components/ui/controls";
import {
  TRANSCRIBER_LANGUAGES,
  TRANSCRIBER_MODELS,
  TRANSCRIBER_PROVIDERS,
} from "@/lib/catalog";
import type { Assistant } from "@/lib/types";

export function AdvancedTab({
  assistant,
  onChange,
}: {
  assistant: Assistant;
  onChange: (patch: Partial<Assistant>) => void;
}) {
  const { transcriber, advanced } = assistant;

  return (
    <div className="space-y-5">
      <Panel
        title="Transcriber"
        description="Speech-to-text. Each pipeline falls back down its own provider list if the first one fails."
      >
        <div className="grid gap-4 sm:grid-cols-3">
          <Field label="Provider">
            <Select
              options={TRANSCRIBER_PROVIDERS}
              value={transcriber.provider}
              onChange={(event) => {
                const provider = event.target.value;
                onChange({
                  transcriber: {
                    ...transcriber,
                    provider,
                    model: TRANSCRIBER_MODELS[provider]?.[0]?.value ?? "",
                  },
                });
              }}
            />
          </Field>
          <Field label="Model">
            <Select
              options={TRANSCRIBER_MODELS[transcriber.provider] ?? []}
              value={transcriber.model}
              onChange={(event) =>
                onChange({ transcriber: { ...transcriber, model: event.target.value } })
              }
            />
          </Field>
          <Field label="Language">
            <Select
              options={TRANSCRIBER_LANGUAGES}
              value={transcriber.language}
              onChange={(event) =>
                onChange({ transcriber: { ...transcriber, language: event.target.value } })
              }
            />
          </Field>
        </div>
      </Panel>

      <Panel
        title="Turn taking"
        description="How long the agent waits before deciding the caller has finished talking."
      >
        <div className="grid gap-4 sm:grid-cols-2">
          <Field
            label="Max endpointing delay"
            hint="0.60s for English, 0.70s for RAG, 0.85s for Nepali."
          >
            <Slider
              value={advanced.maxDelay}
              min={0.3}
              max={1.5}
              step={0.05}
              onChange={(maxDelay) => onChange({ advanced: { ...advanced, maxDelay } })}
              format={(value) => `${value.toFixed(2)}s`}
            />
          </Field>
          <Field label="Silence timeout" hint="Hang up after this much dead air.">
            <Slider
              value={advanced.silenceTimeout}
              min={5}
              max={60}
              step={5}
              onChange={(silenceTimeout) => onChange({ advanced: { ...advanced, silenceTimeout } })}
              format={(value) => `${value}s`}
            />
          </Field>
          <Field label="Max call duration">
            <Slider
              value={advanced.maxDuration}
              min={60}
              max={1800}
              step={60}
              onChange={(maxDuration) => onChange({ advanced: { ...advanced, maxDuration } })}
              format={(value) => `${Math.round(value / 60)}m`}
            />
          </Field>
        </div>

        <div className="mt-4 grid gap-2 sm:grid-cols-2">
          <Toggle
            label="Allow interruptions"
            description="Caller can talk over the agent and it stops mid-sentence."
            checked={advanced.allowInterruptions}
            onChange={(allowInterruptions) =>
              onChange({ advanced: { ...advanced, allowInterruptions } })
            }
          />
          <Toggle
            label="Record calls"
            description="Keep audio and a transcript for the call log."
            checked={advanced.recordCalls}
            onChange={(recordCalls) => onChange({ advanced: { ...advanced, recordCalls } })}
          />
        </div>
      </Panel>
    </div>
  );
}
