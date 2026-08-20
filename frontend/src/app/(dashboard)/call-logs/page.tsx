"use client";

import Link from "next/link";

import { PageBody, PageHeader } from "@/components/app/PageHeader";
import { Status } from "@/components/ui";
import { SAMPLE_CALLS } from "@/lib/sampleCalls";

/**
 * The call list. Every row leads with what the call was about rather than its
 * id, because that is what an operator scans for.
 */
export default function CallsPage() {
  return (
    <>
      <PageHeader
        title="Calls"
        description="Every conversation an agent has handled, with transcript and outcome. The rows below are worked examples — real calls appear once the backend receives LiveKit webhooks and stores them."
      />

      <PageBody>
        <div className="animate-enter">
          <ul className="divide-y divide-line border-t border-line">
            {SAMPLE_CALLS.map((call) => (
              <li key={call.id}>
                <Link
                  href={`/call-logs/${call.id}`}
                  className="group flex flex-wrap items-baseline gap-x-6 gap-y-2 py-4 transition-colors duration-[--fast] hover:bg-raised-hover"
                >
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-ui text-text">{call.summary}</p>
                    <p className="mt-1 flex flex-wrap items-center gap-x-2 text-meta text-text-3">
                      <span>{call.assistant}</span>
                      <span aria-hidden className="text-line-strong">
                        ·
                      </span>
                      <span className="font-mono">{call.id}</span>
                    </p>
                  </div>

                  <div className="flex shrink-0 items-center gap-6">
                    <span className="text-meta text-text-3">{call.started}</span>
                    <span className="tnum w-10 text-right font-mono text-meta text-text-2">
                      {call.duration}
                    </span>
                    <span className="w-24">
                      <Status tone={call.statusTone === "warn" ? "warn" : "live"}>
                        {call.outcome}
                      </Status>
                    </span>
                  </div>
                </Link>
              </li>
            ))}
          </ul>

          <p className="mt-6 border-t border-line pt-6 text-meta text-text-3">
            Stored calls will carry the full transcript, per-turn latency, which capabilities ran,
            and the recording where an agent has recording switched on.
          </p>
        </div>
      </PageBody>
    </>
  );
}
