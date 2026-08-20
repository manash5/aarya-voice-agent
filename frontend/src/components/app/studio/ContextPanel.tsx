"use client";

import { AlertTriangle, CircleAlert, Info } from "lucide-react";

import { Property, PropertyList, Status } from "@/components/ui";
import { AGENT_TYPES, VOICES, toolById } from "@/lib/catalog";
import { cn } from "@/lib/cn";
import { reviewAgent, type Finding, type Severity } from "@/lib/readiness";
import type { Assistant } from "@/lib/types";

const ICON: Record<Severity, typeof Info> = {
  blocker: CircleAlert,
  warning: AlertTriangle,
  note: Info,
};

const TONE: Record<Severity, string> = {
  blocker: "text-danger",
  warning: "text-warn",
  note: "text-text-3",
};

export function FindingRow({
  finding,
  onGo,
}: {
  finding: Finding;
  onGo?: (section: string) => void;
}) {
  const Icon = ICON[finding.severity];
  return (
    <li className="flex items-start gap-2.5 py-2.5">
      <Icon className={cn("mt-0.5 h-3.5 w-3.5 shrink-0", TONE[finding.severity])} strokeWidth={1.75} />
      <div className="min-w-0">
        <p className="text-meta text-text-2">{finding.message}</p>
        {onGo ? (
          <button
            type="button"
            onClick={() => onGo(finding.section)}
            className="mt-1 rounded-1 text-micro text-text-3 underline decoration-line-strong underline-offset-2 transition-colors hover:text-text"
          >
            Open {finding.section}
          </button>
        ) : null}
      </div>
    </li>
  );
}

/**
 * The agent at a glance, beside the thing being edited. Answers "what is this
 * agent right now" and "is anything stopping it working" without leaving the
 * section you're in.
 */
export function ContextPanel({
  assistant,
  onGo,
}: {
  assistant: Assistant;
  onGo: (section: string) => void;
}) {
  const type = AGENT_TYPES[assistant.agentType];
  const voice =
    VOICES[assistant.voice.provider]?.find((v) => v.value === assistant.voice.voiceId)?.label ??
    assistant.voice.voiceId;
  const findings = reviewAgent(assistant);
  const live = assistant.tools.filter((id) => toolById(id)?.status === "live").length;

  return (
    <div className="space-y-8">
      <section>
        <h3 className="eyebrow mb-1">Configuration</h3>
        <PropertyList>
          <Property label="Pipeline">{type.name}</Property>
          <Property label="Language">{type.language}</Property>
          <Property label="Voice">{voice}</Property>
          <Property label="Pace" mono>
            {assistant.voice.speed.toFixed(2)}×
          </Property>
          <Property label="Model" mono>
            {assistant.model.model}
          </Property>
          <Property label="Reply cap" mono>
            {assistant.model.maxTokens} tokens
          </Property>
          <Property label="Capabilities">
            {assistant.tools.length === 0
              ? "None"
              : `${live} ready${assistant.tools.length > live ? ` · ${assistant.tools.length - live} not built` : ""}`}
          </Property>
          <Property label="Sources">
            {assistant.files.length === 0
              ? "None"
              : `${assistant.files.length} document${assistant.files.length > 1 ? "s" : ""}`}
          </Property>
          <Property label="Number" mono>
            {assistant.phoneNumber || "Not attached"}
          </Property>
        </PropertyList>
      </section>

      <section>
        <div className="mb-1 flex items-center justify-between gap-3">
          <h3 className="eyebrow">Readiness</h3>
          {findings.length === 0 ? <Status tone="live">Clear</Status> : null}
        </div>
        {findings.length === 0 ? (
          <p className="py-2 text-meta text-text-3">
            Nothing is standing between this agent and a real call.
          </p>
        ) : (
          <ul className="divide-y divide-line border-y border-line">
            {findings.map((finding, index) => (
              <FindingRow key={index} finding={finding} onGo={onGo} />
            ))}
          </ul>
        )}
      </section>
    </div>
  );
}
