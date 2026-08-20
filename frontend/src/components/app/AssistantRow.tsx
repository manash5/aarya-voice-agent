"use client";

import { ArrowRight } from "lucide-react";
import Link from "next/link";

import { PresenceIndicator, VoiceGlyph } from "@/components/ui";
import { AGENT_TYPES, taskById } from "@/lib/catalog";
import { cn } from "@/lib/cn";
import { formatRelative } from "@/lib/format";
import type { Assistant } from "@/lib/types";

/**
 * A product row, not a dashboard card. Everything on one line at desktop
 * width; the arrow is the only thing that moves on hover, which is enough to
 * say "this goes somewhere".
 */
export function AssistantRow({ assistant, href }: { assistant: Assistant; href: string }) {
  const type = AGENT_TYPES[assistant.agentType];
  const tasks = assistant.tasks
    .map((id) => taskById(id)?.name)
    .filter(Boolean)
    .slice(0, 2)
    .join(" · ");

  return (
    <Link
      href={href}
      className={cn(
        "group flex items-center gap-4 border-b border-line px-4 py-3.5 last:border-b-0",
        "transition-colors duration-[--fast] ease-[--ease] hover:bg-raised-hover",
      )}
    >
      <VoiceGlyph
        seed={assistant.id}
        color={type.accent}
        className="h-5 w-6 shrink-0 opacity-70 transition-opacity duration-[--fast] group-hover:opacity-100"
      />

      <span className="min-w-0 flex-1">
        <span className="block truncate text-ui font-medium text-text">{assistant.name}</span>
        <span className="mt-0.5 block truncate text-meta text-text-3">
          {assistant.companyName || "No company set"}
          {tasks ? ` — ${tasks}` : ""}
        </span>
      </span>

      <span className="hidden shrink-0 text-meta text-text-3 md:block">{type.name}</span>

      <span className="hidden w-24 shrink-0 md:block">
        <PresenceIndicator
          state={assistant.status === "published" ? "listening" : "idle"}
          label={assistant.status === "published" ? "Live" : "Draft"}
        />
      </span>

      <span className="hidden w-24 shrink-0 text-right text-meta text-text-3 lg:block">
        {formatRelative(assistant.updatedAt)}
      </span>

      <ArrowRight
        className="h-4 w-4 shrink-0 text-text-3 opacity-0 transition-all duration-[--base] ease-[--ease-out] group-hover:translate-x-0.5 group-hover:opacity-100"
        strokeWidth={1.75}
        aria-hidden
      />
    </Link>
  );
}
