"use client";

import Link from "next/link";

import { PageBody, PageHeader } from "@/components/app/PageHeader";
import { CallEvent, Property, PropertyList, Section } from "@/components/ui";
import { SAMPLE_CALLS } from "@/lib/sampleCalls";

export default function ActivityPage() {
  return (
    <>
      <PageHeader
        title="Activity"
        description="Operational timeline of calls, status changes and capability usage."
      />

      <PageBody>
        <div className="animate-enter space-y-10">
          <Section title="Timeline">
            <div className="divide-y divide-line border-y border-line">
              {SAMPLE_CALLS.map((call, idx) => (
                <CallEvent key={call.id} timestamp={`T-${idx + 1}`}>
                  <Link
                    href={`/call-logs/${call.id}`}
                    className="rounded-1 text-text-2 underline decoration-line-strong underline-offset-2 transition-colors hover:text-text"
                  >
                    {call.outcome}
                  </Link>{" "}
                  · {call.summary}
                </CallEvent>
              ))}
            </div>
          </Section>

          <Section title="System health">
            <PropertyList className="border-y border-line">
              <Property label="Worker status">Ready</Property>
              <Property label="SIP routing">Not configured</Property>
              <Property label="Call persistence">Pending backend</Property>
            </PropertyList>
          </Section>
        </div>
      </PageBody>
    </>
  );
}

