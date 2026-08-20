"use client";

import Link from "next/link";

import { PageBody, PageHeader } from "@/components/app/PageHeader";
import { Button, EmptyState, Property, PropertyList, Status } from "@/components/ui";
import { formatBytes, formatRelative } from "@/lib/format";
import { useStore } from "@/lib/store";

/**
 * A library of sources, read per agent. Every row answers what it is, how big,
 * how fresh, and whether the agent can actually reach it during a call.
 */
export default function KnowledgePage() {
  const { assistants, hydrated } = useStore();
  const withSources = assistants.filter(
    (assistant) => assistant.files.length > 0 || assistant.companyProfile.trim().length > 0,
  );

  const totalFiles = assistants.reduce((sum, a) => sum + a.files.length, 0);

  return (
    <>
      <PageHeader
        title="Knowledge"
        description={
          !hydrated
            ? undefined
            : totalFiles === 0
              ? "Every agent answers from a written profile. Documents come next, once retrieval is wired up."
              : `${totalFiles} document${totalFiles > 1 ? "s" : ""} across ${withSources.length} agent${withSources.length > 1 ? "s" : ""}.`
        }
      />

      <PageBody>
        <div className="animate-enter space-y-10">
          {!hydrated ? null : withSources.length === 0 ? (
            <div className="border-t border-line">
              <EmptyState
                title="Nothing written down yet"
                description="An agent can only answer from what it's been told. Open an agent, fill in what it knows about the company, then attach documents it should be able to look things up in."
                action={
                  <Link href="/assistants">
                    <Button variant="primary">Go to agents</Button>
                  </Link>
                }
              />
            </div>
          ) : (
            withSources.map((assistant) => {
              const canRetrieve = assistant.agentType === "rag";
              return (
                <section key={assistant.id}>
                  <div className="flex flex-wrap items-baseline justify-between gap-3">
                    <Link
                      href={`/assistants/${assistant.id}`}
                      className="rounded-1 text-heading font-medium text-text transition-colors hover:text-text-2"
                    >
                      {assistant.name}
                    </Link>
                    {canRetrieve ? (
                      <Status tone="live">Retrieval on</Status>
                    ) : (
                      <Status tone="muted">Profile only</Status>
                    )}
                  </div>

                  <ul className="mt-3 divide-y divide-line border-t border-line">
                    {assistant.companyProfile.trim() ? (
                      <li className="py-3.5">
                        <div className="flex flex-wrap items-baseline justify-between gap-x-6 gap-y-1">
                          <span className="text-ui text-text">Company profile</span>
                          <PropertyList className="w-full max-w-[18rem] divide-y-0">
                            <Property label="Length">
                              {assistant.companyProfile.trim().split(/\s+/).length} words
                            </Property>
                          </PropertyList>
                        </div>
                        <p className="mt-1 max-w-prose truncate text-meta text-text-3">
                          {assistant.companyProfile.trim().split("\n")[0]}
                        </p>
                      </li>
                    ) : null}

                    {assistant.files.map((file) => (
                      <li key={file.id} className="py-3.5">
                        <div className="flex flex-wrap items-baseline justify-between gap-x-6 gap-y-1">
                          <span className="min-w-0 flex-1 truncate text-ui text-text">
                            {file.name}
                          </span>
                          <div className="flex shrink-0 items-center gap-6">
                            <span className="tnum text-meta text-text-3">
                              {formatBytes(file.size)}
                            </span>
                            <span className="text-meta text-text-3">
                              added {formatRelative(file.addedAt)}
                            </span>
                            <Status tone="muted">Not indexed</Status>
                          </div>
                        </div>
                      </li>
                    ))}
                  </ul>
                </section>
              );
            })
          )}

          <p className="border-t border-line pt-6 text-meta text-text-3">
            Documents stay in this browser. Chunking, embedding and retrieval land with the backend
            — until then only the written profile reaches the agent.
          </p>
        </div>
      </PageBody>
    </>
  );
}
