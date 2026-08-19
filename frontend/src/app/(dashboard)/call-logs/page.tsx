import { Info } from "lucide-react";

import { PageHeader } from "@/components/dashboard/PageHeader";
import { Badge } from "@/components/ui/controls";

const SAMPLE_CALLS = [
  {
    id: "c_8f21a4",
    assistant: "Scalina Media · Reception",
    caller: "+61 4•• ••• 812",
    started: "Today, 10:14",
    duration: "1:42",
    outcome: "Answered",
    summary: "Asked about short-form content pricing, sent to info@scalinamedia.com.",
  },
  {
    id: "c_5d90b2",
    assistant: "Scalina Media · Reception",
    caller: "+61 4•• ••• 233",
    started: "Today, 09:02",
    duration: "3:07",
    outcome: "Booked",
    summary: "Booked a Tuesday 14:00 intro call via book_appointment.",
  },
  {
    id: "c_1ac7e6",
    assistant: "Scalina Media · नेपाली",
    caller: "+977 98•• ••• 41",
    started: "Yesterday, 17:36",
    duration: "0:48",
    outcome: "Dropped",
    summary: "Caller hung up during the greeting.",
  },
];

export default function CallLogsPage() {
  return (
    <>
      <PageHeader
        title="Call logs"
        description="Transcripts, latency and cost per call, once calls are persisted."
      />

      <div className="min-h-0 flex-1 overflow-y-auto px-8 py-6">
        <div className="mx-auto max-w-5xl space-y-4">
          <div className="flex items-start gap-2.5 rounded-xl border border-line bg-panel px-4 py-3 text-xs text-ink-dim">
            <Info className="mt-0.5 h-3.5 w-3.5 shrink-0" />
            <p className="leading-relaxed">
              Sample rows. Real calls show up here once the backend stores call history from the
              LiveKit workers.
            </p>
          </div>

          <div className="overflow-hidden rounded-xl border border-line bg-panel">
            <table className="w-full text-left text-sm">
              <thead className="border-b border-line-soft text-[11px] uppercase tracking-wider text-ink-dim">
                <tr>
                  <th className="px-4 py-2.5 font-medium">Call</th>
                  <th className="px-4 py-2.5 font-medium">Assistant</th>
                  <th className="px-4 py-2.5 font-medium">Started</th>
                  <th className="px-4 py-2.5 font-medium">Duration</th>
                  <th className="px-4 py-2.5 font-medium">Outcome</th>
                </tr>
              </thead>
              <tbody className="opacity-60">
                {SAMPLE_CALLS.map((call) => (
                  <tr key={call.id} className="border-b border-line-soft last:border-b-0">
                    <td className="px-4 py-3">
                      <span className="block font-mono text-xs text-ink">{call.id}</span>
                      <span className="mt-0.5 block max-w-xs truncate text-[11px] text-ink-dim">
                        {call.summary}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-xs text-ink-muted">{call.assistant}</td>
                    <td className="px-4 py-3 text-xs text-ink-muted">{call.started}</td>
                    <td className="px-4 py-3 font-mono text-xs text-ink-muted">{call.duration}</td>
                    <td className="px-4 py-3">
                      <Badge tone={call.outcome === "Dropped" ? "warn" : "accent"}>
                        {call.outcome}
                      </Badge>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </>
  );
}
