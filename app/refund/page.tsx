import { PageShell } from "@/components/PageShell";
import { CREATOR_EMAIL } from "@/lib/constants";

const refundItems = [
  {
    title: "Manual Review First",
    body: "Manual UPI payments are checked before any subscription is activated. Pending requests do not unlock paid models until approved.",
  },
  {
    title: "Rejected Requests",
    body: "If a transaction ID or screenshot is invalid, unclear, duplicated, or unpaid, the request may be rejected and the paid plan will not activate.",
  },
  {
    title: "Refund Requests",
    body: "Refunds are reviewed case by case. Share your account email, plan, transaction ID, payment screenshot, and reason for the refund request.",
  },
  {
    title: "Processing Time",
    body: "Manual review and refund handling may take time because payment records and account status must be verified.",
  },
  {
    title: "No Sensitive Banking Data",
    body: "Never send UPI PINs, OTPs, bank passwords, card PINs, or full card details for any refund or payment issue.",
  },
  {
    title: "Support",
    body: `For payment review, refund questions, or failed activation, contact ${CREATOR_EMAIL}.`,
  },
];

export default function RefundPage() {
  return (
    <PageShell
      eyebrow="Refund"
      title="Refund policy"
      description="Manual UPI payment requests, rejected verifications, refunds, and subscription activation are handled through payment review."
    >
      <div className="grid gap-4 md:grid-cols-2">
        {refundItems.map((item) => (
          <section key={item.title} className="glass rounded-2xl p-5">
            <h2 className="text-lg font-semibold text-white">{item.title}</h2>
            <p className="mt-3 text-sm leading-6 text-slate-300">{item.body}</p>
          </section>
        ))}
      </div>
    </PageShell>
  );
}
