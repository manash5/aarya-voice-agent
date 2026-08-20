import type { ReactNode } from "react";

import { cn } from "@/lib/cn";

type Tone = "live" | "neutral" | "muted" | "warn";

const DOT: Record<Tone, string> = {
  live: "bg-accent",
  neutral: "bg-text-2",
  muted: "bg-text-3",
  warn: "bg-warn",
};

/**
 * A dot and a word. Status is metadata, not a call to action, so it gets no
 * container - pills at every row turn a list into a sticker album.
 */
export function Status({
  tone = "muted",
  pulse = false,
  children,
  className,
}: {
  tone?: Tone;
  pulse?: boolean;
  children: ReactNode;
  className?: string;
}) {
  return (
    <span className={cn("inline-flex shrink-0 items-center gap-1.5 text-meta text-text-2", className)}>
      <span className="relative flex h-1.5 w-1.5 shrink-0">
        {pulse ? (
          <span className={cn("absolute inset-0 animate-ping rounded-full opacity-60", DOT[tone])} />
        ) : null}
        <span className={cn("relative h-1.5 w-1.5 rounded-full", DOT[tone])} />
      </span>
      {children}
    </span>
  );
}

/** For inline classification (a tool's name, a "planned" marker). */
export function Tag({
  children,
  tone = "neutral",
  className,
}: {
  children: ReactNode;
  tone?: "neutral" | "accent" | "warn";
  className?: string;
}) {
  const tones = {
    neutral: "bg-raised text-text-2",
    accent: "bg-accent-subtle text-accent",
    warn: "bg-warn/10 text-warn",
  } as const;

  return (
    <span
      className={cn(
        "inline-flex shrink-0 items-center rounded-1 px-1.5 py-0.5 text-micro font-medium",
        tones[tone],
        className,
      )}
    >
      {children}
    </span>
  );
}
