import { CreatorDashboard } from "@/components/CreatorDashboard";
import { PageShell } from "@/components/PageShell";

export default function CreatorPaymentsPage() {
  return (
    <PageShell eyebrow="Creator" title="Payment approvals" description="Review transaction IDs and screenshots, approve valid payments, reject invalid requests, and activate plans.">
      <CreatorDashboard title="Payments" />
    </PageShell>
  );
}

