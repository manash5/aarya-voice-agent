"use client";

import { BookOpen, FileText } from "lucide-react";
import Link from "next/link";

import { PageHeader } from "@/components/dashboard/PageHeader";
import { Badge, EmptyState } from "@/components/ui/controls";
import { formatBytes } from "@/lib/format";
import { useStore } from "@/lib/store";

export default function KnowledgeBasePage() {
  const { assistants } = useStore();
  const withFiles = assistants.filter((assistant) => assistant.files.length > 0);

  return (
    <>
      <PageHeader
        title="Knowledge base"
        description="Documents attached to each assistant. Upload them from an assistant's Knowledge base tab."
      />

      <div className="min-h-0 flex-1 overflow-y-auto px-8 py-6">
        <div className="mx-auto max-w-4xl space-y-4">
          {withFiles.length === 0 ? (
            <EmptyState
              icon={<BookOpen className="h-4 w-4" />}
              title="No documents yet"
              description="Open an assistant, go to its Knowledge base tab and drop in a PDF or FAQ. Indexing arrives with the backend."
              action={
                <Link
                  href="/assistants"
                  className="text-xs text-accent transition-colors hover:text-accent-hover"
                >
                  Go to assistants
                </Link>
              }
            />
          ) : (
            withFiles.map((assistant) => (
              <section
                key={assistant.id}
                className="overflow-hidden rounded-xl border border-line bg-panel"
              >
                <header className="flex items-center justify-between border-b border-line-soft px-4 py-3">
                  <h2 className="text-sm font-medium text-ink">{assistant.name}</h2>
                  <span className="text-[11px] text-ink-dim">
                    {assistant.files.length} file{assistant.files.length > 1 ? "s" : ""}
                  </span>
                </header>
                <ul>
                  {assistant.files.map((file) => (
                    <li
                      key={file.id}
                      className="flex items-center gap-3 border-b border-line-soft px-4 py-2.5 last:border-b-0"
                    >
                      <FileText className="h-4 w-4 shrink-0 text-ink-dim" />
                      <span className="min-w-0 flex-1 truncate text-sm text-ink">{file.name}</span>
                      <span className="text-[11px] text-ink-dim">{formatBytes(file.size)}</span>
                      <Badge tone="outline">not indexed</Badge>
                    </li>
                  ))}
                </ul>
              </section>
            ))
          )}
        </div>
      </div>
    </>
  );
}
