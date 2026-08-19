"use client";

import { Play } from "lucide-react";

import { Badge, Button, Field, Panel, Select, Slider } from "@/components/ui/controls";
import { BACKGROUND_SOUNDS, VOICES, VOICE_PROVIDERS } from "@/lib/catalog";
import { cn } from "@/lib/cn";
import type { Assistant } from "@/lib/types";

export function VoiceTab({
  assistant,
  onChange,
}: {
  assistant: Assistant;
  onChange: (patch: Partial<Assistant>) => void;
}) {
  const { voice } = assistant;
  const voices = VOICES[voice.provider] ?? [];

  function patchVoice(patch: Partial<Assistant["voice"]>) {
    onChange({ voice: { ...voice, ...patch } });
  }

  return (
    <div className="space-y-5">
      <Panel
        title="Voice"
        description="Deepgram and Cartesia are the two providers wired into the pipelines today."
      >
        <div className="grid gap-4 sm:grid-cols-2">
          <Field label="Provider">
            <Select
              options={VOICE_PROVIDERS}
              value={voice.provider}
              onChange={(event) => {
                const provider = event.target.value;
                patchVoice({
                  provider,
                  voiceId: VOICES[provider]?.[0]?.value ?? "",
                });
              }}
            />
          </Field>
          <Field label="Voice">
            <Select
              options={voices}
              value={voice.voiceId}
              onChange={(event) => patchVoice({ voiceId: event.target.value })}
            />
          </Field>
        </div>

        <div className="mt-4 space-y-1.5">
          {voices.map((option) => {
            const selected = option.value === voice.voiceId;
            return (
              <button
                key={option.value}
                type="button"
                onClick={() => patchVoice({ voiceId: option.value })}
                className={cn(
                  "flex w-full items-center gap-3 rounded-lg border px-3 py-2.5 text-left transition-colors",
                  selected
                    ? "border-accent/60 bg-accent/[0.06]"
                    : "border-line bg-panel-2 hover:border-ink-dim",
                )}
              >
                <span
                  className={cn(
                    "flex h-7 w-7 shrink-0 items-center justify-center rounded-full",
                    selected ? "bg-accent text-accent-ink" : "bg-elevated text-ink-dim",
                  )}
                >
                  <Play className="h-3 w-3" fill="currentColor" />
                </span>
                <span className="min-w-0 flex-1">
                  <span className="flex items-center gap-2">
                    <span className="text-sm text-ink">{option.label}</span>
                    {option.planned ? <Badge tone="outline">planned</Badge> : null}
                  </span>
                  {option.hint ? (
                    <span className="block text-[11px] text-ink-dim">{option.hint}</span>
                  ) : null}
                </span>
                <span className="font-mono text-[11px] text-ink-dim">{option.value}</span>
              </button>
            );
          })}
        </div>
        <p className="mt-3 text-[11px] text-ink-dim">
          Previews need the backend to proxy the provider, so the play buttons only select a voice
          for now.
        </p>
      </Panel>

      <Panel title="Delivery">
        <div className="grid gap-4 sm:grid-cols-2">
          <Field label="Speed" hint="Deepgram accepts 0.7 to 1.5. The English agent runs at 1.15.">
            <Slider
              value={voice.speed}
              min={0.7}
              max={1.5}
              step={0.05}
              onChange={(speed) => patchVoice({ speed })}
              format={(value) => `${value.toFixed(2)}x`}
            />
          </Field>
          <Field label="Background sound" hint="Played under the agent to mask dead air.">
            <Select
              options={BACKGROUND_SOUNDS}
              value={voice.background}
              onChange={(event) => patchVoice({ background: event.target.value })}
            />
          </Field>
        </div>
      </Panel>

      <Panel title="Test" description="Say a line in this voice once call dispatch exists.">
        <Button variant="secondary" disabled>
          <Play className="h-3.5 w-3.5" />
          Preview voice
        </Button>
      </Panel>
    </div>
  );
}
