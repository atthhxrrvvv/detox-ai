import { PageShell } from "@/components/PageShell";
import { ProfileSettings } from "@/components/ProfileSettings";

export default function ProfilePage() {
  return (
    <PageShell eyebrow="Profile" title="Profile Settings" description="Customize your Detox AI identity and preferences.">
      <ProfileSettings />
    </PageShell>
  );
}
