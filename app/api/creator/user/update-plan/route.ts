import { randomUUID } from "crypto";
import { CREATOR_EMAIL } from "@/lib/constants";
import { requireCreatorApi } from "@/lib/creatorSecurity";
import { firestoreError, getFirestoreDocument, patchFirestoreDocument } from "@/lib/firestoreRest";

export async function POST(request: Request) {
  const creator = await requireCreatorApi(request);
  if (!creator.ok) return creator.response;

  try {
    const body = await request.json().catch(() => ({}));
    const uid = String(body.uid ?? "");
    const plan = String(body.plan ?? "free");
    if (!uid) return Response.json({ error: "uid is required." }, { status: 400 });
    if (!["free", "lite", "go", "pro", "premium", "ultimate", "creator"].includes(plan)) {
      return Response.json({ error: "Invalid plan." }, { status: 400 });
    }

    const now = new Date();

    // Read current plan for audit trail (previousPlan)
    let currentPlan: string | undefined;
    try {
      const userDoc = await getFirestoreDocument("users", uid, creator.idToken);
      currentPlan = typeof userDoc.plan === "string" ? userDoc.plan : undefined;
    } catch {
      // If we can't read the current plan, that's OK — just skip previousPlan
    }

    const patch: Record<string, unknown> = {
      plan,
      planStatus: plan === "free" ? "free" : "active",
      updatedAt: now.toISOString(),
      role: plan === "creator" ? "creator" : plan === "free" ? "free" : plan,
    };

    if (currentPlan && currentPlan !== plan) {
      patch.previousPlan = currentPlan;
    }

    if (["lite", "go", "pro", "premium", "ultimate"].includes(plan)) {
      const expiresAt = new Date(now);
      expiresAt.setDate(expiresAt.getDate() + 30);
      patch.planActivatedAt = now.toISOString();
      patch.planExpiresAt = expiresAt.toISOString();
      patch.planDurationDays = 30;
    }

    if (plan === "free") {
      patch.planExpiresAt = null;
      patch.planDurationDays = 0;
      patch.planActivatedAt = null;
    }

    await patchFirestoreDocument("users", uid, creator.idToken, patch);
    await patchFirestoreDocument("admin_logs", randomUUID(), creator.idToken, {
      adminEmail: CREATOR_EMAIL,
      action: "USER_PLAN_CHANGED",
      targetUserId: uid,
      details: { plan },
      createdAt: now.toISOString(),
    });

    return Response.json({ ok: true, uid, plan });
  } catch (error) {
    return firestoreError(error);
  }
}
