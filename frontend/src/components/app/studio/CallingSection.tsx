"use client";

import Link from "next/link";

import { Field, Input, Slider, Toggle } from "@/components/ui";
import type { Assistant } from "@/lib/types";

/** How a real call is handled: which number, how long, what's kept. */
export function CallingSection({
  assistant,
  onChange,
}: {
  assistant: Assistant;
  onChange: (patch: Partial<Assistant>) => void;
}) {
  const { advanced } = assistant;

  return (
    <div className="space-y-10">
      <div className="max-w-md">
        <Field
          label="Phone number"
          description="The number callers dial to reach this agent."
          hint="Routing inbound calls needs a SIP trunk wired into LiveKit, so this is a label for now."
        >
          <Input
            value={assistant.phoneNumber}
            onChange={(event) => onChange({ phoneNumber: event.target.value })}
            placeholder="+977 98•• ••• ••"
            className="font-mono"
          />
        </Field>
        <p className="mt-3 text-meta text-text-3">
          No number yet?{" "}
          <Link
            href="/phone-numbers"
            className="rounded-1 text-accent underline decoration-accent-line underline-offset-2 transition-colors hover:text-accent-hover"
          >
            Set up telephony
          </Link>
          .
        </p>
      </div>

      <div className="border-t border-line pt-8">
        <h3 className="text-ui font-medium text-text">Call limits</h3>
        <p className="mt-1 max-w-prose text-meta text-text-3">
          Guards against a call that never ends — dead air, or a caller who walked away.
        </p>

        <div className="mt-5 grid gap-6 sm:grid-cols-2">
          <Field label="Hang up after silence" hint="Dead air before the agent ends the call.">
            <Slider
              label="Silence timeout"
              value={advanced.silenceTimeout}
              min={5}
              max={60}
              step={5}
              onChange={(silenceTimeout) => onChange({ advanced: { ...advanced, silenceTimeout } })}
              format={(value) => `${value}s`}
            />
          </Field>
          <Field label="Maximum call length">
            <Slider
              label="Max call duration"
              value={advanced.maxDuration}
              min={60}
              max={1800}
              step={60}
              onChange={(maxDuration) => onChange({ advanced: { ...advanced, maxDuration } })}
              format={(value) => `${Math.round(value / 60)} min`}
            />
          </Field>
        </div>

        <div className="mt-6 divide-y divide-line border-y border-line">
          <Toggle
            label="Record calls"
            description="Keep audio and a transcript against the call record."
            checked={advanced.recordCalls}
            onChange={(recordCalls) => onChange({ advanced: { ...advanced, recordCalls } })}
          />
        </div>
      </div>
    </div>
  );
}
