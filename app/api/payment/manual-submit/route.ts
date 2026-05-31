import { CREATOR_UPI_ID, PLAN_PRICES } from "@/lib/constants";
import { jsonError } from "@/lib/api";

const paidPlans = ["lite", "go", "pro", "premium", "ultimate"] as const;

export async function POST(request: Request) {
  const body = await request.json().catch(() => ({}));
  const plan = String(body.plan ?? "");
  const transactionId = String(body.transactionId ?? "").trim();

  if (!paidPlans.includes(plan as (typeof paidPlans)[number])) {
    return jsonError("Plan must be lite, go, pro, premium, or ultimate.");
  }

  if (!transactionId) {
    return jsonError("Transaction ID is required.");
  }

  return Response.json({
    paymentId: crypto.randomUUID(),
    plan,
    amount: PLAN_PRICES[plan as keyof typeof PLAN_PRICES],
    currency: "INR",
    paymentMethod: "manual_upi",
    upiId: CREATOR_UPI_ID,
    transactionId,
    status: "pending",
    message: "Payment submitted. Creator approval is required before plan activation.",
  });
}
