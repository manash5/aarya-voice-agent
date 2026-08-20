"use client";

import { PageBody, PageHeader } from "@/components/app/PageHeader";
import { Button, Property, PropertyList, Section, Status } from "@/components/ui";

export default function BillingPage() {
  return (
    <>
      <PageHeader
        title="Billing"
        description="Usage and plan state for your voice operations workspace."
      />

      <PageBody>
        <div className="animate-enter space-y-10">
          <Section title="Current plan">
            <PropertyList className="border-y border-line">
              <Property label="Plan">Build</Property>
              <Property label="Status">
                <Status tone="live">Active</Status>
              </Property>
              <Property label="Cycle">Monthly</Property>
            </PropertyList>
            <div className="mt-4">
              <Button variant="secondary" disabled>
                Upgrade plan
              </Button>
            </div>
          </Section>

          <Section title="Usage">
            <PropertyList className="border-y border-line">
              <Property label="Calls this month">No call history yet</Property>
              <Property label="Call minutes">0 min</Property>
              <Property label="Transcription">0 min</Property>
              <Property label="TTS output">0 min</Property>
            </PropertyList>
          </Section>

          <Section title="Invoices">
            <div className="rounded-3 border border-dashed border-line px-6 py-10 text-center">
              <p className="display text-title text-text">No invoices yet</p>
              <p className="mx-auto mt-2 max-w-sm text-ui text-text-3">
                Invoices will appear once billing is connected to persisted workspace usage.
              </p>
            </div>
          </Section>
        </div>
      </PageBody>
    </>
  );
}

