import type { Assistant } from "@/lib/types";
import { AGENT_TYPES } from "@/lib/catalog";

/**
 * Server-only helpers. The API key and secret must never reach the browser,
 * so nothing in here may be imported from a client component.
 */

export interface LiveKitEnv {
  url: string;
  apiKey: string;
  apiSecret: string;
}

export function readLiveKitEnv(): { env: LiveKitEnv | null; missing: string[] } {
  const url = process.env.LIVEKIT_URL;
  const apiKey = process.env.LIVEKIT_API_KEY;
  const apiSecret = process.env.LIVEKIT_API_SECRET;

  const missing = [
    !url && "LIVEKIT_URL",
    !apiKey && "LIVEKIT_API_KEY",
    !apiSecret && "LIVEKIT_API_SECRET",
  ].filter(Boolean) as string[];

  if (missing.length) return { env: null, missing };
  return { env: { url: url!, apiKey: apiKey!, apiSecret: apiSecret! }, missing: [] };
}

/** The dispatch/room APIs speak https, the client SDK speaks wss. */
export function toHttpUrl(wsUrl: string) {
  return wsUrl.replace(/^ws/, "http");
}

/**
 * What gets handed to the worker as job metadata. Snake case because the
 * consumer is Python. `voice-agent/` ignores this today - it hardcodes its
 * company and pipeline - so it only takes effect once the entrypoints read
 * `ctx.job.metadata`.
 */
export function buildDispatchMetadata(assistant: Assistant) {
  return JSON.stringify({
    assistant_id: assistant.id,
    assistant_name: assistant.name,
    company_name: assistant.companyName,
    company_profile: assistant.companyProfile,
    first_message: assistant.model.firstMessage,
    system_prompt: assistant.model.systemPrompt,
    tasks: assistant.tasks,
    tools: assistant.tools,
    model: {
      provider: assistant.model.provider,
      model: assistant.model.model,
      temperature: assistant.model.temperature,
      max_tokens: assistant.model.maxTokens,
    },
    voice: {
      provider: assistant.voice.provider,
      voice_id: assistant.voice.voiceId,
      speed: assistant.voice.speed,
    },
    transcriber: {
      provider: assistant.transcriber.provider,
      model: assistant.transcriber.model,
      language: assistant.transcriber.language,
    },
    turn_handling: {
      max_delay: assistant.advanced.maxDelay,
      allow_interruptions: assistant.advanced.allowInterruptions,
    },
  });
}

export function workerFor(assistant: Assistant) {
  return AGENT_TYPES[assistant.agentType].worker;
}
