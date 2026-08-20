"use client";

import { Check, Copy, MoreHorizontal, Phone, Trash2 } from "lucide-react";
import Link from "next/link";

import { Breadcrumb } from "@/components/app/PageHeader";
import { Button, IconButton, Menu, PresenceIndicator, VoiceGlyph } from "@/components/ui";
import { AGENT_TYPES, VOICES } from "@/lib/catalog";
import { cn } from "@/lib/cn";
import { formatRelative } from "@/lib/format";
import type { Assistant } from "@/lib/types";

/**
 * The agent as an entity in the system, not a row being edited. Identity on
 * the left, the operational facts that decide whether it can take a call in
 * the middle, and the two actions that change its state on the right.
 */
export function AgentIdentity({
  assistant,
  save,
  onChange,
  onDuplicate,
  onDelete,
  onPublish,
  onTest,
}: {
  assistant: Assistant;
  save: "idle" | "saving" | "saved";
  onChange: (patch: Partial<Assistant>) => void;
  onDuplicate: () => void;
  onDelete: () => void;
  onPublish: () => void;
  onTest: () => void;
}) {
  const type = AGENT_TYPES[assistant.agentType];
  const published = assistant.status === "published";
  const voice =
    VOICES[assistant.voice.provider]?.find((v) => v.value === assistant.voice.voiceId)?.label ??
    assistant.voice.voiceId;

  return (
    <header className="border-b border-line px-6 pb-5 pt-6 lg:px-10">
      <div className="mx-auto max-w-[1400px]">
        <Breadcrumb href="/assistants" label="Agents" />

        <div className="mt-3 flex flex-wrap items-start justify-between gap-x-8 gap-y-5">
          <div className="flex min-w-0 items-start gap-4">
            <span
              className="mt-1.5 flex h-10 w-10 shrink-0 items-center justify-center rounded-2 border border-line"
              style={{ background: `color-mix(in oklab, ${type.accent} 12%, transparent)` }}
            >
              <VoiceGlyph seed={assistant.id} color={type.accent} className="h-5 w-6" />
            </span>

            <div className="min-w-0">
              <input
                value={assistant.name}
                onChange={(event) => onChange({ name: event.target.value })}
                aria-label="Agent name"
                spellCheck={false}
                className={cn(
                  "display -mx-2 w-full min-w-0 rounded-2 bg-transparent px-2 py-0.5 text-title text-text",
                  "outline-none transition-colors duration-[--fast]",
                  "hover:bg-raised-hover focus:bg-raised-hover",
                )}
              />

              {/* The line an operator scans before trusting the agent with a
                  caller: is it live, what language, what voice, what number. */}
              <div className="mt-1.5 flex flex-wrap items-center gap-x-3 gap-y-0.5 pl-0.5 text-meta text-text-3">
                <PresenceIndicator
                  state={published ? "listening" : "idle"}
                  label={published ? "Live" : "Draft"}
                />
                <Divider />
                <span>{type.language}</span>
                <Divider />
                <span>{voice}</span>
                <Divider />
                {assistant.phoneNumber ? (
                  <span className="font-mono">{assistant.phoneNumber}</span>
                ) : (
                  <Link
                    href="/phone-numbers"
                    className="rounded-1 underline decoration-line-strong underline-offset-2 transition-colors hover:text-text-2"
                  >
                    No number
                  </Link>
                )}
                <Divider />
                <span
                  className={cn(
                    "flex items-center gap-1 transition-opacity duration-[--base]",
                    save === "idle" ? "opacity-100" : "opacity-100",
                  )}
                  aria-live="polite"
                >
                  {save === "saving" ? (
                    "Saving…"
                  ) : save === "saved" ? (
                    <>
                      <Check className="h-3 w-3" strokeWidth={2.25} />
                      Saved
                    </>
                  ) : (
                    `Edited ${formatRelative(assistant.updatedAt)}`
                  )}
                </span>
              </div>
            </div>
          </div>

          <div className="flex shrink-0 items-center gap-2">
            <Button variant="secondary" onClick={onTest}>
              <Phone className="h-3.5 w-3.5" strokeWidth={1.75} />
              Test call
            </Button>
            <Button variant="primary" onClick={onPublish}>
              {published ? "Unpublish" : "Publish"}
            </Button>
            <Menu
              trigger={({ toggle }) => (
                <IconButton label="More actions" onClick={toggle}>
                  <MoreHorizontal className="h-4 w-4" strokeWidth={1.75} />
                </IconButton>
              )}
              items={[
                {
                  label: "Duplicate",
                  icon: <Copy className="h-3.5 w-3.5" strokeWidth={1.75} />,
                  onSelect: onDuplicate,
                },
                {
                  label: "Delete",
                  icon: <Trash2 className="h-3.5 w-3.5" strokeWidth={1.75} />,
                  onSelect: onDelete,
                  danger: true,
                },
              ]}
            />
          </div>
        </div>
      </div>
    </header>
  );
}

/** Hidden below sm: when the line wraps, a separator ends up stranded at the
 *  end of a row with nothing after it. */
function Divider() {
  return (
    <span aria-hidden className="hidden text-line-strong sm:inline">
      ·
    </span>
  );
}
