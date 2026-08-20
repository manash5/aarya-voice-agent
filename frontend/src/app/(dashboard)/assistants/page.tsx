"use client";

import { Plus, Search } from "lucide-react";
import { useMemo, useState } from "react";

import { PageBody, PageHeader } from "@/components/app/PageHeader";
import { AssistantRow } from "@/components/app/AssistantRow";
import { CreateAssistantModal } from "@/components/app/CreateAssistantModal";
import { Button, EmptyState, RowSkeleton } from "@/components/ui";
import { cn } from "@/lib/cn";
import { useStore } from "@/lib/store";
import { useRouter } from "next/navigation";

export default function AgentsPage() {
  const { assistants, hydrated, add } = useStore();
  const [query, setQuery] = useState("");
  const [status, setStatus] = useState<"all" | "live" | "draft">("all");
  const [sort, setSort] = useState<"updated" | "name">("updated");
  const [creating, setCreating] = useState(false);
  const router = useRouter();

  const filtered = useMemo(() => {
    const needle = query.trim().toLowerCase();
    const searched = !needle
      ? assistants
      : assistants.filter(
          (assistant) =>
            assistant.name.toLowerCase().includes(needle) ||
            assistant.companyName.toLowerCase().includes(needle),
        );

    const scoped = searched.filter((assistant) => {
      if (status === "all") return true;
      return status === "live" ? assistant.status === "published" : assistant.status === "draft";
    });

    return [...scoped].sort((a, b) => {
      if (sort === "name") return a.name.localeCompare(b.name);
      return new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime();
    });
  }, [assistants, query, status, sort]);

  const live = assistants.filter((a) => a.status === "published").length;

  return (
    <>
      <PageHeader
        title="Agents"
        description={
          !hydrated
            ? undefined
            : assistants.length === 0
              ? "Nothing here yet."
              : live === 0
                ? `${assistants.length} agent${assistants.length > 1 ? "s" : ""}, none live yet.`
                : `${assistants.length} agent${assistants.length > 1 ? "s" : ""}, ${live} taking calls.`
        }
        action={
          <Button variant="primary" size="lg" onClick={() => setCreating(true)}>
            <Plus className="h-3.5 w-3.5" strokeWidth={2.25} />
            New agent
          </Button>
        }
      />

      <PageBody>
        <div className="animate-enter">
          {assistants.length > 0 ? (
            <div className="mb-3 flex flex-wrap items-center gap-2">
              <div
                className={cn(
                  "flex min-w-[220px] max-w-xs flex-1 items-center gap-2 rounded-2 border border-line bg-sunken px-2.5",
                  "transition-colors duration-[--fast] focus-within:border-accent-line",
                )}
              >
                <Search className="h-3.5 w-3.5 shrink-0 text-text-3" strokeWidth={1.75} />
                <input
                  value={query}
                  onChange={(event) => setQuery(event.target.value)}
                  placeholder="Search agents"
                  aria-label="Search agents"
                  className="h-8 w-full bg-transparent text-ui text-text outline-none placeholder:text-text-3"
                />
              </div>

              <select
                value={status}
                onChange={(e) => setStatus(e.target.value as typeof status)}
                className="h-8 rounded-2 border border-line bg-raised px-2.5 text-ui text-text outline-none"
                aria-label="Filter by status"
              >
                <option value="all">All statuses</option>
                <option value="live">Live</option>
                <option value="draft">Draft</option>
              </select>

              <select
                value={sort}
                onChange={(e) => setSort(e.target.value as typeof sort)}
                className="h-8 rounded-2 border border-line bg-raised px-2.5 text-ui text-text outline-none"
                aria-label="Sort agents"
              >
                <option value="updated">Recently updated</option>
                <option value="name">Name</option>
              </select>
            </div>
          ) : null}

          <div className="border-t border-line">
            {!hydrated ? (
              <>
                <RowSkeleton />
                <RowSkeleton />
              </>
            ) : assistants.length === 0 ? (
              <EmptyState
                title="No agents yet"
                description="An agent is a company, a set of tasks and a voice, running on one of the three pipelines. Build one and you can talk to it in the browser straight away."
                action={
                  <Button variant="primary" onClick={() => setCreating(true)}>
                    <Plus className="h-3.5 w-3.5" strokeWidth={2.25} />
                    Create your first agent
                  </Button>
                }
              />
            ) : filtered.length === 0 ? (
              <p className="py-12 text-center text-ui text-text-3">
                Nothing matches “{query}”.
              </p>
            ) : (
              <div className="stagger">
                {filtered.map((assistant) => (
                  <AssistantRow
                    key={assistant.id}
                    assistant={assistant}
                    href={`/assistants/${assistant.id}`}
                  />
                ))}
              </div>
            )}
          </div>
        </div>
      </PageBody>

      <CreateAssistantModal
        open={creating}
        onClose={() => setCreating(false)}
        onCreate={(input) => router.push(`/assistants/${add(input).id}`)}
      />
    </>
  );
}
