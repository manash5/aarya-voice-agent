"use client";

import { PhoneCall } from "lucide-react";

import { EmptyState, Panel } from "@/components/ui/controls";
import type { Assistant } from "@/lib/types";

export function LogsTab({ assistant }: { assistant: Assistant }) {
  return (
    <div className="space-y-5">
      <Panel
        title="Calls"
        description={`Every call handled by ${assistant.name}, with transcript, latency and cost.`}
      >
        <EmptyState
          icon={<PhoneCall className="h-4 w-4" />}
          title="No calls recorded"
          description="Test calls from the Playground aren't stored yet. Persisting call history needs the backend to receive LiveKit webhooks and write them to a database."
        />
      </Panel>

      <Panel title="What a stored call will hold">
        <ul className="space-y-2 text-xs leading-relaxed text-ink-dim">
          {[
            "Full transcript, turn by turn, with who spoke when",
            "Time to first word and per-turn latency from the evaluation module",
            "Which tools the assistant called, and what they returned",
            "Recording, when the assistant has recording switched on",
            "Outcome: answered, booked, transferred or dropped",
          ].map((item) => (
            <li key={item} className="flex gap-2">
              <span className="mt-1.5 h-1 w-1 shrink-0 rounded-full bg-ink-dim" />
              {item}
            </li>
          ))}
        </ul>
      </Panel>
    </div>
  );
}
