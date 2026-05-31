import { PageShell } from "@/components/PageShell";
import { ProfileSettings } from "@/components/ProfileSettings";

export default function ProfilePage() {
  return (
    <PageShell eyebrow="Profile" title="Edit your Detox AI profile" description="Update your name, photo, personal context, preferred tone, and workspace defaults.">
      <ProfileSettings />
    </PageShell>
  );
}

