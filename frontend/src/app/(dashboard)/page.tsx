"use client";

import { ArrowRight, Bot, Clock, PhoneCall, Plus } from "lucide-react";
import Link from "next/link";
import { useState } from "react";

import { CreateAssistantModal } from "@/components/dashboard/CreateAssistantModal";
import { PageHeader } from "@/components/dashboard/PageHeader";
import { Badge, Button } from "@/components/ui/controls";
import { AGENT_TYPES, taskById } from "@/lib/catalog";
import { formatRelative } from "@/lib/format";
import { useStore } from "@/lib/store";

export default function OverviewPage() {
  const { assistants, hydrated, add } = useStore();
  const [creating, setCreating] = useState(false);

  const published = assistants.filter((assistant) => assistant.status === "published").length;

  const stats = [
    { label: "Assistants", value: assistants.length, icon: Bot },
    { label: "Published", value: published, icon: ArrowRight },
    { label: "Calls this week", value: 0, icon: PhoneCall },
    { label: "Avg. handle time", value: "—", icon: Clock },
  ];

  return (
    <>
      <PageHeader
        title="Overview"
        description="Assistants live in this browser for now. Call metrics land once the backend is built."
        action={
          <Button variant="primary" size="sm" onClick={() => setCreating(true)}>
            <Plus className="h-3.5 w-3.5" />
            Create assistant
          </Button>
        }
      />

      <div className="min-h-0 flex-1 overflow-y-auto px-8 py-6">
        <div className="mx-auto max-w-5xl space-y-8">
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
            {stats.map(({ label, value, icon: Icon }) => (
              <div key={label} className="rounded-xl border border-line bg-panel p-4">
                <div className="flex items-center gap-2 text-ink-dim">
                  <Icon className="h-3.5 w-3.5" />
                  <span className="text-xs">{label}</span>
                </div>
                <p className="mt-2 text-2xl font-semibold text-ink">{value}</p>
              </div>
            ))}
          </div>

          <section>
            <div className="mb-3 flex items-center justify-between">
              <h2 className="text-sm font-semibold text-ink">Your assistants</h2>
              <Link
                href="/assistants"
                className="text-xs text-ink-muted transition-colors hover:text-ink"
              >
                View all
              </Link>
            </div>
            <div className="overflow-hidden rounded-xl border border-line bg-panel">
              {hydrated && assistants.length === 0 ? (
                <div className="px-4 py-12 text-center">
                  <p className="text-sm text-ink">No assistants yet</p>
                  <p className="mx-auto mt-1.5 max-w-sm text-xs leading-relaxed text-ink-dim">
                    An assistant is a company, a set of tasks and a voice running on one of the
                    three agent types.
                  </p>
                  <Button
                    variant="primary"
                    size="sm"
                    className="mt-4"
                    onClick={() => setCreating(true)}
                  >
                    <Plus className="h-3.5 w-3.5" />
                    Create assistant
                  </Button>
                </div>
              ) : (
                assistants.map((assistant) => {
                  const type = AGENT_TYPES[assistant.agentType];
                  const tasks = assistant.tasks
                    .map((id) => taskById(id)?.name)
                    .filter(Boolean)
                    .slice(0, 2)
                    .join(", ");

                  return (
                    <Link
                      key={assistant.id}
                      href="/assistants"
                      className="flex items-center gap-3 border-b border-line-soft px-4 py-3 transition-colors last:border-b-0 hover:bg-panel-2"
                    >
                      <span
                        className="h-2 w-2 shrink-0 rounded-full"
                        style={{ background: type.accent }}
                      />
                      <span className="min-w-0 flex-1">
                        <span className="block truncate text-sm text-ink">{assistant.name}</span>
                        <span className="block truncate text-[11px] text-ink-dim">
                          {assistant.companyName || "No company set"}
                          {tasks ? ` · ${tasks}` : ""}
                        </span>
                      </span>
                      <span className="hidden text-[11px] text-ink-dim sm:block">
                        {formatRelative(assistant.updatedAt)}
                      </span>
                      {assistant.status === "published" ? (
                        <Badge tone="accent">published</Badge>
                      ) : (
                        <Badge tone="outline">draft</Badge>
                      )}
                    </Link>
                  );
                })
              )}
            </div>
          </section>
        </div>
      </div>

      <CreateAssistantModal
        open={creating}
        onClose={() => setCreating(false)}
        onCreate={(input) => add(input)}
      />
    </>
  );
}
