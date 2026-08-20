"use client";

import type { ReactNode } from "react";

import { Disclosure, Field, Input, ListInput, Textarea } from "@/components/ui";
import { BEHAVIOR_SECTIONS, composeSystemPrompt } from "@/lib/behavior";
import type { Assistant, BehaviorConfig } from "@/lib/types";

/**
 * The behaviour editor. An operator decides what an agent is for, how it
 * sounds and what it must not do - those are the fields. The prompt is what
 * those decisions compile to, and it stays visible but out of the way.
 */
/** A named cluster of decisions, so the section reads as prose with fields in
 *  it rather than as a stack of identical inputs. */
function Group({
  title,
  blurb,
  children,
}: {
  title: string;
  blurb: string;
  children: ReactNode;
}) {
  return (
    <section className="border-t border-line pt-6 first:border-t-0 first:pt-0">
      <h3 className="text-ui font-medium text-text">{title}</h3>
      <p className="mt-1 max-w-prose text-meta text-text-3">{blurb}</p>
      <div className="mt-5 space-y-6">{children}</div>
    </section>
  );
}

export function BehaviorSection({
  assistant,
  onChange,
}: {
  assistant: Assistant;
  onChange: (patch: Partial<Assistant>) => void;
}) {
  const { behavior } = assistant;

  /** Every behaviour edit recompiles the prompt the worker is dispatched with. */
  function patch(next: Partial<BehaviorConfig>) {
    const behaviorNext = { ...behavior, ...next };
    onChange({
      behavior: behaviorNext,
      model: { ...assistant.model, systemPrompt: composeSystemPrompt(behaviorNext) },
    });
  }

  const compiled = composeSystemPrompt(behavior);

  return (
    <div className="space-y-10">
      <Group
        title="Purpose"
        blurb="What this agent is for, and how it should come across."
      >
        <Field label="Role" description={BEHAVIOR_SECTIONS[0].prompt}>
          <Textarea
            rows={2}
            value={behavior.role}
            onChange={(event) => patch({ role: event.target.value })}
            placeholder={BEHAVIOR_SECTIONS[0].placeholder}
          />
        </Field>
        <Field label="Tone" description={BEHAVIOR_SECTIONS[1].prompt}>
          <Textarea
            rows={2}
            value={behavior.tone}
            onChange={(event) => patch({ tone: event.target.value })}
            placeholder={BEHAVIOR_SECTIONS[1].placeholder}
          />
        </Field>
        <Field label="Goals" description="What a call going well looks like.">
          <ListInput
            items={behavior.goals}
            onChange={(goals) => patch({ goals })}
            placeholder="Add a goal"
            addLabel="Add goal"
          />
        </Field>
      </Group>

      <Group
        title="On the call"
        blurb="The first thing the caller hears, and how the agent runs the conversation after that."
      >
        <Field label="Opening line" description="Spoken the moment the call connects.">
          <Input
            value={assistant.model.firstMessage}
            onChange={(event) =>
              onChange({ model: { ...assistant.model, firstMessage: event.target.value } })
            }
            placeholder="Hey, thanks for calling — how can I help?"
          />
        </Field>
        <Field label="Conversation style" description={BEHAVIOR_SECTIONS[2].prompt}>
          <Textarea
            rows={2}
            value={behavior.conversationStyle}
            onChange={(event) => patch({ conversationStyle: event.target.value })}
            placeholder={BEHAVIOR_SECTIONS[2].placeholder}
          />
        </Field>
      </Group>

      <Group
        title="Limits"
        blurb="The lines the agent must not cross, and the point where a person takes over."
      >
        <Field
          label="Rules"
          description="Hard limits. The agent holds these whatever the caller asks."
        >
          <ListInput
            items={behavior.rules}
            onChange={(rules) => patch({ rules })}
            placeholder="Add a rule"
            addLabel="Add rule"
          />
        </Field>
        <Field label="Escalation" description={BEHAVIOR_SECTIONS[3].prompt}>
          <Textarea
            rows={2}
            value={behavior.escalation}
            onChange={(event) => patch({ escalation: event.target.value })}
            placeholder={BEHAVIOR_SECTIONS[3].placeholder}
          />
        </Field>
      </Group>

      <div className="pt-2">
        <Disclosure
          label="Advanced instructions"
          summary={behavior.custom.trim() ? "Set" : "Empty"}
        >
          <p className="mb-3 max-w-prose text-meta text-text-3">
            Appended to the compiled prompt verbatim, for anything the fields above can&apos;t
            express.
          </p>
          <Textarea
            rows={6}
            value={behavior.custom}
            onChange={(event) => patch({ custom: event.target.value })}
            className="font-mono text-meta"
            placeholder="Anything else the agent needs to know…"
          />
        </Disclosure>

        <Disclosure
          label="Compiled prompt"
          summary={`${compiled.length} characters`}
        >
          <p className="mb-3 max-w-prose text-meta text-text-3">
            Exactly what is sent to the worker as <span className="font-mono">system_prompt</span>.
            Read-only — edit the fields above to change it.
          </p>
          <pre className="overflow-x-auto whitespace-pre-wrap rounded-2 border border-line bg-sunken px-3.5 py-3 font-mono text-meta text-text-2">
            {compiled || "Nothing configured yet."}
          </pre>
        </Disclosure>
      </div>
    </div>
  );
}
