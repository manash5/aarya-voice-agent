"use client";

import {
  Room,
  RoomEvent,
  Track,
  type Participant,
  type RemoteTrack,
  type TranscriptionSegment,
} from "livekit-client";
import { AlertTriangle, Mic, MicOff, PhoneOff } from "lucide-react";
import { useCallback, useEffect, useRef, useState } from "react";

import {
  Button,
  CallEvent,
  Conversation,
  IconButton,
  LiveWaveform,
  PresenceIndicator,
  Property,
  PropertyList,
  Turn,
  type Presence,
} from "@/components/ui";
import { AGENT_TYPES } from "@/lib/catalog";
import { cn } from "@/lib/cn";
import { formatDuration } from "@/lib/format";
import type { Assistant } from "@/lib/types";

type CallStatus = "idle" | "connecting" | "live" | "ended" | "error";

interface Line {
  id: string;
  speaker: "caller" | "agent";
  text: string;
  final: boolean;
  at: number;
}

interface Event {
  id: string;
  at: number;
  text: string;
}

/**
 * The test bench. A voice agent can only really be judged by talking to it, so
 * this is a conversation surface first and a settings page never: presence and
 * meter at the top, the transcript as it lands, and the events that fired
 * beside it.
 */
export function TestingSection({ assistant }: { assistant: Assistant }) {
  const [status, setStatus] = useState<CallStatus>("idle");
  const [error, setError] = useState<string | null>(null);
  const [hint, setHint] = useState<string | null>(null);
  const [lines, setLines] = useState<Line[]>([]);
  const [events, setEvents] = useState<Event[]>([]);
  const [seconds, setSeconds] = useState(0);
  const [agentJoined, setAgentJoined] = useState(false);
  const [configured, setConfigured] = useState<boolean | null>(null);
  const [missing, setMissing] = useState<string[]>([]);
  const [streams, setStreams] = useState<MediaStream[]>([]);
  const [muted, setMuted] = useState(false);
  const [presence, setPresence] = useState<Presence>("idle");
  /** Measured, not estimated: call start to the agent's first transcript. */
  const [firstWordMs, setFirstWordMs] = useState<number | null>(null);
  const [startedAt, setStartedAt] = useState(0);

  const roomRef = useRef<Room | null>(null);
  const audioRef = useRef<HTMLDivElement>(null);
  const transcriptRef = useRef<HTMLDivElement>(null);
  const lastAgentAt = useRef<number>(0);

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

  // Speaking vs listening is inferred from how recently an agent segment
  // landed - the transcript is the only signal available without the backend.
  useEffect(() => {
    if (status !== "live") return;
    const timer = setInterval(() => {
      setPresence(Date.now() - lastAgentAt.current < 1400 ? "speaking" : "listening");
    }, 250);
    return () => clearInterval(timer);
  }, [status]);

  useEffect(() => {
    const node = transcriptRef.current;
    if (node) node.scrollTop = node.scrollHeight;
  }, [lines]);

  function log(text: string) {
    setEvents((current) => [...current, { id: `${Date.now()}-${text}`, at: Date.now(), text }]);
  }

  const endCall = useCallback(async () => {
    await roomRef.current?.disconnect();
    roomRef.current = null;
    setStreams([]);
    setPresence("ended");
  }, []);

  useEffect(() => () => void roomRef.current?.disconnect(), []);

  async function startCall() {
    setError(null);
    setHint(null);
    setLines([]);
    setEvents([]);
    setSeconds(0);
    setAgentJoined(false);
    setStreams([]);
    setMuted(false);
    setFirstWordMs(null);
    setStatus("connecting");
    setPresence("connecting");
    const t0 = Date.now();
    setStartedAt(t0);
    lastAgentAt.current = 0;

    let payload: { serverUrl: string; token: string; message?: string; hint?: string };

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
        setPresence("idle");
        return;
      }
    } catch {
      setError("Could not reach /api/call.");
      setStatus("error");
      setPresence("idle");
      return;
    }

    log("Room created, worker dispatched");

    const room = new Room({ adaptiveStream: false, dynacast: false });
    roomRef.current = room;

    room
      .on(RoomEvent.TrackSubscribed, (track: RemoteTrack) => {
        if (track.kind !== Track.Kind.Audio) return;
        audioRef.current?.appendChild(track.attach());
        setStreams((current) => [...current, new MediaStream([track.mediaStreamTrack])]);
        log("Agent audio track subscribed");
      })
      .on(
        RoomEvent.TranscriptionReceived,
        (segments: TranscriptionSegment[], participant?: Participant) => {
          const speaker = participant?.isLocal ? "caller" : "agent";
          if (speaker === "agent") {
            lastAgentAt.current = Date.now();
            setFirstWordMs((current) => current ?? Date.now() - t0);
          }
          setLines((current) => {
            const next = [...current];
            for (const segment of segments) {
              const index = next.findIndex((line) => line.id === segment.id);
              const line: Line = {
                id: segment.id,
                speaker,
                text: segment.text,
                final: segment.final,
                at: Date.now(),
              };
              if (index === -1) next.push(line);
              else next[index] = line;
            }
            return next;
          });
        },
      )
      .on(RoomEvent.ParticipantConnected, () => {
        setAgentJoined(true);
        log("Agent joined the room");
      })
      .on(RoomEvent.Disconnected, () => {
        setStatus("ended");
        setStreams([]);
        setPresence("ended");
        log("Call ended");
      });

    try {
      await room.connect(payload.serverUrl, payload.token);
      await room.localParticipant.setMicrophoneEnabled(true);
      const mic = room.localParticipant
        .getTrackPublication(Track.Source.Microphone)
        ?.track?.mediaStreamTrack;
      if (mic) setStreams((current) => [...current, new MediaStream([mic])]);
      setStatus("live");
      setPresence("listening");
      log("Microphone published");
    } catch (connectError) {
      setError(connectError instanceof Error ? connectError.message : "Connection failed.");
      setStatus("error");
      setPresence("idle");
    }
  }

  async function toggleMute() {
    const room = roomRef.current;
    if (!room) return;
    const next = !muted;
    await room.localParticipant.setMicrophoneEnabled(!next);
    setMuted(next);
    log(next ? "Microphone muted" : "Microphone unmuted");
  }

  const live = status === "live";
  const connecting = status === "connecting";

  const statusText =
    status === "idle"
      ? "Ready when you are"
      : connecting
        ? "Creating the room and dispatching the worker…"
        : live && !agentJoined
          ? "Connected — waiting for the agent"
          : live
            ? null
            : status === "ended"
              ? "Call ended"
              : error;

  const stamp = (at: number) =>
    formatDuration(Math.max(0, Math.round((at - startedAt) / 1000)));

  return (
    <div className="space-y-8">
      {configured === false ? (
        <div className="flex items-start gap-3 rounded-3 border border-warn/30 bg-warn/[0.07] px-4 py-3">
          <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0 text-warn" strokeWidth={1.75} />
          <div className="min-w-0 text-meta text-text-2">
            <p className="font-medium text-text">LiveKit credentials not set</p>
            <p className="mt-1">
              Add {missing.join(", ") || "LIVEKIT_URL, LIVEKIT_API_KEY, LIVEKIT_API_SECRET"} to{" "}
              <span className="font-mono text-text">frontend/.env.local</span> and restart the dev
              server.
            </p>
          </div>
        </div>
      ) : null}

      {/* The bench: presence, meter, transport. Recessed so it reads as an
          instrument rather than another panel of settings. */}
      <section className="overflow-hidden rounded-3 border border-line bg-sunken">
        <header className="flex items-center justify-between gap-4 border-b border-line px-4 py-3">
          <PresenceIndicator state={presence} label={live && agentJoined ? undefined : undefined} />
          <span className="flex items-center gap-4">
            <span className="tnum font-mono text-meta text-text-2">{formatDuration(seconds)}</span>
            <span className="font-mono text-micro text-text-3">{type.worker}</span>
          </span>
        </header>

        <div className="px-6 py-7">
          <div className="mx-auto max-w-lg">
            <div className="h-12 w-full">
              <LiveWaveform streams={streams} active={live} />
            </div>

            {statusText ? (
              <p
                className={cn(
                  "mt-5 text-center text-ui",
                  status === "error" ? "text-danger" : "text-text-3",
                )}
                aria-live="polite"
              >
                {statusText}
              </p>
            ) : null}
            {hint ? <p className="mt-2 text-center text-meta text-text-3">{hint}</p> : null}

            <div className="mt-6 flex items-center justify-center gap-2">
              {live ? (
                <>
                  <IconButton
                    label={muted ? "Unmute microphone" : "Mute microphone"}
                    onClick={toggleMute}
                    className={cn(
                      "border border-line",
                      muted && "border-danger/30 text-danger",
                    )}
                  >
                    {muted ? (
                      <MicOff className="h-4 w-4" strokeWidth={1.75} />
                    ) : (
                      <Mic className="h-4 w-4" strokeWidth={1.75} />
                    )}
                  </IconButton>
                  <Button variant="secondary" size="lg" onClick={endCall} className="text-danger">
                    <PhoneOff className="h-3.5 w-3.5" strokeWidth={1.75} />
                    End call
                  </Button>
                </>
              ) : (
                <Button
                  variant="primary"
                  size="lg"
                  onClick={startCall}
                  disabled={connecting || configured === false}
                >
                  <Mic className="h-3.5 w-3.5" strokeWidth={2} />
                  {connecting
                    ? "Connecting…"
                    : status === "ended" || status === "error"
                      ? "Call again"
                      : "Start test call"}
                </Button>
              )}
            </div>
          </div>
        </div>

        <div ref={audioRef} className="hidden" />
      </section>

      <div className="grid gap-8 lg:grid-cols-3">
        <div className="lg:col-span-2">
          <h3 className="text-ui font-medium text-text">Conversation</h3>
          {lines.length === 0 ? (
            <p className="mt-4 rounded-3 border border-dashed border-line px-4 py-8 text-center text-meta text-text-3">
              Start a call and the conversation appears here as it happens.
            </p>
          ) : (
            <div ref={transcriptRef} className="mt-3 max-h-[28rem] overflow-y-auto">
              <Conversation>
                {lines.map((line) => (
                  <Turn
                    key={line.id}
                    speaker={line.speaker}
                    timestamp={stamp(line.at)}
                    interim={!line.final}
                  >
                    {line.text}
                  </Turn>
                ))}
              </Conversation>
            </div>
          )}
        </div>

        <div className="space-y-8">
          <div>
            <h3 className="text-ui font-medium text-text">Measured</h3>
            <PropertyList className="mt-2 border-y border-line">
              <Property label="Time to first word" mono>
                {firstWordMs === null ? "—" : `${(firstWordMs / 1000).toFixed(2)}s`}
              </Property>
              <Property label="Turns" mono>
                {lines.length ? String(lines.length) : "—"}
              </Property>
              <Property label="Duration" mono>
                {seconds ? formatDuration(seconds) : "—"}
              </Property>
            </PropertyList>
            <p className="mt-2 text-meta text-text-3">
              Per-turn latency needs the worker to report timings.
            </p>
          </div>

          <div>
            <h3 className="text-ui font-medium text-text">Events</h3>
            {events.length === 0 ? (
              <p className="mt-2 text-meta text-text-3">Nothing yet.</p>
            ) : (
              <div className="mt-2 divide-y divide-line border-y border-line">
                {events.map((event) => (
                  <CallEvent key={event.id} timestamp={stamp(event.at)}>
                    {event.text}
                  </CallEvent>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      <p className="text-meta text-text-3">
        The worker runs whatever is deployed in LiveKit Cloud. This console sends its configuration
        as job metadata, but the entrypoints in{" "}
        <span className="font-mono text-text-2">voice-agent/</span> don&apos;t read it yet, so the
        call uses their hardcoded company and voice.
      </p>
    </div>
  );
}
