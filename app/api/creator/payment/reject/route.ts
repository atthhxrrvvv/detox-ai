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
    const rejectedReason = String(body.rejectedReason ?? "Payment proof could not be verified.").slice(0, 500);
    if (!paymentId) return Response.json({ error: "paymentId is required." }, { status: 400 });

    const payment = await getFirestoreDocument("payments", paymentId, creator.idToken);
    const rejectedAt = new Date().toISOString();

    await patchFirestoreDocument("payments", paymentId, creator.idToken, {
      status: "rejected",
      rejectedAt,
      rejectedBy: CREATOR_EMAIL,
      rejectedReason,
      updatedAt: rejectedAt,
    });
    await patchFirestoreDocument("admin_logs", randomUUID(), creator.idToken, {
      adminEmail: CREATOR_EMAIL,
      action: "PAYMENT_REJECTED",
      targetUserId: payment.userId ?? null,
      targetPaymentId: paymentId,
      details: { rejectedReason },
      createdAt: rejectedAt,
    });

    return Response.json({ ok: true, paymentId, rejectedReason });
  } catch (error) {
    return firestoreError(error);
  }
}
