"use client";

import Link from "next/link";

import { Button } from "@/components/ui";
import type { Assistant } from "@/lib/types";

/** What actually happened on real calls. Empty until the backend stores them. */
export function ActivitySection({
  assistant,
  onTest,
}: {
  assistant: Assistant;
  onTest: () => void;
}) {
  return (
    <div className="space-y-10">
      <div className="rounded-3 border border-dashed border-line px-6 py-12 text-center">
        <h3 className="display text-title text-text">No calls yet</h3>
        <p className="mx-auto mt-2 max-w-sm text-ui text-text-3">
          {assistant.status === "published"
            ? "This agent is published. Once someone calls it, every conversation and outcome lands here."
            : "This agent is still a draft. Publish it, or run a test call to hear how it answers."}
        </p>
        <div className="mt-6 flex flex-wrap items-center justify-center gap-2">
          <Button variant="primary" onClick={onTest}>
            Run a test call
          </Button>
          <Link href="/call-logs">
            <Button variant="ghost">See all calls</Button>
          </Link>
        </div>
      </div>

      <div className="border-t border-line pt-8">
        <h3 className="text-ui font-medium text-text">What a stored call will hold</h3>
        <ul className="mt-4 divide-y divide-line border-y border-line">
          {[
            "The full conversation, turn by turn, with who spoke when",
            "Time to first word, and per-turn latency from the evaluation module",
            "Which capabilities ran mid-call, and what they returned",
            "Recording, when this agent has recording switched on",
            "Outcome: answered, booked, transferred or dropped",
          ].map((item) => (
            <li key={item} className="py-2.5 text-ui text-text-3">
              {item}
            </li>
          ))}
        </ul>
        <p className="mt-3 text-meta text-text-3">
          Persisting call history needs the backend to receive LiveKit webhooks and write them to a
          database.
        </p>
      </div>
    </div>
  );
}
