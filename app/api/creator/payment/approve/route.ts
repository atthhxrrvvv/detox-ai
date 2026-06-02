import { randomUUID } from "crypto";
import { CREATOR_EMAIL } from "@/lib/constants";
import { requireCreatorApi } from "@/lib/creatorSecurity";
import { firestoreError, getFirestoreDocument, patchFirestoreDocument } from "@/lib/firestoreRest";

export async function POST(request: Request) {
  const creator = await requireCreatorApi(request);
  if (!creator.ok) return creator.response;

  try {
    const body = await request.json().catch(() => ({}));
    const paymentId = String(body.paymentId ?? "");
    if (!paymentId) return Response.json({ error: "paymentId is required." }, { status: 400 });

    const payment = await getFirestoreDocument("payments", paymentId, creator.idToken);
    const userId = String(payment.userId ?? "");
    const plan = String(payment.plan ?? "");
    if (!userId || !["lite", "go", "pro", "premium", "ultimate"].includes(plan)) {
      return Response.json({ error: "Payment record is missing a valid user or plan." }, { status: 400 });
    }

    const activatedAt = new Date();
    const expiresAt = new Date(activatedAt);
    expiresAt.setDate(expiresAt.getDate() + 30);

    await patchFirestoreDocument("users", userId, creator.idToken, {
      previousPlan: payment.previousPlan ?? null,
      plan,
      planStatus: "active",
      planActivatedAt: activatedAt.toISOString(),
      planExpiresAt: expiresAt.toISOString(),
      planDurationDays: 30,
      updatedAt: activatedAt.toISOString(),
    });
    await patchFirestoreDocument("payments", paymentId, creator.idToken, {
      status: "approved",
      approvedAt: activatedAt.toISOString(),
      approvedBy: CREATOR_EMAIL,
      planActivatedAt: activatedAt.toISOString(),
      planExpiresAt: expiresAt.toISOString(),
      planDurationDays: 30,
      updatedAt: activatedAt.toISOString(),
    });
    await patchFirestoreDocument("admin_logs", randomUUID(), creator.idToken, {
      adminEmail: CREATOR_EMAIL,
      action: "PAYMENT_APPROVED",
      targetUserId: userId,
      targetPaymentId: paymentId,
      details: { plan, planDurationDays: 30 },
      createdAt: activatedAt.toISOString(),
    });

    return Response.json({ ok: true, paymentId, userId, plan, planExpiresAt: expiresAt.toISOString() });
  } catch (error) {
    return firestoreError(error);
  }
}
