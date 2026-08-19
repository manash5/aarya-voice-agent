import type { Assistant, AgentTypeId } from "@/lib/types";

/**
 * Static option lists for the admin UI. Values mirror what `voice-agent/`
 * actually runs today; anything marked `planned` has no pipeline behind it yet
 * and is here so the shape of the UI is right when it does.
 */

export interface Option {
  value: string;
  label: string;
  hint?: string;
  planned?: boolean;
}

export const AGENT_TYPES: Record<
  AgentTypeId,
  {
    id: AgentTypeId;
    name: string;
    worker: string;
    entrypoint: string;
    language: string;
    tagline: string;
    description: string;
    accent: string;
  }
> = {
  english: {
    id: "english",
    name: "English",
    worker: "aarya",
    entrypoint: "agent.py",
    language: "English",
    tagline: "Fastest stack. Deepgram in, Deepgram out.",
    description:
      "Deepgram Nova-3 speech-to-text, Groq gpt-oss-120b, Aura 2 text-to-speech. The lowest-latency option.",
    accent: "#14b88a",
  },
  nepali: {
    id: "nepali",
    name: "Nepali",
    worker: "aarya-nepali",
    entrypoint: "nepali_agent.py",
    language: "Nepali",
    tagline: "Nepali speech in, Hindi-accented speech out.",
    description:
      "ElevenLabs Scribe / AssemblyAI speech-to-text for Nepali, replies in Devanagari, Cartesia Sonic 3 Hindi voice.",
    accent: "#6f8ef5",
  },
  rag: {
    id: "rag",
    name: "Knowledge base",
    worker: "aarya-rag",
    entrypoint: "rag_agent.py",
    language: "English",
    tagline: "English stack plus document retrieval.",
    description:
      "Same English pipeline with a tool-capable model, so the assistant can look things up in uploaded documents. Retrieval itself is still a stub.",
    accent: "#c78bf0",
  },
};

export const AGENT_TYPE_LIST = Object.values(AGENT_TYPES);

export const LLM_PROVIDERS: Option[] = [
  { value: "groq", label: "Groq" },
  { value: "mistral", label: "Mistral" },
  { value: "google", label: "Google (via LiveKit Inference)" },
  { value: "openai", label: "OpenAI (via LiveKit Inference)" },
];

export const LLM_MODELS: Record<string, Option[]> = {
  groq: [
    {
      value: "openai/gpt-oss-120b",
      label: "gpt-oss-120b",
      hint: "Current default. Reasoning model, effort pinned low.",
    },
    { value: "llama-3.3-70b-versatile", label: "llama-3.3-70b-versatile" },
  ],
  mistral: [
    {
      value: "mistral-small-latest",
      label: "mistral-small-latest",
      hint: "First choice when the assistant needs function tools.",
    },
  ],
  google: [{ value: "google/gemini-2.5-flash-lite", label: "gemini-2.5-flash-lite" }],
  openai: [{ value: "openai/gpt-4.1-mini", label: "gpt-4.1-mini" }],
};

export const VOICE_PROVIDERS: Option[] = [
  { value: "deepgram", label: "Deepgram Aura 2" },
  { value: "cartesia", label: "Cartesia Sonic 3" },
  { value: "elevenlabs", label: "ElevenLabs", planned: true },
  { value: "openai", label: "OpenAI", planned: true },
];

export const VOICES: Record<string, Option[]> = {
  deepgram: [
    { value: "aura-2-theia-en", label: "Theia", hint: "Female · Australian · expressive, polite" },
    { value: "aura-2-asteria-en", label: "Asteria", hint: "Female · US · crisp, confident" },
    { value: "aura-2-luna-en", label: "Luna", hint: "Female · US · friendly" },
    { value: "aura-2-harmonia-en", label: "Harmonia", hint: "Female · US · calm" },
    { value: "aura-2-cordelia-en", label: "Cordelia", hint: "Female · US · warm" },
    { value: "aura-2-apollo-en", label: "Apollo", hint: "Male · US" },
    { value: "aura-2-hyperion-en", label: "Hyperion", hint: "Male · Australian" },
  ],
  cartesia: [
    { value: "sonic-3-hi-female", label: "Sonic 3 Hindi (female)", hint: "Used by the Nepali stack" },
    { value: "sonic-3-hi-male", label: "Sonic 3 Hindi (male)" },
    { value: "sonic-3-en-female", label: "Sonic 3 English (female)" },
  ],
  elevenlabs: [
    { value: "eleven-rachel", label: "Rachel", planned: true },
    { value: "eleven-adam", label: "Adam", planned: true },
  ],
  openai: [
    { value: "openai-alloy", label: "Alloy", planned: true },
    { value: "openai-shimmer", label: "Shimmer", planned: true },
  ],
};

export const BACKGROUND_SOUNDS: Option[] = [
  { value: "none", label: "None" },
  { value: "office", label: "Office ambience" },
  { value: "call-center", label: "Call center" },
];

export const TRANSCRIBER_PROVIDERS: Option[] = [
  { value: "deepgram", label: "Deepgram" },
  { value: "assemblyai", label: "AssemblyAI" },
  { value: "elevenlabs", label: "ElevenLabs Scribe" },
];

export const TRANSCRIBER_MODELS: Record<string, Option[]> = {
  deepgram: [{ value: "nova-3", label: "nova-3", hint: "Interim results, 25 ms endpointing" }],
  assemblyai: [
    { value: "universal-3-5-pro", label: "universal-3-5-pro", hint: "Handles ne + en" },
    { value: "universal-streaming-english", label: "universal-streaming-english" },
  ],
  elevenlabs: [{ value: "scribe_v2_realtime", label: "scribe_v2_realtime", hint: "Nepali default" }],
};

export const TRANSCRIBER_LANGUAGES: Option[] = [
  { value: "en", label: "English" },
  { value: "ne", label: "Nepali" },
  { value: "hi", label: "Hindi" },
  { value: "multi", label: "Multilingual" },
];

export interface ToolDefinition {
  id: string;
  name: string;
  group: string;
  description: string;
  status: "live" | "planned";
}

/** Placeholder catalog - only the calendar and email tools exist in code today. */
export const TOOL_CATALOG: ToolDefinition[] = [
  {
    id: "check_availability",
    name: "check_availability",
    group: "Calendar",
    description: "Read free and busy blocks for a day from the connected Google Calendar.",
    status: "live",
  },
  {
    id: "book_appointment",
    name: "book_appointment",
    group: "Calendar",
    description: "Create a real calendar event once the caller gives a date and time.",
    status: "live",
  },
  {
    id: "collect_email",
    name: "collect_email",
    group: "Contact",
    description: "Capture and confirm a caller's email letter by letter instead of guessing it.",
    status: "live",
  },
  {
    id: "search_knowledge_base",
    name: "search_knowledge_base",
    group: "Knowledge",
    description: "Look up an answer in the assistant's uploaded documents. Retrieval is still a stub.",
    status: "planned",
  },
  {
    id: "transfer_call",
    name: "transfer_call",
    group: "Call control",
    description: "Warm-transfer the caller to a human on another number.",
    status: "planned",
  },
  {
    id: "end_call",
    name: "end_call",
    group: "Call control",
    description: "Hang up once the conversation has clearly finished.",
    status: "planned",
  },
  {
    id: "send_sms",
    name: "send_sms",
    group: "Messaging",
    description: "Text the caller a link or a summary after the call.",
    status: "planned",
  },
  {
    id: "take_message",
    name: "take_message",
    group: "Contact",
    description: "Write down a message for a teammate and route it to their inbox.",
    status: "planned",
  },
  {
    id: "lookup_order",
    name: "lookup_order",
    group: "CRM",
    description: "Fetch an order or ticket status by reference number.",
    status: "planned",
  },
  {
    id: "create_lead",
    name: "create_lead",
    group: "CRM",
    description: "Push a qualified caller into the CRM as a new lead.",
    status: "planned",
  },
];

export function toolById(id: string) {
  return TOOL_CATALOG.find((tool) => tool.id === id);
}

export interface TaskDefinition {
  id: string;
  name: string;
  description: string;
  /** Tools this task needs. Selecting the task attaches them. */
  tools: string[];
  /** Only offered when the assistant runs on this agent type. */
  requiresAgentType?: AgentTypeId;
}

/**
 * Tasks are the business-level version of tools: what the assistant is for.
 * Picking tasks is how a generic pipeline becomes a specific assistant.
 */
export const TASK_CATALOG: TaskDefinition[] = [
  {
    id: "answer_questions",
    name: "Answer questions about the company",
    description: "Services, hours, location, pricing - anything in the company context below.",
    tools: [],
  },
  {
    id: "book_appointments",
    name: "Book appointments",
    description: "Check the calendar for free slots and put the caller on it.",
    tools: ["check_availability", "book_appointment"],
  },
  {
    id: "take_messages",
    name: "Take a message",
    description: "Write down who called, why, and how to reach them.",
    tools: ["take_message"],
  },
  {
    id: "collect_contact",
    name: "Collect contact details",
    description: "Get an email or phone number, spelled back and confirmed.",
    tools: ["collect_email"],
  },
  {
    id: "qualify_leads",
    name: "Qualify leads",
    description: "Ask the qualifying questions and log the caller as a lead.",
    tools: ["create_lead"],
  },
  {
    id: "order_status",
    name: "Look up an order",
    description: "Answer 'where is my order' from a reference number.",
    tools: ["lookup_order"],
  },
  {
    id: "search_documents",
    name: "Answer from uploaded documents",
    description: "Search the assistant's knowledge base before answering.",
    tools: ["search_knowledge_base"],
    requiresAgentType: "rag",
  },
  {
    id: "send_followup",
    name: "Send a follow-up",
    description: "Text or email a summary, quote or link after the call.",
    tools: ["send_sms"],
  },
  {
    id: "transfer_to_human",
    name: "Transfer to a human",
    description: "Hand off when the caller needs authority the assistant doesn't have.",
    tools: ["transfer_call"],
  },
];

export function taskById(id: string) {
  return TASK_CATALOG.find((task) => task.id === id);
}

/**
 * Tools implied by a set of tasks. Kept separate from the assistant's `tools`
 * so someone can still attach a tool by hand on the Tasks tab.
 */
export function toolsForTasks(tasks: string[]) {
  const tools = new Set<string>();
  for (const id of tasks) {
    for (const tool of taskById(id)?.tools ?? []) tools.add(tool);
  }
  return [...tools];
}

const DEFAULT_COMPANY_PROFILE = `Scalina Media is a digital marketing and social media growth agency based in
Sydney, Australia. Tagline: "Go Digital, or Go Invisible."

Services:
- Short-form content strategy and production (Reels, TikToks, short-form video)
- Social media growth and management
- Lead generation funnels
- SEO
- Website development

For quotes or new business, point callers to email info@scalinamedia.com.

Business hours for booking suggestions are 9:00-17:00 local time.`;

type AssistantDefaults = Omit<Assistant, "id" | "name" | "createdAt" | "updatedAt" | "status">;

export function agentTypeDefaults(agentType: AgentTypeId): AssistantDefaults {
  const base: AssistantDefaults = {
    agentType,
    companyName: "",
    companyProfile: "",
    tasks: ["answer_questions", "take_messages"],
    tools: [],
    model: {
      provider: "groq",
      model: "openai/gpt-oss-120b",
      firstMessage: "Hey, thanks for calling - how can I help?",
      systemPrompt:
        "Keep replies to one sentence where you can, use contractions, and never read out a list.",
      temperature: 0.4,
      maxTokens: 80,
    },
    voice: {
      provider: "deepgram",
      voiceId: "aura-2-theia-en",
      speed: 1.15,
      background: "none",
    },
    transcriber: { provider: "deepgram", model: "nova-3", language: "en" },
    files: [],
    advanced: {
      maxDelay: 0.6,
      silenceTimeout: 20,
      maxDuration: 600,
      allowInterruptions: true,
      recordCalls: true,
    },
  };

  if (agentType === "nepali") {
    return {
      ...base,
      model: {
        ...base.model,
        firstMessage: "नमस्ते, म कसरी मद्दत गर्न सक्छु?",
        systemPrompt:
          "Always reply in Nepali, written in Devanagari. Callers may mix in English words - understand them, but keep your own replies in Nepali.",
      },
      voice: { provider: "cartesia", voiceId: "sonic-3-hi-female", speed: 1, background: "none" },
      transcriber: { provider: "elevenlabs", model: "scribe_v2_realtime", language: "ne" },
      advanced: { ...base.advanced, maxDelay: 0.85 },
    };
  }

  if (agentType === "rag") {
    return {
      ...base,
      tasks: [...base.tasks, "search_documents"],
      model: {
        ...base.model,
        provider: "mistral",
        model: "mistral-small-latest",
        maxTokens: 160,
      },
      advanced: { ...base.advanced, maxDelay: 0.7 },
    };
  }

  return base;
}

export const SAMPLE_COMPANY_PROFILE = DEFAULT_COMPANY_PROFILE;
