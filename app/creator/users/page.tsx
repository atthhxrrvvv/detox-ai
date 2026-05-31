import { CreatorDashboard } from "@/components/CreatorDashboard";
import { PageShell } from "@/components/PageShell";

export default function CreatorUsersPage() {
  return (
    <PageShell eyebrow="Creator" title="User management" description="Search users, change plans, reset usage, ban/unban accounts, and inspect support/moderation context with audit logs.">
      <CreatorDashboard title="Users" />
    </PageShell>
  );
}

