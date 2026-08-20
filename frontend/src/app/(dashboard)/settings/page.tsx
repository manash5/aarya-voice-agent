"use client";

import { useState } from "react";

import { PageBody, PageHeader } from "@/components/app/PageHeader";
import { Button, Field, Input, Select, Status, Toggle } from "@/components/ui";

const SECTIONS = [
  "General",
  "Account",
  "Team",
  "Billing",
  "Voice",
  "Notifications",
  "Security",
  "API",
  "Integrations",
] as const;

type Section = (typeof SECTIONS)[number];

export default function SettingsPage() {
  const [section, setSection] = useState<Section>("General");

  return (
    <>
      <PageHeader
        title="Settings"
        description="Workspace-level controls for how agents are managed and operated."
      />

      <PageBody>
        <div className="animate-enter grid gap-10 lg:grid-cols-[220px_1fr]">
          <aside>
            <p className="eyebrow mb-2">Sections</p>
            <nav className="space-y-0.5">
              {SECTIONS.map((s) => {
                const active = s === section;
                return (
                  <button
                    key={s}
                    type="button"
                    onClick={() => setSection(s)}
                    className={`w-full rounded-2 px-2 py-1.5 text-left text-ui transition-colors ${
                      active
                        ? "bg-accent-subtle font-medium text-text"
                        : "text-text-3 hover:bg-raised-hover hover:text-text"
                    }`}
                  >
                    {s}
                  </button>
                );
              })}
            </nav>
          </aside>

          <section className="min-w-0">
            <div className="border-t border-line pt-1">
              <h2 className="display text-title text-text">{section}</h2>
            </div>

            {section === "General" ? (
              <div className="mt-6 space-y-8">
                <Field label="Workspace name">
                  <Input value="Scalina Media" readOnly />
                </Field>
                <Field label="Default timezone">
                  <Select
                    value="Asia/Kathmandu"
                    onChange={() => {}}
                    options={[
                      { value: "Asia/Kathmandu", label: "Asia/Kathmandu" },
                      { value: "Australia/Sydney", label: "Australia/Sydney" },
                      { value: "UTC", label: "UTC" },
                    ]}
                  />
                </Field>
                <div className="divide-y divide-line border-y border-line">
                  <Toggle
                    label="Use light theme by default"
                    description="New sessions open in the light-first voice operations theme."
                    checked
                    onChange={() => {}}
                  />
                </div>
              </div>
            ) : (
              <div className="mt-8 rounded-3 border border-line bg-raised px-6 py-8">
                <Status tone="muted">Coming next</Status>
                <p className="mt-3 text-ui text-text-2">
                  This section is reserved in the IA and will be connected when backend settings
                  endpoints are available.
                </p>
                <div className="mt-5">
                  <Button variant="secondary" disabled>
                    Configure {section}
                  </Button>
                </div>
              </div>
            )}
          </section>
        </div>
      </PageBody>
    </>
  );
}

