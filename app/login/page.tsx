import { AuthPanel } from "@/components/AuthPanel";
import { PageShell } from "@/components/PageShell";

export default function LoginPage() {
  return (
    <PageShell eyebrow="Login" title="Access your Detox AI workspace" description="Continue with Google or sign in with email and password before opening chat.">
      <AuthPanel mode="login" />
    </PageShell>
  );
}
