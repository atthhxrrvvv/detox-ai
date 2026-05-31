import { CreatorDashboard } from "@/components/CreatorDashboard";
import { PageShell } from "@/components/PageShell";

export default function CreatorPage() {
  return (
    <PageShell eyebrow="Creator Dashboard" title="Detox AI creator control center" description="Only cosmiceternal9481@gmail.com should access this area in production. All sensitive creator actions must be logged.">
      <CreatorDashboard />
    </PageShell>
  );
}

