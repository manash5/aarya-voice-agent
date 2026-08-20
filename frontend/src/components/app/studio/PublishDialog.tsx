"use client";

import { Button, Modal, Property, PropertyList } from "@/components/ui";
import { FindingRow } from "@/components/app/studio/ContextPanel";
import { AGENT_TYPES, VOICES } from "@/lib/catalog";
import { countBySeverity, reviewAgent } from "@/lib/readiness";
import type { Assistant } from "@/lib/types";

/**
 * Publishing puts an agent in front of real callers, so it gets a moment: what
 * exactly is going live, and what the console already knows is wrong with it.
 * Blockers stop the action; warnings are stated and let you through.
 */
export function PublishDialog({
  assistant,
  open,
  onClose,
  onConfirm,
}: {
  assistant: Assistant;
  open: boolean;
  onClose: () => void;
  onConfirm: () => void;
}) {
  const type = AGENT_TYPES[assistant.agentType];
  const voice =
    VOICES[assistant.voice.provider]?.find((v) => v.value === assistant.voice.voiceId)?.label ??
    assistant.voice.voiceId;
  const findings = reviewAgent(assistant);
  const counts = countBySeverity(findings);
  const blocked = counts.blocker > 0;

  return (
    <Modal
      open={open}
      onClose={onClose}
      title={blocked ? "Not ready to publish" : "Ready to go live"}
      description={
        blocked
          ? "Fix these before this agent takes a real call."
          : "This is what callers will reach."
      }
      footer={
        <>
          <Button variant="ghost" onClick={onClose}>
            Cancel
          </Button>
          <Button variant="primary" onClick={onConfirm} disabled={blocked}>
            Publish agent
          </Button>
        </>
      }
    >
      <PropertyList className="border-y border-line">
        <Property label="Agent">{assistant.name}</Property>
        <Property label="Company">{assistant.companyName || "Not set"}</Property>
        <Property label="Pipeline">
          {type.name} · {type.language}
        </Property>
        <Property label="Voice">{voice}</Property>
        <Property label="Number" mono>
          {assistant.phoneNumber || "Not attached"}
        </Property>
        <Property label="Capabilities">
          {assistant.tools.length === 0 ? "None" : `${assistant.tools.length} attached`}
        </Property>
        <Property label="Sources">
          {assistant.files.length === 0 ? "None" : `${assistant.files.length} documents`}
        </Property>
      </PropertyList>

      {findings.length > 0 ? (
        <div className="mt-6">
          <h3 className="eyebrow mb-1">
            {counts.blocker > 0
              ? `${counts.blocker} blocking ${counts.blocker > 1 ? "issues" : "issue"}`
              : "Worth knowing"}
          </h3>
          <ul className="divide-y divide-line border-y border-line">
            {findings.map((finding, index) => (
              <FindingRow key={index} finding={finding} />
            ))}
          </ul>
        </div>
      ) : null}
    </Modal>
  );
}
