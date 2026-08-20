import { toolById, taskById, TASK_CATALOG } from "@/lib/catalog";
import type { Assistant } from "@/lib/types";

export type Severity = "blocker" | "warning" | "note";

export interface Finding {
  severity: Severity;
  /** Which studio section fixes it. */
  section: string;
  message: string;
}

/**
 * Real checks over real configuration - no model call, no guessing. This is
 * what makes publishing mean something: it answers "will this agent actually
 * behave on a phone call", which is the question an operator has.
 */
export function reviewAgent(assistant: Assistant): Finding[] {
  const findings: Finding[] = [];
  const { behavior, model, advanced, files, tools, tasks } = assistant;

  if (!behavior.role.trim()) {
    findings.push({
      severity: "blocker",
      section: "Behavior",
      message: "No role set — the agent has no statement of what it is for.",
    });
  }

  if (!model.firstMessage.trim()) {
    findings.push({
      severity: "blocker",
      section: "Behavior",
      message: "No first message — the agent will answer the call in silence.",
    });
  }

  if (!assistant.companyProfile.trim()) {
    findings.push({
      severity: "blocker",
      section: "Knowledge",
      message: "No company profile — there is nothing for the agent to answer from.",
    });
  }

  if (behavior.rules.filter((rule) => rule.trim()).length === 0) {
    findings.push({
      severity: "warning",
      section: "Behavior",
      message: "No rules set — nothing stops the agent inventing a price or a date.",
    });
  }

  if (behavior.goals.filter((goal) => goal.trim()).length === 0) {
    findings.push({
      severity: "note",
      section: "Behavior",
      message: "No goals set — the agent has no definition of a call going well.",
    });
  }

  const plannedTools = tools
    .map((id) => toolById(id))
    .filter((tool) => tool && tool.status !== "live");
  if (plannedTools.length > 0) {
    findings.push({
      severity: "warning",
      section: "Actions",
      message: `${plannedTools.map((t) => t!.name).join(", ")} ${
        plannedTools.length > 1 ? "are" : "is"
      } not implemented yet and will fail if called.`,
    });
  }

  const blockedTasks = tasks
    .map((id) => taskById(id))
    .filter(
      (task) =>
        task?.requiresAgentType !== undefined && task.requiresAgentType !== assistant.agentType,
    );
  if (blockedTasks.length > 0) {
    findings.push({
      severity: "warning",
      section: "Actions",
      message: `${blockedTasks.map((t) => t!.name).join(", ")} needs a different pipeline than the one selected.`,
    });
  }

  if (files.length > 0 && assistant.agentType !== "rag") {
    findings.push({
      severity: "warning",
      section: "Knowledge",
      message: `${files.length} document${files.length > 1 ? "s" : ""} attached, but this pipeline can't retrieve them.`,
    });
  }

  if (model.maxTokens > 200) {
    findings.push({
      severity: "warning",
      section: "Conversation",
      message: `Replies can run to ${model.maxTokens} tokens — long on a phone call, where a caller expects a sentence.`,
    });
  }

  if (model.temperature > 0.7) {
    findings.push({
      severity: "note",
      section: "Conversation",
      message: `Temperature ${model.temperature.toFixed(2)} will read as inconsistent across calls.`,
    });
  }

  if (!advanced.allowInterruptions) {
    findings.push({
      severity: "note",
      section: "Conversation",
      message: "Interruptions are off — the caller cannot talk over the agent.",
    });
  }

  if (!assistant.phoneNumber) {
    findings.push({
      severity: "note",
      section: "Calling",
      message: "No number attached — this agent can be tested but not called.",
    });
  }

  return findings;
}

export function countBySeverity(findings: Finding[]) {
  return {
    blocker: findings.filter((f) => f.severity === "blocker").length,
    warning: findings.filter((f) => f.severity === "warning").length,
    note: findings.filter((f) => f.severity === "note").length,
  };
}

/** Tasks that this pipeline can actually run, for the Actions section. */
export function availableTasks(agentType: Assistant["agentType"]) {
  return TASK_CATALOG.filter(
    (task) => task.requiresAgentType === undefined || task.requiresAgentType === agentType,
  );
}
