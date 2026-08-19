import { Phone } from "lucide-react";

import { PageHeader } from "@/components/dashboard/PageHeader";
import { Button, EmptyState } from "@/components/ui/controls";

export default function PhoneNumbersPage() {
  return (
    <>
      <PageHeader
        title="Phone numbers"
        description="Attach a number to an assistant so it can take real inbound calls."
        action={
          <Button variant="primary" size="sm" disabled>
            Import number
          </Button>
        }
      />

      <div className="min-h-0 flex-1 overflow-y-auto px-8 py-6">
        <div className="mx-auto max-w-3xl">
          <EmptyState
            icon={<Phone className="h-4 w-4" />}
            title="No numbers connected"
            description="Telephony needs a SIP trunk wired into LiveKit and a backend to route inbound calls to the right worker. Until then, test agents in console mode."
          />
        </div>
      </div>
    </>
  );
}
