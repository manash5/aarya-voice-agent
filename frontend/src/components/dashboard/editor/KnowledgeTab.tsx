"use client";

import { FileText, Trash2, UploadCloud } from "lucide-react";
import { useRef, useState } from "react";

import { Badge, Field, Input, Panel, Textarea } from "@/components/ui/controls";
import { cn } from "@/lib/cn";
import { formatBytes } from "@/lib/format";
import type { Assistant, KnowledgeFile } from "@/lib/types";

const ACCEPT = ".pdf,.txt,.md,.docx,.csv";

export function KnowledgeTab({
  assistant,
  onChange,
}: {
  assistant: Assistant;
  onChange: (patch: Partial<Assistant>) => void;
}) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [dragging, setDragging] = useState(false);

  function addFiles(list: FileList | null) {
    if (!list?.length) return;
    const added: KnowledgeFile[] = Array.from(list).map((file) => ({
      id: `${file.name}-${file.size}-${Math.random().toString(36).slice(2, 7)}`,
      name: file.name,
      size: file.size,
      addedAt: new Date().toISOString(),
    }));
    onChange({ files: [...assistant.files, ...added] });
  }

  return (
    <div className="space-y-5">
      <Panel
        title="Company"
        description="Injected into every turn as the 'what you know' half of the prompt. Keep it tight - a long profile makes long answers."
      >
        <div className="space-y-4">
          <Field label="Company name">
            <Input
              value={assistant.companyName}
              onChange={(event) => onChange({ companyName: event.target.value })}
              placeholder="e.g. Scalina Media"
            />
          </Field>
          <Field label="Company profile">
            <Textarea
              rows={14}
              value={assistant.companyProfile}
              onChange={(event) => onChange({ companyProfile: event.target.value })}
              className="font-mono text-xs"
              placeholder="Who they are, services, hours, policies, common questions…"
            />
          </Field>
        </div>
      </Panel>

      <Panel
        title="Documents"
        description="Drop PDFs, brochures or FAQs the assistant should be able to answer from."
        action={
          assistant.agentType !== "rag" ? (
            <Badge tone="warn">retrieval needs the knowledge base agent</Badge>
          ) : (
            <Badge tone="accent">search_knowledge_base</Badge>
          )
        }
      >
        <div
          onDragOver={(event) => {
            event.preventDefault();
            setDragging(true);
          }}
          onDragLeave={() => setDragging(false)}
          onDrop={(event) => {
            event.preventDefault();
            setDragging(false);
            addFiles(event.dataTransfer.files);
          }}
          onClick={() => inputRef.current?.click()}
          className={cn(
            "flex cursor-pointer flex-col items-center justify-center rounded-xl border border-dashed px-6 py-10 text-center transition-colors",
            dragging ? "border-accent bg-accent/[0.06]" : "border-line hover:border-ink-dim",
          )}
        >
          <UploadCloud className="mb-2 h-5 w-5 text-ink-dim" />
          <p className="text-sm text-ink">Drop files here or click to browse</p>
          <p className="mt-1 text-[11px] text-ink-dim">PDF, DOCX, TXT, MD or CSV · up to 20 MB each</p>
          <input
            ref={inputRef}
            type="file"
            multiple
            accept={ACCEPT}
            className="hidden"
            onChange={(event) => {
              addFiles(event.target.files);
              event.target.value = "";
            }}
          />
        </div>

        {assistant.files.length > 0 ? (
          <ul className="mt-4 space-y-2">
            {assistant.files.map((file) => (
              <li
                key={file.id}
                className="flex items-center gap-3 rounded-lg border border-line bg-panel-2 px-3 py-2.5"
              >
                <FileText className="h-4 w-4 shrink-0 text-ink-dim" />
                <span className="min-w-0 flex-1">
                  <span className="block truncate text-sm text-ink">{file.name}</span>
                  <span className="block text-[11px] text-ink-dim">
                    {formatBytes(file.size)} · added {new Date(file.addedAt).toLocaleDateString()}
                  </span>
                </span>
                <Badge tone="outline">not indexed</Badge>
                <button
                  type="button"
                  aria-label={`Remove ${file.name}`}
                  onClick={() =>
                    onChange({ files: assistant.files.filter((item) => item.id !== file.id) })
                  }
                  className="rounded-md p-1 text-ink-dim transition-colors hover:bg-elevated hover:text-danger"
                >
                  <Trash2 className="h-3.5 w-3.5" />
                </button>
              </li>
            ))}
          </ul>
        ) : null}

        <p className="mt-3 text-[11px] leading-relaxed text-ink-dim">
          Files stay in this browser for now - nothing is uploaded, chunked or embedded until the
          backend exists.
        </p>
      </Panel>
    </div>
  );
}
