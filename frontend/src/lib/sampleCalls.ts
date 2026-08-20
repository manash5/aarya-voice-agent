export type TranscriptSpeaker = "caller" | "agent";

export interface TranscriptLine {
  id: string;
  speaker: TranscriptSpeaker;
  timestamp: string;
  text: string;
}

export interface ExtractedField {
  label: string;
  value: string;
}

export interface CallSample {
  id: string;
  caller: string;
  assistant: string;
  started: string;
  duration: string;
  outcome: string;
  statusTone: "live" | "neutral" | "warn";
  summary: string;
  aiSummary: string;
  transcript: TranscriptLine[];
  keyMoments: { time: string; moment: string }[];
  extracted: ExtractedField[];
  tags: string[];
  sentiment: "positive" | "neutral" | "negative";
}

export const SAMPLE_CALLS: CallSample[] = [
  {
    id: "c_8f21a4",
    caller: "Unknown caller",
    assistant: "Scalina Media · Reception",
    started: "Today, 10:14",
    duration: "1:42",
    outcome: "Answered",
    statusTone: "live",
    summary: "Asked about short-form content pricing, sent to info@scalinamedia.com.",
    aiSummary:
      "The caller wanted pricing for short-form content. The assistant confirmed their intent and routed them to the email for a quote.",
    transcript: [
      {
        id: "t1",
        speaker: "caller",
        timestamp: "00:00",
        text: "Hi, I’m calling about short-form content pricing.",
      },
      {
        id: "t2",
        speaker: "agent",
        timestamp: "00:06",
        text: "Sure — what platform and how often do you publish?",
      },
      {
        id: "t3",
        speaker: "caller",
        timestamp: "00:14",
        text: "Mostly Instagram Reels. About twice a month.",
      },
      {
        id: "t4",
        speaker: "agent",
        timestamp: "00:21",
        text: "Got it. I’ll route you to info@scalinamedia.com for a tailored quote.",
      },
    ],
    keyMoments: [
      { time: "00:06", moment: "Assistant asks platform + publishing frequency." },
      { time: "00:21", moment: "Assistant routes to email for pricing." },
    ],
    extracted: [
      { label: "Goal", value: "Short-form pricing" },
      { label: "Platform", value: "Instagram Reels" },
      { label: "Cadence", value: "Twice a month" },
    ],
    tags: ["pricing", "routing"],
    sentiment: "neutral",
  },
  {
    id: "c_5d90b2",
    caller: "Unknown caller",
    assistant: "Scalina Media · Reception",
    started: "Today, 09:02",
    duration: "3:07",
    outcome: "Booked",
    statusTone: "live",
    summary: "Booked a Tuesday 14:00 intro call via book_appointment.",
    aiSummary:
      "The caller requested an intro call. The assistant confirmed availability and booked Tuesday at 14:00, with follow-up details captured.",
    transcript: [
      { id: "t1", speaker: "caller", timestamp: "00:00", text: "Can we book a quick intro call?" },
      {
        id: "t2",
        speaker: "agent",
        timestamp: "00:08",
        text: "Yes. Do you prefer today or tomorrow, and around what time?",
      },
      { id: "t3", speaker: "caller", timestamp: "00:20", text: "Tuesday at 2 PM works." },
      {
        id: "t4",
        speaker: "agent",
        timestamp: "00:28",
        text: "Great — I’ll book Tuesday at 14:00. What’s the best email for confirmation?",
      },
    ],
    keyMoments: [
      { time: "00:28", moment: "Assistant confirms slot and collects email." },
    ],
    extracted: [
      { label: "Appointment", value: "Tuesday 14:00" },
      { label: "Intent", value: "Intro call" },
    ],
    tags: ["calendar", "booking"],
    sentiment: "positive",
  },
  {
    id: "c_1ac7e6",
    caller: "Unknown caller",
    assistant: "Scalina Media · नेपाली",
    started: "Yesterday, 17:36",
    duration: "0:48",
    outcome: "Dropped",
    statusTone: "warn",
    summary: "Caller hung up during the greeting.",
    aiSummary:
      "The caller disconnected before the greeting finished. No actionable intent was captured.",
    transcript: [
      { id: "t1", speaker: "agent", timestamp: "00:00", text: "नमस्ते, म आर्या बोल्दैछु। तपाईंलाई कसरी सहयोग गर्न सक्छु?" },
      { id: "t2", speaker: "caller", timestamp: "00:09", text: "…" },
    ],
    keyMoments: [{ time: "00:09", moment: "Caller disconnects early." }],
    extracted: [],
    tags: ["drop"],
    sentiment: "neutral",
  },
];

export function getSampleCall(id: string) {
  return SAMPLE_CALLS.find((c) => c.id === id);
}

