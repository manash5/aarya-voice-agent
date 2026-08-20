"use client";

import Link from "next/link";
import { useParams } from "next/navigation";
import { useMemo } from "react";

import { Breadcrumb, PageBody, PageHeader } from "@/components/app/PageHeader";
import {
  Button,
  CallEvent,
  Conversation,
  Property,
  PropertyList,
  Status,
  Tag,
  Turn,
} from "@/components/ui";
import { getSampleCall } from "@/lib/sampleCalls";

export default function CallDetailPage() {
  const params = useParams<{ callId: string }>();
  const call = useMemo(() => getSampleCall(params?.callId ?? ""), [params?.callId]);

  if (!call) {
    return (
      <>
        <PageHeader
          breadcrumb={<Breadcrumb href="/call-logs" label="Calls" />}
          title="Call not found"
          description="This console only holds a few worked examples. Open one from the list instead."
        />
        <PageBody>
          <Link href="/call-logs">
            <Button variant="primary">Back to calls</Button>
          </Link>
        </PageBody>
      </>
    );
  }

  return (
    <>
      <PageHeader
        breadcrumb={<Breadcrumb href="/call-logs" label="Calls" />}
        title={call.summary}
        eyebrow={
          <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-meta text-text-3">
            <Status tone={call.statusTone === "warn" ? "warn" : "live"}>{call.outcome}</Status>
            <span aria-hidden className="text-line-strong">·</span>
            <span>{call.assistant}</span>
            <span aria-hidden className="text-line-strong">·</span>
            <span>{call.started}</span>
            <span aria-hidden className="text-line-strong">·</span>
            <span className="tnum font-mono">{call.duration}</span>
          </div>
        }
        action={
          <Button variant="secondary" size="lg" disabled>
            Play recording
          </Button>
        }
      />

      <PageBody>
        <div className="animate-enter grid gap-10 lg:grid-cols-3">
          <div className="lg:col-span-2">
            <h2 className="text-heading font-medium text-text">Conversation</h2>
            <div className="mt-3 border-t border-line">
              <Conversation>
                {call.transcript.map((line) => (
                  <Turn
                    key={line.id}
                    speaker={line.speaker}
                    timestamp={line.timestamp}
                    onPlay={() => {}}
                  >
                    {line.text}
                  </Turn>
                ))}
              </Conversation>
            </div>

            {call.keyMoments.length > 0 ? (
              <div className="mt-10">
                <h2 className="text-heading font-medium text-text">Key moments</h2>
                <div className="mt-3 divide-y divide-line border-y border-line">
                  {call.keyMoments.map((moment, index) => (
                    <CallEvent key={`${moment.time}-${index}`} timestamp={moment.time}>
                      {moment.moment}
                    </CallEvent>
                  ))}
                </div>
              </div>
            ) : null}
          </div>

          <div className="space-y-10">
            <section>
              <h2 className="eyebrow mb-2">Summary</h2>
              <p className="text-ui text-text-2">{call.aiSummary}</p>
            </section>

            {call.extracted.length > 0 ? (
              <section>
                <h2 className="eyebrow mb-1">Captured</h2>
                <PropertyList className="border-y border-line">
                  {call.extracted.map((field) => (
                    <Property key={field.label} label={field.label}>
                      {field.value}
                    </Property>
                  ))}
                </PropertyList>
              </section>
            ) : null}

            <section>
              <h2 className="eyebrow mb-1">Call</h2>
              <PropertyList className="border-y border-line">
                <Property label="Id" mono>
                  {call.id}
                </Property>
                <Property label="Caller">{call.caller}</Property>
                <Property label="Duration" mono>
                  {call.duration}
                </Property>
                <Property label="Recording">Not stored</Property>
              </PropertyList>
            </section>

            {call.tags.length > 0 ? (
              <section>
                <h2 className="eyebrow mb-2">Tags</h2>
                <div className="flex flex-wrap gap-1.5">
                  {call.tags.map((tag) => (
                    <Tag key={tag}>{tag}</Tag>
                  ))}
                </div>
              </section>
            ) : null}
          </div>
        </div>
      </PageBody>
    </>
  );
}
