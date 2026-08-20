"use client";

import Link from "next/link";

import { PageBody, PageHeader } from "@/components/app/PageHeader";
import { Button, Property, PropertyList, Status } from "@/components/ui";
import { useStore } from "@/lib/store";

export default function PhoneNumbersPage() {
  const { assistants, hydrated } = useStore();
  const attached = assistants.filter((a) => a.phoneNumber.trim());

  return (
    <>
      <PageHeader
        title="Phone numbers"
        description="A number is what turns an agent from something you test into something that answers."
        action={
          <Button variant="secondary" size="lg" disabled>
            Import a number
          </Button>
        }
      />

      <PageBody>
        <div className="animate-enter space-y-10">
          <section>
            <h2 className="text-heading font-medium text-text">Routing</h2>
            {!hydrated ? null : attached.length === 0 ? (
              <div className="mt-3 border-t border-line py-12 text-center">
                <h3 className="display text-title text-text">No numbers connected</h3>
                <p className="mx-auto mt-2 max-w-md text-ui text-text-3">
                  Inbound calling needs a SIP trunk wired into LiveKit and a backend to route each
                  call to the right worker. Until that exists, you can still label a number on an
                  agent and talk to it from the browser.
                </p>
                <Link href="/assistants" className="mt-6 inline-block">
                  <Button variant="primary">Test an agent instead</Button>
                </Link>
              </div>
            ) : (
              <ul className="mt-3 divide-y divide-line border-t border-line">
                {attached.map((assistant) => (
                  <li key={assistant.id} className="flex flex-wrap items-baseline justify-between gap-x-6 gap-y-2 py-3.5">
                    <span className="font-mono text-ui text-text">{assistant.phoneNumber}</span>
                    <div className="flex items-center gap-6">
                      <Link
                        href={`/assistants/${assistant.id}`}
                        className="rounded-1 text-meta text-text-2 underline decoration-line-strong underline-offset-2 transition-colors hover:text-text"
                      >
                        {assistant.name}
                      </Link>
                      <Status tone={assistant.status === "published" ? "live" : "muted"}>
                        {assistant.status === "published" ? "Live" : "Draft"}
                      </Status>
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </section>

          <section className="border-t border-line pt-8">
            <h2 className="text-heading font-medium text-text">What telephony needs</h2>
            <PropertyList className="mt-3 border-y border-line">
              <Property label="SIP trunk">Not configured</Property>
              <Property label="Inbound routing">Needs backend</Property>
              <Property label="Outbound calling">Needs backend</Property>
              <Property label="Browser test calls">Available now</Property>
            </PropertyList>
          </section>
        </div>
      </PageBody>
    </>
  );
}
