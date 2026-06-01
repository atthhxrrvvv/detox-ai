import { PageShell } from "@/components/PageShell";
import { ProfileSettings } from "@/components/ProfileSettings";

export default function SettingsPage() {
  return (
    <PageShell eyebrow="Settings" title="Profile Settings" description="Personalize how Detox AI works for you.">
      <ProfileSettings />
    </PageShell>
  );
}
