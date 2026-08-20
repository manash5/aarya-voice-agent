"use client";

import { cn } from "@/lib/cn";

/**
 * What the agent is doing right now. A voice agent is a running system, not a
 * saved record, so its mode belongs anywhere it appears - header, test bench,
 * call row.
 */
export type Presence = "idle" | "listening" | "speaking" | "connecting" | "ended";

const LABEL: Record<Presence, string> = {
  idle: "Idle",
  listening: "Listening",
  speaking: "Speaking",
  connecting: "Connecting",
  ended: "Ended",
};

const DOT: Record<Presence, string> = {
  idle: "bg-presence-idle",
  listening: "bg-presence-listening",
  speaking: "bg-presence-speaking",
  connecting: "bg-presence-idle",
  ended: "bg-presence-idle",
};

/**
 * Three bars on a stagger. Deliberately not a spectrum analyser: this says
 * "audio is moving", and nothing more, so it can sit inline with text.
 */
export function AudioBars({
  active,
  className,
}: {
  active: boolean;
  className?: string;
}) {
  return (
    <span className={cn("flex h-3 items-center gap-[2px]", className)} aria-hidden>
      {[0, 1, 2].map((i) => (
        <span
          key={i}
          className={cn(
            "w-[2px] rounded-full bg-current",
            active ? "h-3 animate-bar" : "h-1",
          )}
          style={active ? { animationDelay: `${i * 140}ms` } : undefined}
        />
      ))}
    </span>
  );
}

export function PresenceIndicator({
  state,
  label,
  className,
}: {
  state: Presence;
  /** Override the default word, e.g. "Live" on a call that's connected. */
  label?: string;
  className?: string;
}) {
  const animated = state === "listening" || state === "speaking";

  return (
    <span
      className={cn("inline-flex items-center gap-2 text-meta text-text-2", className)}
      aria-live="polite"
    >
      {state === "speaking" ? (
        <span className="text-presence-speaking">
          <AudioBars active />
        </span>
      ) : (
        <span className="relative flex h-1.5 w-1.5 shrink-0">
          {animated ? (
            <span
              className={cn("absolute inset-0 rounded-full animate-presence", DOT[state])}
            />
          ) : null}
          <span className={cn("relative h-1.5 w-1.5 rounded-full", DOT[state])} />
        </span>
      )}
      {label ?? LABEL[state]}
    </span>
  );
}
