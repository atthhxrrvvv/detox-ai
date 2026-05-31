import { AuthPanel } from "@/components/AuthPanel";
import { PageShell } from "@/components/PageShell";

export default function SignupPage() {
  return (
    <PageShell eyebrow="Signup" title="Start using Detox AI" description="Create a free account, then upgrade through manual UPI verification when you need Pro or Premium power.">
      <AuthPanel mode="signup" />
    </PageShell>
  );
}

