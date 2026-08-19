"use client";

import {
  Room,
  RoomEvent,
  Track,
  type Participant,
  type RemoteTrack,
  type TranscriptionSegment,
} from "livekit-client";
import { AlertTriangle, Mic, PhoneOff } from "lucide-react";
import { useCallback, useEffect, useRef, useState } from "react";

import { Badge, Button, Panel } from "@/components/ui/controls";
import { AGENT_TYPES } from "@/lib/catalog";
import { cn } from "@/lib/cn";
import { formatDuration } from "@/lib/format";
import type { Assistant } from "@/lib/types";

type CallStatus = "idle" | "connecting" | "live" | "ended" | "error";

interface Line {
  id: string;
  speaker: "you" | "agent";
  text: string;
  final: boolean;
}

export function PlaygroundTab({ assistant }: { assistant: Assistant }) {
  const [status, setStatus] = useState<CallStatus>("idle");
  const [error, setError] = useState<string | null>(null);
  const [hint, setHint] = useState<string | null>(null);
  const [lines, setLines] = useState<Line[]>([]);
  const [seconds, setSeconds] = useState(0);
  const [agentJoined, setAgentJoined] = useState(false);
  const [configured, setConfigured] = useState<boolean | null>(null);
  const [missing, setMissing] = useState<string[]>([]);

  const roomRef = useRef<Room | null>(null);
  const audioRef = useRef<HTMLDivElement>(null);
  const type = AGENT_TYPES[assistant.agentType];

  useEffect(() => {
    fetch("/api/call")
      .then((response) => response.json())
      .then((data: { configured: boolean; missing: string[] }) => {
        setConfigured(data.configured);
        setMissing(data.missing ?? []);
      })
      .catch(() => setConfigured(false));
  }, []);

  useEffect(() => {
    if (status !== "live") return;
    const timer = setInterval(() => setSeconds((value) => value + 1), 1000);
    return () => clearInterval(timer);
  }, [status]);

  const endCall = useCallback(async () => {
    await roomRef.current?.disconnect();
    roomRef.current = null;
  }, []);

  useEffect(() => () => void roomRef.current?.disconnect(), []);

  async function startCall() {
    setError(null);
    setHint(null);
    setLines([]);
    setSeconds(0);
    setAgentJoined(false);
    setStatus("connecting");

    let payload: {
      serverUrl: string;
      token: string;
      message?: string;
      hint?: string;
    };

    try {
      const response = await fetch("/api/call", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ assistant }),
      });
      payload = await response.json();
      if (!response.ok) {
        setError(payload.message ?? "Could not start the call.");
        setHint(payload.hint ?? null);
        setStatus("error");
        return;
      }
    } catch {
      setError("Could not reach /api/call.");
      setStatus("error");
      return;
    }

    const room = new Room({ adaptiveStream: false, dynacast: false });
    roomRef.current = room;

    room
      .on(RoomEvent.TrackSubscribed, (track: RemoteTrack) => {
        if (track.kind !== Track.Kind.Audio) return;
        audioRef.current?.appendChild(track.attach());
      })
      .on(
        RoomEvent.TranscriptionReceived,
        (segments: TranscriptionSegment[], participant?: Participant) => {
          const speaker = participant?.isLocal ? "you" : "agent";
          setLines((current) => {
            const next = [...current];
            for (const segment of segments) {
              const index = next.findIndex((line) => line.id === segment.id);
              const line: Line = {
                id: segment.id,
                speaker,
                text: segment.text,
                final: segment.final,
              };
              if (index === -1) next.push(line);
              else next[index] = line;
            }
            return next;
          });
        },
      )
      .on(RoomEvent.ParticipantConnected, () => setAgentJoined(true))
      .on(RoomEvent.Disconnected, () => setStatus("ended"));

    try {
      await room.connect(payload.serverUrl, payload.token);
      await room.localParticipant.setMicrophoneEnabled(true);
      setStatus("live");
    } catch (connectError) {
      setError(connectError instanceof Error ? connectError.message : "Connection failed.");
      setStatus("error");
    }
  }

  const live = status === "live";

  return (
    <div className="space-y-5">
      {configured === false ? (
        <div className="flex items-start gap-3 rounded-xl border border-warn/30 bg-warn/[0.06] px-4 py-3">
          <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0 text-warn" />
          <div className="text-xs leading-relaxed text-ink-muted">
            <p className="font-medium text-ink">LiveKit credentials not set</p>
            <p className="mt-1">
              Add {missing.join(", ") || "LIVEKIT_URL, LIVEKIT_API_KEY, LIVEKIT_API_SECRET"} to{" "}
              <span className="font-mono">frontend/.env.local</span> and restart the dev server.
              They come from the same LiveKit Cloud project your workers are deployed to.
            </p>
          </div>
        </div>
      ) : null}

      <Panel
        title="Test call"
        description="Dispatches this assistant's worker into a fresh room and connects your mic to it."
        action={
          live ? (
            <Badge tone="accent">{formatDuration(seconds)}</Badge>
          ) : (
            <Badge tone="outline">{type.worker}</Badge>
          )
        }
      >
        <div className="flex flex-col items-center gap-4 py-4">
          <span
            className={cn(
              "relative flex h-24 w-24 items-center justify-center rounded-full transition-colors",
              live ? "bg-accent/15" : "bg-elevated",
            )}
          >
            {live ? <span className="absolute inset-0 animate-ping rounded-full bg-accent/10" /> : null}
            <Mic className={cn("relative h-8 w-8", live ? "text-accent" : "text-ink-dim")} />
          </span>

          <p className="text-xs text-ink-dim">
            {status === "idle" ? "Ready when you are." : null}
            {status === "connecting" ? "Creating the room and dispatching the worker…" : null}
            {live && !agentJoined ? "Connected. Waiting for the agent to join…" : null}
            {live && agentJoined ? "Agent is on the call." : null}
            {status === "ended" ? "Call ended." : null}
            {status === "error" ? error : null}
          </p>
          {hint ? <p className="max-w-md text-center text-[11px] text-ink-dim">{hint}</p> : null}

          {live ? (
            <Button variant="danger" onClick={endCall}>
              <PhoneOff className="h-3.5 w-3.5" />
              End call
            </Button>
          ) : (
            <Button
              variant="primary"
              onClick={startCall}
              disabled={status === "connecting" || configured === false}
            >
              <Mic className="h-3.5 w-3.5" />
              {status === "ended" || status === "error" ? "Call again" : "Start call"}
            </Button>
          )}
        </div>

        <div ref={audioRef} className="hidden" />
      </Panel>

      <Panel title="Live transcript">
        {lines.length === 0 ? (
          <p className="py-6 text-center text-xs text-ink-dim">
            Whatever is said on the call shows up here.
          </p>
        ) : (
          <ul className="space-y-2.5">
            {lines.map((line) => (
              <li key={line.id} className="flex gap-3 text-sm">
                <span
                  className={cn(
                    "w-12 shrink-0 pt-0.5 text-[11px] font-medium",
                    line.speaker === "agent" ? "text-accent" : "text-ink-dim",
                  )}
                >
                  {line.speaker === "agent" ? "Aarya" : "You"}
                </span>
                <span className={cn("leading-relaxed", line.final ? "text-ink" : "text-ink-muted")}>
                  {line.text}
                </span>
              </li>
            ))}
          </ul>
        )}
      </Panel>

      <p className="text-[11px] leading-relaxed text-ink-dim">
        The worker runs whatever is deployed in LiveKit Cloud. Settings from this console are sent
        along as job metadata, but the entrypoints in{" "}
        <span className="font-mono text-ink-muted">voice-agent/</span> don&apos;t read that yet, so
        the call uses their hardcoded company and voice.
      </p>
    </div>
  );
}
