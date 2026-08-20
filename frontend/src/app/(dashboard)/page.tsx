"use client";

import { ArrowRight, Plus } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState, useSyncExternalStore } from "react";

import { AssistantRow } from "@/components/app/AssistantRow";
import { PageBody, PageHeader } from "@/components/app/PageHeader";
import { CreateAssistantModal } from "@/components/app/CreateAssistantModal";
import { Button, RowSkeleton, Section } from "@/components/ui";
import { AGENT_TYPE_LIST } from "@/lib/catalog";
import { reviewAgent } from "@/lib/readiness";
import { useStore } from "@/lib/store";

const noopSubscribe = () => () => {};

/** Local time decides the greeting, so the server cannot know it. */
function useGreeting() {
  const mounted = useSyncExternalStore(
    noopSubscribe,
    () => true,
    () => false,
  );
  if (!mounted) return null;
  const hour = new Date().getHours();
  return hour < 12 ? "Good morning" : hour < 18 ? "Good afternoon" : "Good evening";
}

export default function OverviewPage() {
  const { assistants, hydrated, add } = useStore();
  const [creating, setCreating] = useState(false);
  const greeting = useGreeting();
  const router = useRouter();

  const live = assistants.filter((a) => a.status === "published").length;
  const drafts = assistants.length - live;
  const needsAttention = assistants.filter(
    (a) => reviewAgent(a).some((f) => f.severity === "blocker"),
  ).length;

  /**
   * State of the estate in a sentence. A row of zeroes under all-caps labels
   * tells an operator nothing; this tells them whether anything needs them.
   */
  function situation() {
    if (!hydrated) return undefined;
    if (assistants.length === 0) {
      return "Nothing is running yet. Build an agent and you can talk to it in the browser straight away.";
    }
    const parts: string[] = [];
    parts.push(
      live === 0
        ? "No agents are taking calls yet"
        : `${live} agent${live > 1 ? "s are" : " is"} taking calls`,
    );
    if (drafts > 0) parts.push(`${drafts} still in draft`);
    if (needsAttention > 0) {
      parts.push(`${needsAttention} can't publish until something is fixed`);
    }
    return `${parts.join(", ")}.`;
  }

  return (
    <>
      <PageHeader
        title={greeting ?? "Welcome"}
        description={situation()}
        action={
          <Button variant="primary" size="lg" onClick={() => setCreating(true)}>
            <Plus className="h-3.5 w-3.5" strokeWidth={2.25} />
            New agent
          </Button>
        }
      />

      <PageBody>
        <div className="animate-enter space-y-12">
          <Section
            title="Agents"
            action={
              assistants.length > 0 ? (
                <Link
                  href="/assistants"
                  className="group inline-flex items-center gap-1 rounded-1 text-meta text-text-3 transition-colors hover:text-text"
                >
                  All agents
                  <ArrowRight
                    className="h-3 w-3 transition-transform duration-[--fast] group-hover:translate-x-0.5"
                    strokeWidth={2}
                  />
                </Link>
              ) : null
            }
          >
            <div className="border-t border-line">
              {!hydrated ? (
                <>
                  <RowSkeleton />
                  <RowSkeleton />
                </>
              ) : assistants.length === 0 ? (
                <div className="py-14 text-center">
                  <h3 className="display text-title text-text">No agents yet</h3>
                  <p className="mx-auto mt-2 max-w-sm text-ui text-text-3">
                    An agent is a company, a set of tasks and a voice, running on one of the three
                    pipelines.
                  </p>
                  <Button variant="primary" className="mt-6" onClick={() => setCreating(true)}>
                    <Plus className="h-3.5 w-3.5" strokeWidth={2.25} />
                    Create your first agent
                  </Button>
                </div>
              ) : (
                <div className="stagger">
                  {assistants.slice(0, 5).map((assistant) => (
                    <AssistantRow
                      key={assistant.id}
                      assistant={assistant}
                      href={`/assistants/${assistant.id}`}
                    />
                  ))}
                </div>
              )}
            </div>
          </Section>

          <Section title="Call volume">
            <p className="max-w-prose border-t border-line pt-4 text-ui text-text-3">
              No calls recorded yet.{" "}
              {live > 0
                ? "Your live agents will start filling this in as soon as someone dials them."
                : "Publish an agent, or run a test call from its studio."}
            </p>
          </Section>

          <Section
            title="Pipelines"
            description="The speech stack an agent runs on. It decides the transcriber, the voice, and how long the agent waits before it answers."
          >
            <div className="grid gap-6 border-t border-line pt-5 sm:grid-cols-3">
              {AGENT_TYPE_LIST.map((type) => {
                const count = assistants.filter((a) => a.agentType === type.id).length;
                return (
                  <div key={type.id}>
                    <div className="flex items-center gap-2">
                      <span
                        className="h-1.5 w-1.5 shrink-0 rounded-full"
                        style={{ background: type.accent }}
                      />
                      <h3 className="text-ui font-medium text-text">{type.name}</h3>
                    </div>
                    <p className="mt-2 text-meta text-text-3">{type.tagline}</p>
                    <p className="mt-3 text-micro text-text-3">
                      <span className="font-mono">{type.worker}</span>
                      {hydrated ? (
                        <>
                          {" · "}
                          {count === 0
                            ? "not in use"
                            : `${count} agent${count > 1 ? "s" : ""}`}
                        </>
                      ) : null}
                    </p>
                  </div>
                );
              })}
            </div>
          </Section>
        </div>
      </PageBody>

      <CreateAssistantModal
        open={creating}
        onClose={() => setCreating(false)}
        onCreate={(input) => router.push(`/assistants/${add(input).id}`)}
      />
    </>
  );
}
