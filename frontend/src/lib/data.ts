export type Skill = {
  id: string;
  label: string;
  category: "voice" | "ml" | "infra" | "frontend";
  weight: number; // relative node size, 0.6 - 1.4
  links: string[]; // ids of connected skills
};

// Node graph. Positions are computed at runtime (Skills.tsx) so it stays
// responsive; only the connective tissue lives here.
export const skills: Skill[] = [
  { id: "livekit", label: "LiveKit Agents", category: "voice", weight: 1.4, links: ["stt", "tts", "llm", "python"] },
  { id: "stt", label: "Speech-to-Text", category: "voice", weight: 1.1, links: ["deepgram", "livekit"] },
  { id: "tts", label: "Text-to-Speech", category: "voice", weight: 1.1, links: ["deepgram", "livekit"] },
  { id: "deepgram", label: "Deepgram", category: "voice", weight: 0.9, links: ["stt", "tts"] },
  { id: "llm", label: "LLM Orchestration", category: "ml", weight: 1.3, links: ["groq", "prompt", "rag"] },
  { id: "groq", label: "Groq", category: "ml", weight: 0.9, links: ["llm"] },
  { id: "prompt", label: "Prompt Engineering", category: "ml", weight: 1.0, links: ["llm", "rag"] },
  { id: "rag", label: "RAG Pipelines", category: "ml", weight: 1.1, links: ["prompt", "vector"] },
  { id: "vector", label: "Vector Search", category: "ml", weight: 0.8, links: ["rag"] },
  { id: "python", label: "Python", category: "infra", weight: 1.3, links: ["livekit", "fastapi"] },
  { id: "fastapi", label: "FastAPI", category: "infra", weight: 0.9, links: ["python", "latency"] },
  { id: "latency", label: "Latency Tuning", category: "infra", weight: 1.0, links: ["fastapi", "livekit"] },
  { id: "typescript", label: "TypeScript", category: "frontend", weight: 1.2, links: ["react", "threejs"] },
  { id: "react", label: "React / Next.js", category: "frontend", weight: 1.3, links: ["typescript", "threejs"] },
  { id: "threejs", label: "Three.js / R3F", category: "frontend", weight: 1.1, links: ["react", "gsap"] },
  { id: "gsap", label: "GSAP / Motion", category: "frontend", weight: 1.0, links: ["threejs", "typescript"] },
];

export type Project = {
  id: string;
  index: string; // "01"
  title: string;
  tagline: string;
  description: string;
  problem: string;
  solution: string;
  impact: string;
  stack: string[];
  stats: { label: string; value: string }[];
  hue: number; // base hue for this scene's lighting/gradient
  link?: string;
  repo?: string;
};

// The first project is real (this repo). The remaining two are placeholders —
// swap in real work in this array, the rest of the section is data-driven.
export const projects: Project[] = [
  {
    id: "aarya",
    index: "01",
    title: "Aarya Voice Agent",
    tagline: "Real-time AI receptionist, tuned for human-speed conversation",
    description:
      "A platform for real-time AI voice agents built on LiveKit — starting with a receptionist, architected so personality and behavior stay in one shared core while per-company knowledge and per-language variants are swapped in as configuration.",
    problem:
      "Most voice-agent demos feel like talking to a phone tree with a language model bolted on — laggy turns, robotic cadence, no sense of who they're talking to.",
    solution:
      "Direct provider connections instead of a routing gateway, pooled TTS connections, and tuned turn-detection/endpointing to shrink the speech-to-speech loop. A shared persona layer keeps tone consistent while company profile and language (including Nepali/English code-switching) are injected per deployment.",
    impact:
      "Sub-second perceived response latency in console testing, with English/Australian and Nepali variants running on the same core agent codebase.",
    stack: ["LiveKit Agents", "Python", "Groq", "Deepgram", "Next.js"],
    stats: [
      { label: "Latency focus", value: "Direct STT/TTS" },
      { label: "Languages", value: "EN + NE" },
      { label: "Architecture", value: "Shared core agent" },
    ],
    hue: 265,
  },
  {
    id: "project-two",
    index: "02",
    title: "Add your next project",
    tagline: "Replace this entry in src/lib/data.ts",
    description:
      "This is placeholder content so the storytelling scene has something real to animate — swap in a real project title, tagline and description.",
    problem: "What was broken or missing before this project existed?",
    solution: "What did you actually build, and what made the approach non-obvious?",
    impact: "What changed as a result — numbers if you have them.",
    stack: ["Stack", "Goes", "Here"],
    stats: [
      { label: "Metric", value: "Value" },
      { label: "Metric", value: "Value" },
      { label: "Metric", value: "Value" },
    ],
    hue: 190,
  },
  {
    id: "project-three",
    index: "03",
    title: "Add another project",
    tagline: "Replace this entry in src/lib/data.ts",
    description:
      "A third scene rounds out the rhythm of the section — three feels intentional, one feels thin, five starts to drag.",
    problem: "What was broken or missing before this project existed?",
    solution: "What did you actually build, and what made the approach non-obvious?",
    impact: "What changed as a result — numbers if you have them.",
    stack: ["Stack", "Goes", "Here"],
    stats: [
      { label: "Metric", value: "Value" },
      { label: "Metric", value: "Value" },
      { label: "Metric", value: "Value" },
    ],
    hue: 25,
  },
];
