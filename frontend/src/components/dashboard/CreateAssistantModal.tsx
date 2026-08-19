"use client";

import { Check, ChevronDown } from "lucide-react";
import { useState } from "react";

import { Modal } from "@/components/ui/Modal";
import { Button, Field, Input, Textarea } from "@/components/ui/controls";
import { AGENT_TYPE_LIST, TASK_CATALOG } from "@/lib/catalog";
import { cn } from "@/lib/cn";
import type { AgentTypeId } from "@/lib/types";
import type { NewAssistantInput } from "@/lib/store";

const DEFAULT_TASKS = ["answer_questions", "take_messages"];

export function CreateAssistantModal({
  open,
  onClose,
  onCreate,
}: {
  open: boolean;
  onClose: () => void;
  onCreate: (input: NewAssistantInput) => void;
}) {
  const [name, setName] = useState("");
  const [companyName, setCompanyName] = useState("");
  const [companyProfile, setCompanyProfile] = useState("");
  const [agentType, setAgentType] = useState<AgentTypeId>("english");
  const [tasks, setTasks] = useState<string[]>(DEFAULT_TASKS);
  const [showType, setShowType] = useState(false);

  function reset() {
    setName("");
    setCompanyName("");
    setCompanyProfile("");
    setAgentType("english");
    setTasks(DEFAULT_TASKS);
    setShowType(false);
  }

  function submit() {
    onCreate({
      name: name.trim() || companyName.trim() || "Untitled assistant",
      agentType,
      companyName: companyName.trim(),
      companyProfile: companyProfile.trim(),
      tasks,
    });
    reset();
    onClose();
  }

  const selectedType = AGENT_TYPE_LIST.find((type) => type.id === agentType)!;
  const available = TASK_CATALOG.filter(
    (task) => task.requiresAgentType === undefined || task.requiresAgentType === agentType,
  );

  return (
    <Modal
      open={open}
      onClose={onClose}
      title="Create assistant"
      description="Name it, tell it who it works for and what it's allowed to do. Everything here is editable afterwards."
      className="max-w-2xl"
      footer={
        <>
          <Button variant="ghost" onClick={onClose}>
            Cancel
          </Button>
          <Button variant="primary" onClick={submit}>
            Create assistant
          </Button>
        </>
      }
    >
      <div className="max-h-[60vh] space-y-5 overflow-y-auto pr-1">
        <div className="grid gap-4 sm:grid-cols-2">
          <Field label="Assistant name">
            <Input
              autoFocus
              value={name}
              onChange={(event) => setName(event.target.value)}
              placeholder="e.g. Ozi Hygiene · Reception"
            />
          </Field>
          <Field label="Company">
            <Input
              value={companyName}
              onChange={(event) => setCompanyName(event.target.value)}
              placeholder="e.g. Ozi Hygiene"
            />
          </Field>
        </div>

        <Field
          label="Company context"
          hint="Services, hours, policies, where to send quotes. This is what the assistant answers from."
        >
          <Textarea
            rows={5}
            value={companyProfile}
            onChange={(event) => setCompanyProfile(event.target.value)}
            placeholder="Who they are, what they sell, opening hours, anything a receptionist would be briefed on…"
            className="text-xs leading-relaxed"
          />
        </Field>

        <div>
          <p className="mb-2 text-xs font-medium text-ink-muted">Tasks</p>
          <div className="flex flex-wrap gap-1.5">
            {available.map((task) => {
              const selected = tasks.includes(task.id);
              return (
                <button
                  key={task.id}
                  type="button"
                  title={task.description}
                  onClick={() =>
                    setTasks((current) =>
                      selected ? current.filter((id) => id !== task.id) : [...current, task.id],
                    )
                  }
                  className={cn(
                    "rounded-full border px-2.5 py-1 text-xs transition-colors",
                    selected
                      ? "border-accent/60 bg-accent/10 text-accent"
                      : "border-line text-ink-muted hover:border-ink-dim hover:text-ink",
                  )}
                >
                  {task.name}
                </button>
              );
            })}
          </div>
        </div>

        <div className="rounded-xl border border-line bg-panel-2">
          <button
            type="button"
            onClick={() => setShowType((value) => !value)}
            className="flex w-full items-center justify-between gap-3 px-3.5 py-3 text-left"
          >
            <span className="min-w-0">
              <span className="block text-xs font-medium text-ink-muted">Agent type</span>
              <span className="mt-0.5 flex items-center gap-2">
                <span
                  className="h-2 w-2 shrink-0 rounded-full"
                  style={{ background: selectedType.accent }}
                />
                <span className="truncate text-sm text-ink">{selectedType.name}</span>
                <span className="truncate font-mono text-[11px] text-ink-dim">
                  {selectedType.worker}
                </span>
              </span>
            </span>
            <ChevronDown
              className={cn("h-4 w-4 shrink-0 text-ink-dim transition-transform", showType && "rotate-180")}
            />
          </button>

          {showType ? (
            <div className="space-y-2 border-t border-line-soft p-3">
              {AGENT_TYPE_LIST.map((type) => {
                const selected = type.id === agentType;
                return (
                  <button
                    key={type.id}
                    type="button"
                    onClick={() => {
                      setAgentType(type.id);
                      setTasks((current) =>
                        current.filter((id) => {
                          const task = TASK_CATALOG.find((item) => item.id === id);
                          return (
                            task?.requiresAgentType === undefined ||
                            task.requiresAgentType === type.id
                          );
                        }),
                      );
                    }}
                    className={cn(
                      "flex w-full items-start gap-3 rounded-lg border p-3 text-left transition-colors",
                      selected
                        ? "border-accent/60 bg-accent/[0.06]"
                        : "border-line hover:border-ink-dim",
                    )}
                  >
                    <span
                      className="mt-1 h-2 w-2 shrink-0 rounded-full"
                      style={{ background: type.accent }}
                    />
                    <span className="min-w-0 flex-1">
                      <span className="flex items-center gap-2">
                        <span className="text-sm text-ink">{type.name}</span>
                        <span className="font-mono text-[11px] text-ink-dim">{type.worker}</span>
                      </span>
                      <span className="mt-1 block text-xs leading-relaxed text-ink-dim">
                        {type.description}
                      </span>
                    </span>
                    {selected ? <Check className="mt-0.5 h-4 w-4 shrink-0 text-accent" /> : null}
                  </button>
                );
              })}
            </div>
          ) : null}
        </div>
      </div>
    </Modal>
  );
}
