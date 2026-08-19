/**
 * The three pipelines that exist in `voice-agent/`. Every assistant runs on one
 * of them - it's a setting on the assistant, not a kind of assistant.
 */
export type AgentTypeId = "english" | "nepali" | "rag";

export type AssistantStatus = "draft" | "published";

export interface KnowledgeFile {
  id: string;
  /** Bytes. Files are never uploaded anywhere yet - only the metadata is kept. */
  name: string;
  size: number;
  addedAt: string;
}

export interface ModelConfig {
  provider: string;
  model: string;
  firstMessage: string;
  systemPrompt: string;
  temperature: number;
  maxTokens: number;
}

export interface VoiceConfig {
  provider: string;
  voiceId: string;
  speed: number;
  background: string;
}

export interface TranscriberConfig {
  provider: string;
  model: string;
  language: string;
}

export interface AdvancedConfig {
  /** Turn detector max delay, mirrors default_turn_handling(max_delay=...). */
  maxDelay: number;
  silenceTimeout: number;
  maxDuration: number;
  allowInterruptions: boolean;
  recordCalls: boolean;
}

export interface Assistant {
  id: string;
  name: string;
  agentType: AgentTypeId;
  status: AssistantStatus;
  createdAt: string;
  updatedAt: string;
  companyName: string;
  companyProfile: string;
  /** What the assistant is allowed to do, in business terms. Drives `tools`. */
  tasks: string[];
  tools: string[];
  model: ModelConfig;
  voice: VoiceConfig;
  transcriber: TranscriberConfig;
  files: KnowledgeFile[];
  advanced: AdvancedConfig;
}
