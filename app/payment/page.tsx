import { ManualPaymentForm } from "@/components/ManualPaymentForm";
import { PageShell } from "@/components/PageShell";

const allowedPlans = new Set(["lite", "go", "pro", "premium", "ultimate"]);

export default async function PaymentPage({
  searchParams,
}: {
  searchParams?: Promise<{ plan?: string }>;
}) {
  const params = await searchParams;
  const initialPlan = params?.plan && allowedPlans.has(params.plan) ? params.plan : "pro";

  return (
    <PageShell
      eyebrow="Manual UPI Payment"
      title="Upgrade through creator approval"
      description="Scan the QR, pay with any UPI app, upload the transaction screenshot, and send a request for creator review."
    >
      <ManualPaymentForm initialPlan={initialPlan} />
    </PageShell>
  );
}
