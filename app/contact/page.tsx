import { PageShell } from "@/components/PageShell";
import { CREATOR_EMAIL } from "@/lib/constants";

export default function ContactPage() {
  return <PageShell eyebrow="Contact" title="Contact Detox AI" description={`For support, payments, and creator inquiries, contact ${CREATOR_EMAIL}.`} />;
}

