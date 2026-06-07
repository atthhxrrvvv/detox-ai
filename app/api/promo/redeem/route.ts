import { randomUUID } from "crypto";
import { jsonError } from "@/lib/api";
import { createFirestoreDocument, patchFirestoreDocument } from "@/lib/firestoreRest";
import type { PlanId } from "@/lib/limits";
import { PROMO_CODES } from "@/lib/promoCodes.generated";
import { verifyFirebaseIdToken } from "@/lib/serverAuth";

const promoCodeByCode = new Map<string, (typeof PROMO_CODES)[number]>(PROMO_CODES.map((promo) => [promo.code, promo]));
const paidPlans = new Set<PlanId>(["lite", "go", "pro", "premium", "ultimate"]);

function normalizePromoCode(value: unknown) {
  return String(value ?? "")
    .trim()
    .toUpperCase()
    .replace(/\s+/g, "");
}

function friendlyPlan(plan: string) {
  return plan === "go" ? "Plus" : plan.charAt(0).toUpperCase() + plan.slice(1);
}

export async function POST(request: Request) {
  try {
    const body = await request.json().catch(() => ({}));
    const verifiedUser = await verifyFirebaseIdToken(String(body.idToken ?? ""));
    if (!verifiedUser?.uid) {
      return jsonError("Login first before redeeming a Detox code.", 401);
    }

    const code = normalizePromoCode(body.code);
    const requestedPlan = String(body.plan ?? "").toLowerCase() as PlanId;
    const promo = promoCodeByCode.get(code);

    if (!code) return jsonError("Enter your Detox promo code.");
    if (!promo || promo.status !== "active") return jsonError("Incorrect code.", 404);
    if (!paidPlans.has(requestedPlan)) return jsonError("Choose a valid paid plan before redeeming.");
    if (promo.plan !== requestedPlan) {
      return jsonError(`This code is for ${friendlyPlan(promo.plan)}. Select that plan and try again.`);
    }

    const activatedAt = new Date();
    const expiresAt = new Date(activatedAt);
    expiresAt.setDate(expiresAt.getDate() + promo.durationDays);
    const redemptionId = code.replace(/[^A-Z0-9_-]/g, "_");
    const paymentId = randomUUID();

    try {
      await createFirestoreDocument("promo_redemptions", redemptionId, String(body.idToken), {
        redemptionId,
        code,
        plan: promo.plan,
        planName: friendlyPlan(promo.plan),
        durationDays: promo.durationDays,
        usageLimit: promo.usageLimit,
        status: "redeemed",
        userId: verifiedUser.uid,
        userEmail: verifiedUser.email,
        paymentId,
        redeemedAt: activatedAt.toISOString(),
        expiresAt: expiresAt.toISOString(),
      });
    } catch (error) {
      const message = error instanceof Error ? error.message : "";
      if (message.includes("ALREADY_EXISTS") || message.includes("409")) {
        return jsonError("This Detox code was already used.", 409);
      }
      throw error;
    }

    await patchFirestoreDocument("users", verifiedUser.uid, String(body.idToken), {
      uid: verifiedUser.uid,
      email: verifiedUser.email,
      previousPlan: null,
      plan: promo.plan,
      planStatus: "active",
      planActivatedAt: activatedAt.toISOString(),
      planExpiresAt: expiresAt.toISOString(),
      planDurationDays: promo.durationDays,
      planSource: "promo_code",
      lastPromoCode: code,
      updatedAt: activatedAt.toISOString(),
    });

    await createFirestoreDocument("payments", paymentId, String(body.idToken), {
      paymentId,
      userId: verifiedUser.uid,
      userEmail: verifiedUser.email,
      userName: verifiedUser.email ?? "Detox user",
      plan: promo.plan,
      planName: friendlyPlan(promo.plan),
      billingCycle: "promo",
      amount: 0,
      currency: "INR",
      paymentMethod: "promo_code",
      promoCode: code,
      status: "approved",
      approvedBy: "promo_code",
      approvedAt: activatedAt.toISOString(),
      planActivatedAt: activatedAt.toISOString(),
      planExpiresAt: expiresAt.toISOString(),
      planDurationDays: promo.durationDays,
      createdAt: activatedAt.toISOString(),
      updatedAt: activatedAt.toISOString(),
    });

    return Response.json({
      ok: true,
      code,
      paymentId,
      plan: promo.plan,
      planName: friendlyPlan(promo.plan),
      planExpiresAt: expiresAt.toISOString(),
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : "";
    if (message.includes("PERMISSION_DENIED") || message.includes("Missing or insufficient permissions")) {
      return jsonError("Firebase rules are blocking promo redemption. Publish the latest Firestore rules with promo_redemptions enabled.", 403);
    }
    return jsonError(error instanceof Error ? error.message : "Promo code redemption failed.", 500);
  }
}
