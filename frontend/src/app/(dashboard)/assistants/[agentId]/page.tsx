"use client";

import Link from "next/link";
import { useParams, useRouter } from "next/navigation";

import { AgentStudio } from "@/components/app/AgentStudio";
import { Button, EmptyState, Skeleton, useToast } from "@/components/ui";
import { useStore } from "@/lib/store";

export default function AgentStudioPage() {
  const params = useParams<{ agentId: string }>();
  const router = useRouter();
  const toast = useToast();
  const { assistants, hydrated, update, duplicate, remove } = useStore();

  const assistant = assistants.find((item) => item.id === params?.agentId);

  if (!hydrated) {
    return (
      <div className="px-6 py-8 lg:px-10">
        <div className="mx-auto max-w-[1400px] space-y-4">
          <Skeleton className="h-3 w-24" />
          <Skeleton className="h-8 w-72" />
          <Skeleton className="h-3 w-96" />
        </div>
      </div>
    );
  }

  if (!assistant) {
    return (
      <div className="flex flex-1 items-center justify-center p-10">
        <EmptyState
          title="Agent not found"
          description="It may have been deleted, or the link points at an id that never existed in this browser."
          action={
            <Link href="/assistants">
              <Button variant="primary">Back to agents</Button>
            </Link>
          }
        />
      </div>
    );
  }

  return (
    <AgentStudio
      key={assistant.id}
      assistant={assistant}
      onChange={(patch) => update(assistant.id, patch)}
      onDuplicate={() => {
        const copy = duplicate(assistant.id);
        if (copy) {
          toast(`Duplicated as “${copy.name}”`);
          router.push(`/assistants/${copy.id}`);
        }
      }}
      onDelete={() => {
        const name = assistant.name;
        remove(assistant.id);
        toast(`Deleted “${name}”`);
        router.push("/assistants");
      }}
    />
  );
}
