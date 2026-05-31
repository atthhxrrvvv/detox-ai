import { doc, getDoc, serverTimestamp, setDoc } from "firebase/firestore";
import { jsonError } from "@/lib/api";
import { setRuntimeUser } from "@/lib/adminRuntimeState";
import { verifyAdminSession } from "@/lib/cosmicAdmin";
import { db } from "@/lib/firebase";

const paidPlans = new Set(["lite", "go", "pro", "premium", "ultimate"]);

function addDays(days: number) {
  const date = new Date();
  date.setDate(date.getDate() + days);
  return date;
}

export async function POST(request: Request) {
  const session = verifyAdminSession(request.headers.get("authorization"));
  if (!session) {
    return jsonError("Admin session required.", 401);
  }

  try {
    const body = await request.json();
    const paymentId = String(body.paymentId ?? "").trim();
    const action = String(body.action ?? "").trim();
    const rejectedReason = String(body.rejectedReason ?? "").trim();

    if (!paymentId) return jsonError("Payment id is required.", 400);
    if (action !== "approve" && action !== "reject") return jsonError("Action must be approve or reject.", 400);

    const paymentRef = doc(db, "payments", paymentId);
    const paymentSnapshot = await getDoc(paymentRef);
    if (!paymentSnapshot.exists()) return jsonError("Payment request not found.", 404);

    const payment = paymentSnapshot.data();
    const userId = String(payment.userId ?? "");
    const plan = String(payment.plan ?? "");

    if (action === "approve") {
      if (!userId) return jsonError("Payment has no user id.", 400);
      if (!paidPlans.has(plan)) return jsonError("Payment has an invalid plan.", 400);

      const expiresAt = addDays(String(payment.billingCycle ?? "monthly") === "yearly" ? 365 : 30);
      const planUntilField = `${plan}Until`;
      const userPatch = {
        plan,
        role: plan,
        isBanned: false,
        blockedPermanently: false,
        subscriptionStatus: "active",
        subscriptionPlan: plan,
        subscriptionUntil: expiresAt,
        [planUntilField]: expiresAt,
        updatedAt: serverTimestamp(),
        updatedBy: session.username,
      };

      setRuntimeUser(userId, userPatch);

      await setDoc(doc(db, "users", userId), userPatch, { merge: true });
      await setDoc(
        paymentRef,
        {
          status: "approved",
          approvedBy: session.username,
          approvedAt: serverTimestamp(),
          updatedAt: serverTimestamp(),
        },
        { merge: true },
      );
      await setDoc(doc(db, "admin_logs", crypto.randomUUID()), {
        action: "APPROVED_PAYMENT",
        adminEmail: session.username,
        targetUserId: userId,
        targetPaymentId: paymentId,
        details: { plan, amount: payment.amount, transactionId: payment.transactionId },
        createdAt: serverTimestamp(),
      });

      return Response.json({ ok: true, paymentId, status: "approved", plan, userId });
    }

    await setDoc(
      paymentRef,
      {
        status: "rejected",
        rejectedBy: session.username,
        rejectedAt: serverTimestamp(),
        rejectedReason: rejectedReason || "Payment could not be verified.",
        updatedAt: serverTimestamp(),
      },
      { merge: true },
    );
    await setDoc(doc(db, "admin_logs", crypto.randomUUID()), {
      action: "REJECTED_PAYMENT",
      adminEmail: session.username,
      targetUserId: userId || null,
      targetPaymentId: paymentId,
      details: { plan, amount: payment.amount, transactionId: payment.transactionId, rejectedReason },
      createdAt: serverTimestamp(),
    });

    return Response.json({ ok: true, paymentId, status: "rejected" });
  } catch (error) {
    return jsonError(error instanceof Error ? error.message : "Payment action failed.", 500);
  }
}
