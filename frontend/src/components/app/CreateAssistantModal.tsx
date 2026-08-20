"use client";

import { Check, ChevronDown } from "lucide-react";
import { useState } from "react";

import { Button, Field, Input, Modal, SelectCard, Textarea } from "@/components/ui";
import { AGENT_TYPE_LIST, TASK_CATALOG } from "@/lib/catalog";
import { cn } from "@/lib/cn";
import type { NewAssistantInput } from "@/lib/store";
import type { AgentTypeId } from "@/lib/types";

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
      description="Name it, say who it works for and what it's allowed to do. Everything here stays editable."
      className="max-w-xl"
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
      <div className="max-h-[58vh] space-y-6 overflow-y-auto pr-1">
        <div className="grid gap-5 sm:grid-cols-2">
          <Field label="Assistant name">
            <Input
              autoFocus
              value={name}
              onChange={(event) => setName(event.target.value)}
              placeholder="Ozi Hygiene · Reception"
            />
          </Field>
          <Field label="Company">
            <Input
              value={companyName}
              onChange={(event) => setCompanyName(event.target.value)}
              placeholder="Ozi Hygiene"
            />
          </Field>
        </div>

        <Field
          label="Company context"
          description="Services, hours, policies, where to send quotes. This is what the assistant answers from."
        >
          <Textarea
            rows={5}
            value={companyProfile}
            onChange={(event) => setCompanyProfile(event.target.value)}
            placeholder="Who they are, what they sell, opening hours, anything a receptionist would be briefed on…"
          />
        </Field>

        <div>
          <p className="text-ui font-medium text-text">Tasks</p>
          <p className="mt-1 text-meta text-text-3">What it&apos;s allowed to do on a call.</p>
          <div className="mt-3 flex flex-wrap gap-2">
            {available.map((task) => {
              const selected = tasks.includes(task.id);
              return (
                <button
                  key={task.id}
                  type="button"
                  aria-pressed={selected}
                  title={task.description}
                  onClick={() =>
                    setTasks((current) =>
                      selected ? current.filter((id) => id !== task.id) : [...current, task.id],
                    )
                  }
                  className={cn(
                    "rounded-full border px-3 py-1 text-meta",
                    "transition-colors duration-[--fast] ease-[--ease]",
                    selected
                      ? "border-accent-line bg-accent-subtle text-accent"
                      : "border-line text-text-2 hover:border-line-strong hover:text-text",
                  )}
                >
                  {task.name}
                </button>
              );
            })}
          </div>
        </div>

        <div className="rounded-3 border border-line">
          <button
            type="button"
            aria-expanded={showType}
            onClick={() => setShowType((value) => !value)}
            className="flex w-full items-center justify-between gap-3 px-3.5 py-3 text-left"
          >
            <span className="min-w-0">
              <span className="eyebrow block">Pipeline</span>
              <span className="mt-1 flex items-center gap-2">
                <span
                  className="h-1.5 w-1.5 shrink-0 rounded-full"
                  style={{ background: selectedType.accent }}
                />
                <span className="truncate text-ui font-medium text-text">{selectedType.name}</span>
                <span className="truncate font-mono text-micro text-text-3">
                  {selectedType.worker}
                </span>
              </span>
            </span>
            <ChevronDown
              className={cn(
                "h-3.5 w-3.5 shrink-0 text-text-3 transition-transform duration-[--base]",
                showType && "rotate-180",
              )}
              strokeWidth={1.75}
            />
          </button>

          {showType ? (
            <div className="space-y-2 border-t border-line p-3">
              {AGENT_TYPE_LIST.map((type) => {
                const selected = type.id === agentType;
                return (
                  <SelectCard
                    key={type.id}
                    selected={selected}
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
                  >
                    <span className="flex w-full items-start justify-between gap-3">
                      <span className="min-w-0">
                        <span className="flex items-center gap-2">
                          <span
                            className="h-1.5 w-1.5 shrink-0 rounded-full"
                            style={{ background: type.accent }}
                          />
                          <span className="text-ui font-medium text-text">{type.name}</span>
                        </span>
                        <span className="mt-1.5 block text-meta text-text-3">
                          {type.description}
                        </span>
                      </span>
                      {selected ? (
                        <Check className="mt-0.5 h-3.5 w-3.5 shrink-0 text-accent" strokeWidth={2.25} />
                      ) : null}
                    </span>
                  </SelectCard>
                );
              })}
            </div>
          ) : null}
        </div>
      </div>
    </Modal>
  );
}
