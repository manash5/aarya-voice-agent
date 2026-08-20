"use client";

import { FileText, Trash2, UploadCloud } from "lucide-react";
import { useRef, useState } from "react";

import { Field, IconButton, Input, Status, Textarea } from "@/components/ui";
import { cn } from "@/lib/cn";
import { formatBytes, formatRelative } from "@/lib/format";
import type { Assistant, KnowledgeFile } from "@/lib/types";

const ACCEPT = ".pdf,.txt,.md,.docx,.csv";

/** Everything the agent is allowed to claim it knows. */
export function KnowledgeSection({
  assistant,
  onChange,
}: {
  assistant: Assistant;
  onChange: (patch: Partial<Assistant>) => void;
}) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [dragging, setDragging] = useState(false);
  const canRetrieve = assistant.agentType === "rag";

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
    <div className="space-y-10">
      <div className="grid gap-6">
        <Field label="Company" description="Who the agent answers for.">
          <Input
            value={assistant.companyName}
            onChange={(event) => onChange({ companyName: event.target.value })}
            placeholder="Scalina Media"
            className="max-w-md"
          />
        </Field>

        <Field
          label="What the agent knows"
          description="Injected into every turn. Keep it tight — a long profile makes long answers."
        >
          <Textarea
            rows={14}
            value={assistant.companyProfile}
            onChange={(event) => onChange({ companyProfile: event.target.value })}
            placeholder="Services, hours, policies, pricing rules, where to send quotes…"
          />
        </Field>
      </div>

      <div className="border-t border-line pt-8">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <h3 className="text-ui font-medium text-text">Sources</h3>
            <p className="mt-1 max-w-prose text-meta text-text-3">
              Documents the agent can look things up in during a call.
            </p>
          </div>
          {canRetrieve ? (
            <Status tone="live">Retrieval on</Status>
          ) : (
            <Status tone="warn">Pipeline can&apos;t retrieve</Status>
          )}
        </div>

        {assistant.files.length > 0 ? (
          <ul className="mt-5 divide-y divide-line border-y border-line">
            {assistant.files.map((file) => (
              <li key={file.id} className="group flex items-center gap-4 py-3">
                <FileText className="h-4 w-4 shrink-0 text-text-3" strokeWidth={1.5} />
                <span className="min-w-0 flex-1">
                  <span className="block truncate text-ui text-text">{file.name}</span>
                  <span className="mt-0.5 block text-meta text-text-3">
                    {formatBytes(file.size)} · added {formatRelative(file.addedAt)}
                  </span>
                </span>
                <span className="hidden shrink-0 sm:block">
                  <Status tone="muted">Not indexed</Status>
                </span>
                <IconButton
                  label={`Remove ${file.name}`}
                  size="sm"
                  variant="danger"
                  className="opacity-0 transition-opacity focus-visible:opacity-100 group-hover:opacity-100"
                  onClick={() =>
                    onChange({ files: assistant.files.filter((item) => item.id !== file.id) })
                  }
                >
                  <Trash2 className="h-3.5 w-3.5" strokeWidth={1.75} />
                </IconButton>
              </li>
            ))}
          </ul>
        ) : null}

        <button
          type="button"
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
            "mt-5 flex w-full items-center justify-center gap-3 rounded-3 border border-dashed px-6 py-6 text-center",
            "transition-colors duration-[--fast] ease-[--ease]",
            dragging
              ? "border-accent-line bg-accent-subtle"
              : "border-line-strong hover:border-text-3 hover:bg-raised-hover",
          )}
        >
          <UploadCloud className="h-4 w-4 shrink-0 text-text-3" strokeWidth={1.5} />
          <span className="text-ui text-text-2">
            Drop a file, or <span className="text-text">browse</span>
          </span>
          <span className="text-meta text-text-3">PDF, DOCX, TXT, MD, CSV</span>
        </button>
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

        <p className="mt-3 text-meta text-text-3">
          Files stay in this browser — nothing is uploaded, chunked or embedded until the backend
          exists.
        </p>
      </div>
    </div>
  );
}
