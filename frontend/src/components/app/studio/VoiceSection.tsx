"use client";

import { Check, Play } from "lucide-react";

import { Field, Select, SelectCard, Slider, Tag } from "@/components/ui";
import {
  AGENT_TYPE_LIST,
  BACKGROUND_SOUNDS,
  TRANSCRIBER_LANGUAGES,
  TRANSCRIBER_MODELS,
  TRANSCRIBER_PROVIDERS,
  VOICES,
  VOICE_PROVIDERS,
  agentTypeDefaults,
  taskById,
  toolsForTasks,
} from "@/lib/catalog";
import { cn } from "@/lib/cn";
import type { AgentTypeId, Assistant } from "@/lib/types";

/** Pipeline, voice, language, pacing - everything about how the agent sounds. */
export function VoiceSection({
  assistant,
  onChange,
}: {
  assistant: Assistant;
  onChange: (patch: Partial<Assistant>) => void;
}) {
  const { voice, transcriber } = assistant;
  const voices = VOICES[voice.provider] ?? [];

  function patchVoice(patch: Partial<Assistant["voice"]>) {
    onChange({ voice: { ...voice, ...patch } });
  }

  /**
   * Voice, transcriber and endpointing belong to the pipeline, so switching
   * resets those to the new pipeline's defaults. The prompt, company and tasks
   * are the operator's, so they survive.
   */
  function switchPipeline(agentType: AgentTypeId) {
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
    <div className="space-y-10">
      <div>
        <h3 className="text-ui font-medium text-text">Pipeline</h3>
        <p className="mt-1 max-w-prose text-meta text-text-3">
          The speech stack this agent runs on. Switching resets the voice, transcriber and
          endpointing to that pipeline&apos;s defaults.
        </p>
        <div className="mt-4 grid gap-3 sm:grid-cols-3">
          {AGENT_TYPE_LIST.map((type) => {
            const selected = type.id === assistant.agentType;
            return (
              <SelectCard
                key={type.id}
                selected={selected}
                onClick={() => switchPipeline(type.id)}
              >
                <span className="flex h-5 w-full items-center justify-between gap-2">
                  <span className="flex min-w-0 items-center gap-2">
                    <span
                      className="h-1.5 w-1.5 shrink-0 rounded-full"
                      style={{ background: type.accent }}
                    />
                    <span className="truncate text-ui font-medium text-text">{type.name}</span>
                  </span>
                  {selected ? (
                    <Check className="h-3.5 w-3.5 shrink-0 text-accent" strokeWidth={2.25} />
                  ) : null}
                </span>
                <span className="mt-2 block text-meta text-text-3">{type.tagline}</span>
                <span className="mt-3 block font-mono text-micro text-text-3">{type.worker}</span>
              </SelectCard>
            );
          })}
        </div>
      </div>

      <div className="border-t border-line pt-8">
        <h3 className="text-ui font-medium text-text">Voice</h3>
        <div className="mt-4 grid gap-6 sm:grid-cols-2">
          <Field label="Provider">
            <Select
              options={VOICE_PROVIDERS}
              value={voice.provider}
              onChange={(event) => {
                const provider = event.target.value;
                patchVoice({ provider, voiceId: VOICES[provider]?.[0]?.value ?? "" });
              }}
            />
          </Field>
          <Field label="Pace" hint="Deepgram accepts 0.7 to 1.5. The English agent runs at 1.15.">
            <Slider
              label="Pace"
              value={voice.speed}
              min={0.7}
              max={1.5}
              step={0.05}
              onChange={(speed) => patchVoice({ speed })}
              format={(value) => `${value.toFixed(2)}×`}
            />
          </Field>
        </div>

        <ul className="mt-6 divide-y divide-line border-y border-line">
          {voices.map((option) => {
            const selected = option.value === voice.voiceId;
            return (
              <li key={option.value}>
                <button
                  type="button"
                  aria-pressed={selected}
                  onClick={() => patchVoice({ voiceId: option.value })}
                  className={cn(
                    "group flex w-full items-center gap-3.5 px-1 py-3 text-left",
                    "transition-colors duration-[--fast] ease-[--ease] hover:bg-raised-hover",
                  )}
                >
                  <span
                    className={cn(
                      "flex h-7 w-7 shrink-0 items-center justify-center rounded-full transition-colors duration-[--fast]",
                      selected
                        ? "bg-accent text-accent-ink"
                        : "border border-line text-text-3 group-hover:text-text-2",
                    )}
                  >
                    <Play className="h-2.5 w-2.5" fill="currentColor" strokeWidth={0} />
                  </span>
                  <span className="min-w-0 flex-1">
                    <span className="flex items-center gap-2">
                      <span className={cn("text-ui", selected ? "font-medium text-text" : "text-text-2")}>
                        {option.label}
                      </span>
                      {option.planned ? <Tag tone="warn">planned</Tag> : null}
                    </span>
                    {option.hint ? (
                      <span className="mt-0.5 block text-meta text-text-3">{option.hint}</span>
                    ) : null}
                  </span>
                  <span className="hidden shrink-0 font-mono text-micro text-text-3 sm:block">
                    {option.value}
                  </span>
                </button>
              </li>
            );
          })}
        </ul>
        <p className="mt-3 text-meta text-text-3">
          Previews need the backend to proxy the provider, so these buttons select a voice rather
          than play it.
        </p>
      </div>

      <div className="border-t border-line pt-8">
        <h3 className="text-ui font-medium text-text">Hearing</h3>
        <p className="mt-1 max-w-prose text-meta text-text-3">
          Speech-to-text. Each pipeline falls back down its own provider list if the first fails.
        </p>
        <div className="mt-4 grid gap-6 sm:grid-cols-3">
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

        <div className="mt-6 max-w-md">
          <Field label="Background sound" hint="Played under the agent to mask dead air.">
            <Select
              options={BACKGROUND_SOUNDS}
              value={voice.background}
              onChange={(event) => patchVoice({ background: event.target.value })}
            />
          </Field>
        </div>
      </div>
    </div>
  );
}
