import { CreatorDashboard } from "@/components/CreatorDashboard";
import { PageShell } from "@/components/PageShell";

export default function CreatorRevenuePage() {
  return (
    <PageShell eyebrow="Creator" title="Revenue dashboard" description="Track total revenue, today revenue, monthly revenue, Pro/Premium revenue, and rejected payments in rupees.">
      <CreatorDashboard title="Revenue" />
    </PageShell>
  );
}

