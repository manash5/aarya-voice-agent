import type { BehaviorConfig } from "@/lib/types";

export const EMPTY_BEHAVIOR: BehaviorConfig = {
  role: "",
  tone: "",
  goals: [],
  rules: [],
  conversationStyle: "",
  escalation: "",
  custom: "",
};

/** The sections, in the order they're edited and the order they compile. */
export const BEHAVIOR_SECTIONS = [
  {
    key: "role",
    label: "Role",
    prompt: "What this agent is responsible for.",
    placeholder: "Front desk for a marketing agency. Answers questions and books intro calls.",
  },
  {
    key: "tone",
    label: "Tone",
    prompt: "How it should sound to a caller.",
    placeholder: "Warm and efficient. Never salesy.",
  },
  {
    key: "conversationStyle",
    label: "Conversation style",
    prompt: "How it handles the shape of a conversation.",
    placeholder: "One question at a time. Confirm anything spelled out. Keep replies to a sentence.",
  },
  {
    key: "escalation",
    label: "Escalation",
    prompt: "When it should stop and hand over to a person.",
    placeholder: "Transfer if the caller asks for a human, is upset, or wants to change an invoice.",
  },
] as const satisfies readonly {
  key: keyof Pick<BehaviorConfig, "role" | "tone" | "conversationStyle" | "escalation">;
  label: string;
  prompt: string;
  placeholder: string;
}[];

function block(heading: string, body: string) {
  const text = body.trim();
  return text ? `${heading}\n${text}` : "";
}

function list(heading: string, items: string[]) {
  const clean = items.map((item) => item.trim()).filter(Boolean);
  return clean.length ? `${heading}\n${clean.map((item) => `- ${item}`).join("\n")}` : "";
}

/**
 * Compiles the structured fields into the prompt the worker actually gets.
 * Empty sections are omitted rather than emitted as blank headings, so a
 * lightly-configured agent doesn't ship a skeleton full of gaps.
 */
export function composeSystemPrompt(behavior: BehaviorConfig): string {
  return [
    block("ROLE", behavior.role),
    block("TONE", behavior.tone),
    list("GOALS", behavior.goals),
    list("RULES", behavior.rules),
    block("CONVERSATION STYLE", behavior.conversationStyle),
    block("ESCALATION", behavior.escalation),
    behavior.custom.trim(),
  ]
    .filter(Boolean)
    .join("\n\n");
}

/** How much of the behaviour has actually been filled in. Drives readiness. */
export function behaviorFilled(behavior: BehaviorConfig) {
  const parts = [
    behavior.role,
    behavior.tone,
    behavior.conversationStyle,
    behavior.escalation,
    behavior.goals.join(""),
    behavior.rules.join(""),
  ];
  return parts.filter((part) => part.trim().length > 0).length;
}

export const BEHAVIOR_PART_COUNT = 6;
