"use client";

import { Play } from "lucide-react";
import type { ReactNode } from "react";

import { cn } from "@/lib/cn";

export type Speaker = "caller" | "agent";

/**
 * One turn of a phone call. Speaker sits in a fixed left column so the eye can
 * run down the margin and read who was talking without parsing the text; the
 * timestamp is monospaced so the column stays straight.
 */
export function Turn({
  speaker,
  timestamp,
  children,
  interim = false,
  onPlay,
  meta,
}: {
  speaker: Speaker;
  timestamp?: string;
  children: ReactNode;
  /** Not yet final - shown lighter, since it may still be rewritten. */
  interim?: boolean;
  onPlay?: () => void;
  meta?: ReactNode;
}) {
  const isAgent = speaker === "agent";

  return (
    <div className="group grid grid-cols-[auto_1fr] gap-x-4 gap-y-1 py-3">
      <div className="flex w-24 shrink-0 items-baseline gap-2">
        <span
          className={cn(
            "text-meta font-medium",
            isAgent ? "text-accent" : "text-text-2",
          )}
        >
          {isAgent ? "Agent" : "Caller"}
        </span>
      </div>

      <div className="min-w-0">
        <p
          className={cn(
            "text-body",
            interim ? "italic text-text-3" : "text-text",
          )}
        >
          {children}
        </p>
        {meta ? <div className="mt-1.5">{meta}</div> : null}
      </div>

      <div className="col-start-1 flex items-center gap-2">
        {timestamp ? (
          <span className="tnum font-mono text-micro text-text-3">{timestamp}</span>
        ) : null}
        {onPlay ? (
          <button
            type="button"
            onClick={onPlay}
            aria-label={`Play from ${timestamp ?? "here"}`}
            className={cn(
              "flex h-4 w-4 items-center justify-center rounded-full text-text-3",
              "opacity-0 transition-opacity duration-[--fast]",
              "hover:text-text focus-visible:opacity-100 group-hover:opacity-100",
            )}
          >
            <Play className="h-2.5 w-2.5" fill="currentColor" strokeWidth={0} />
          </button>
        ) : null}
      </div>
    </div>
  );
}

export function Conversation({
  children,
  className,
}: {
  children: ReactNode;
  className?: string;
}) {
  return <div className={cn("divide-y divide-line", className)}>{children}</div>;
}

/** A non-speech thing that happened mid-call: a tool ran, the call moved on. */
export function CallEvent({
  timestamp,
  children,
}: {
  timestamp?: string;
  children: ReactNode;
}) {
  return (
    <div className="grid grid-cols-[auto_1fr] gap-x-4 py-2">
      <span className="tnum w-24 shrink-0 font-mono text-micro text-text-3">
        {timestamp}
      </span>
      <span className="text-meta text-text-3">{children}</span>
    </div>
  );
}
