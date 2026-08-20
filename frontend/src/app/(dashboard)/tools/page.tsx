"use client";

import { Plus } from "lucide-react";
import Link from "next/link";

import { PageBody, PageHeader } from "@/components/app/PageHeader";
import { Button, Property, PropertyList, Status } from "@/components/ui";
import { TOOL_CATALOG } from "@/lib/catalog";
import { useStore } from "@/lib/store";

/**
 * Capabilities, not an integrations page. The question this answers is "what
 * can an agent actually do on a call", so each row leads with the function and
 * ends with whether it will work.
 */
export default function CapabilitiesPage() {
  const { assistants, hydrated } = useStore();

  const groups = TOOL_CATALOG.reduce<Record<string, typeof TOOL_CATALOG>>((acc, tool) => {
    (acc[tool.group] ??= []).push(tool);
    return acc;
  }, {});

  const liveCount = TOOL_CATALOG.filter((t) => t.status === "live").length;

  return (
    <>
      <PageHeader
        title="Capabilities"
        description={`Functions an agent can call mid-conversation. ${liveCount} of ${TOOL_CATALOG.length} are built; the rest are stubs waiting on the backend.`}
        action={
          <Button variant="secondary" size="lg" disabled>
            <Plus className="h-3.5 w-3.5" strokeWidth={2.25} />
            Custom capability
          </Button>
        }
      />

      <PageBody>
        <div className="animate-enter space-y-10">
          {Object.entries(groups).map(([group, tools]) => (
            <section key={group}>
              <h2 className="text-heading font-medium text-text">{group}</h2>
              <ul className="mt-3 divide-y divide-line border-t border-line">
                {tools.map((tool) => {
                  const users = assistants.filter((a) => a.tools.includes(tool.id));
                  return (
                    <li key={tool.id} className="py-4">
                      <div className="flex flex-wrap items-start justify-between gap-x-6 gap-y-2">
                        <div className="min-w-0 flex-1">
                          <div className="flex items-center gap-3">
                            <span className="font-mono text-ui text-text">{tool.name}</span>
                            {tool.status === "live" ? (
                              <Status tone="live">Ready</Status>
                            ) : (
                              <Status tone="warn">Not built</Status>
                            )}
                          </div>
                          <p className="mt-1.5 max-w-prose text-meta text-text-3">
                            {tool.description}
                          </p>
                        </div>

                        <div className="w-full max-w-[15rem] shrink-0">
                          <PropertyList>
                            <Property label="Used by">
                              {!hydrated
                                ? "—"
                                : users.length === 0
                                  ? "No agents"
                                  : users.length === 1
                                    ? users[0].name
                                    : `${users.length} agents`}
                            </Property>
                          </PropertyList>
                        </div>
                      </div>
                    </li>
                  );
                })}
              </ul>
            </section>
          ))}

          <p className="border-t border-line pt-6 text-meta text-text-3">
            Attach capabilities to an agent from its{" "}
            <Link
              href="/assistants"
              className="rounded-1 text-text-2 underline decoration-line-strong underline-offset-2 transition-colors hover:text-text"
            >
              Actions section
            </Link>
            . Picking a task attaches whatever it needs automatically.
          </p>
        </div>
      </PageBody>
    </>
  );
}
