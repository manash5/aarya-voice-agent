"use client";

import { PanelRight } from "lucide-react";
import { useEffect, useRef, useState } from "react";

import { AgentIdentity } from "@/components/app/studio/AgentIdentity";
import { ActionsSection } from "@/components/app/studio/ActionsSection";
import { ActivitySection } from "@/components/app/studio/ActivitySection";
import { BehaviorSection } from "@/components/app/studio/BehaviorSection";
import { CallingSection } from "@/components/app/studio/CallingSection";
import { ContextPanel } from "@/components/app/studio/ContextPanel";
import { ConversationSection } from "@/components/app/studio/ConversationSection";
import { KnowledgeSection } from "@/components/app/studio/KnowledgeSection";
import { PublishDialog } from "@/components/app/studio/PublishDialog";
import { TestingSection } from "@/components/app/studio/TestingSection";
import { VoiceSection } from "@/components/app/studio/VoiceSection";
import { Drawer, IconButton } from "@/components/ui";
import { cn } from "@/lib/cn";
import { reviewAgent } from "@/lib/readiness";
import type { Assistant } from "@/lib/types";

/**
 * The workspace is organised the way an agent is built: what it does, how it
 * talks, what it knows, what it can act on, how calls are handled - then the
 * two operational surfaces, testing it and watching it run.
 */
const GROUPS = [
  {
    label: "Configure",
    items: [
      { key: "Behavior", blurb: "What it does and won't do" },
      { key: "Conversation", blurb: "How it thinks and takes turns" },
      { key: "Voice", blurb: "How it sounds and hears" },
      { key: "Knowledge", blurb: "What it knows" },
      { key: "Actions", blurb: "What it can do" },
      { key: "Calling", blurb: "How calls are handled" },
    ],
  },
  {
    label: "Operate",
    items: [
      { key: "Testing", blurb: "Talk to it" },
      { key: "Activity", blurb: "What happened" },
    ],
  },
] as const;

const SECTIONS = GROUPS.flatMap((group) => group.items.map((item) => item.key));
type SectionKey = (typeof SECTIONS)[number];

const BLURB = new Map(GROUPS.flatMap((g) => g.items.map((i) => [i.key, i.blurb] as const)));

function useSaveState(updatedAt: string) {
  const [state, setState] = useState<"idle" | "saving" | "saved">("idle");
  const seen = useRef(updatedAt);

  useEffect(() => {
    if (seen.current === updatedAt) return;
    seen.current = updatedAt;
    setState("saving");
    const toSaved = setTimeout(() => setState("saved"), 350);
    const toIdle = setTimeout(() => setState("idle"), 2400);
    return () => {
      clearTimeout(toSaved);
      clearTimeout(toIdle);
    };
  }, [updatedAt]);

  return state;
}

export function AgentStudio({
  assistant,
  onChange,
  onDuplicate,
  onDelete,
}: {
  assistant: Assistant;
  onChange: (patch: Partial<Assistant>) => void;
  onDuplicate: () => void;
  onDelete: () => void;
}) {
  const [section, setSection] = useState<SectionKey>("Behavior");
  const [panel, setPanel] = useState(false);
  const [publishing, setPublishing] = useState(false);
  const save = useSaveState(assistant.updatedAt);
  const published = assistant.status === "published";
  const blockers = reviewAgent(assistant).filter((f) => f.severity === "blocker").length;

  function goTo(target: string) {
    if ((SECTIONS as readonly string[]).includes(target)) {
      setSection(target as SectionKey);
      setPanel(false);
    }
  }

  return (
    <div className="flex min-h-0 flex-1 flex-col overflow-hidden">
      <AgentIdentity
        assistant={assistant}
        save={save}
        onChange={onChange}
        onDuplicate={onDuplicate}
        onDelete={onDelete}
        onTest={() => setSection("Testing")}
        onPublish={() => {
          if (published) onChange({ status: "draft" });
          else setPublishing(true);
        }}
      />

      <div className="flex min-h-0 flex-1 overflow-hidden">
        {/* Section rail. Vertical rather than tabs: eight destinations don't fit
            across a header, and each one deserves a line of explanation. */}
        <nav
          aria-label="Agent sections"
          className="hidden w-[196px] shrink-0 overflow-y-auto border-r border-line px-3 py-5 md:block"
        >
          {GROUPS.map((group) => (
            <div key={group.label} className="mb-6 last:mb-0">
              <p className="eyebrow px-2 pb-2">{group.label}</p>
              <ul className="space-y-0.5">
                {group.items.map((item) => {
                  const active = item.key === section;
                  return (
                    <li key={item.key}>
                      <button
                        type="button"
                        onClick={() => setSection(item.key)}
                        aria-current={active ? "true" : undefined}
                        className={cn(
                          "group relative w-full rounded-2 px-2 py-1.5 text-left",
                          "transition-colors duration-[--fast] ease-[--ease]",
                          active ? "bg-raised-active" : "hover:bg-raised-hover",
                        )}
                      >
                        <span
                          aria-hidden
                          className={cn(
                            "absolute left-0 top-1/2 h-3.5 w-0.5 -translate-y-1/2 rounded-r-full bg-accent",
                            "transition-opacity duration-[--base]",
                            active ? "opacity-100" : "opacity-0",
                          )}
                        />
                        <span
                          className={cn(
                            "block text-ui",
                            active ? "font-medium text-text" : "text-text-2 group-hover:text-text",
                          )}
                        >
                          {item.key}
                        </span>
                      </button>
                    </li>
                  );
                })}
              </ul>
            </div>
          ))}
        </nav>

        <div className="min-w-0 flex-1 overflow-y-auto">
          {/* Compact section switcher for narrow screens. */}
          <div className="border-b border-line px-6 py-3 md:hidden">
            <label className="sr-only" htmlFor="section-select">
              Section
            </label>
            <select
              id="section-select"
              value={section}
              onChange={(event) => setSection(event.target.value as SectionKey)}
              className="w-full rounded-2 border border-line bg-sunken px-3 py-2 text-ui text-text outline-none"
            >
              {GROUPS.map((group) => (
                <optgroup key={group.label} label={group.label}>
                  {group.items.map((item) => (
                    <option key={item.key} value={item.key}>
                      {item.key}
                    </option>
                  ))}
                </optgroup>
              ))}
            </select>
          </div>

          <div className="px-6 pb-24 pt-7 lg:px-10">
            <div className="mx-auto max-w-[720px]">
              <div className="mb-7 flex items-start justify-between gap-6">
                <div>
                  <h2 className="display text-title text-text">{section}</h2>
                  <p className="mt-1 text-meta text-text-3">{BLURB.get(section)}</p>
                </div>
                <div className="xl:hidden">
                  <IconButton label="Agent context" onClick={() => setPanel(true)}>
                    <PanelRight className="h-4 w-4" strokeWidth={1.75} />
                  </IconButton>
                </div>
              </div>

              <div key={section} className="animate-enter">
                {section === "Behavior" ? (
                  <BehaviorSection assistant={assistant} onChange={onChange} />
                ) : null}
                {section === "Conversation" ? (
                  <ConversationSection assistant={assistant} onChange={onChange} />
                ) : null}
                {section === "Voice" ? (
                  <VoiceSection assistant={assistant} onChange={onChange} />
                ) : null}
                {section === "Knowledge" ? (
                  <KnowledgeSection assistant={assistant} onChange={onChange} />
                ) : null}
                {section === "Actions" ? (
                  <ActionsSection assistant={assistant} onChange={onChange} />
                ) : null}
                {section === "Calling" ? (
                  <CallingSection assistant={assistant} onChange={onChange} />
                ) : null}
                {section === "Testing" ? <TestingSection assistant={assistant} /> : null}
                {section === "Activity" ? (
                  <ActivitySection assistant={assistant} onTest={() => setSection("Testing")} />
                ) : null}
              </div>
            </div>
          </div>
        </div>

        <Drawer open={panel} onClose={() => setPanel(false)} title="Agent context">
          <ContextPanel assistant={assistant} onGo={goTo} />
        </Drawer>
      </div>

      <PublishDialog
        assistant={assistant}
        open={publishing}
        onClose={() => setPublishing(false)}
        onConfirm={() => {
          setPublishing(false);
          if (blockers === 0) onChange({ status: "published" });
        }}
      />
    </div>
  );
}
