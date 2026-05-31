import { PageShell } from "@/components/PageShell";
import { ProfileSettings } from "@/components/ProfileSettings";

export default function SettingsPage() {
  return (
    <PageShell eyebrow="Settings" title="Profile and personal settings" description="Edit your name, photo, default model, tone, and personal context so Detox AI feels more like your own workspace.">
      <ProfileSettings />
    </PageShell>
  );
}
