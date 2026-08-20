"use client";

import { Plus } from "lucide-react";

import { PageBody, PageHeader } from "@/components/app/PageHeader";
import { Button, Status } from "@/components/ui";

const MEMBERS = [
  { name: "S. Magar", email: "ops@scalinamedia.com", role: "Owner", status: "Active" },
  { name: "D. Karki", email: "sales@scalinamedia.com", role: "Operator", status: "Invited" },
];

export default function TeamPage() {
  return (
    <>
      <PageHeader
        title="Team"
        description="Who can build agents, run tests and operate live voice workflows."
        action={
          <Button variant="primary" size="lg" disabled>
            <Plus className="h-3.5 w-3.5" strokeWidth={2.25} />
            Invite member
          </Button>
        }
      />

      <PageBody>
        <div className="animate-enter">
          <div className="overflow-x-auto rounded-3 border border-line bg-raised">
            <table className="w-full min-w-[640px] text-left">
              <thead className="border-b border-line">
                <tr>
                  {["Member", "Role", "Status"].map((head) => (
                    <th key={head} className="px-4 py-3.5" scope="col">
                      <span className="eyebrow font-medium text-text-3">{head}</span>
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {MEMBERS.map((m) => (
                  <tr key={m.email} className="border-b border-line last:border-b-0">
                    <td className="px-4 py-4">
                      <p className="text-ui text-text">{m.name}</p>
                      <p className="mt-1 text-meta text-text-3">{m.email}</p>
                    </td>
                    <td className="px-4 py-4 text-ui text-text-2">{m.role}</td>
                    <td className="px-4 py-4">
                      <Status tone={m.status === "Active" ? "live" : "muted"}>{m.status}</Status>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </PageBody>
    </>
  );
}

