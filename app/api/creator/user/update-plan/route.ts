import { randomUUID } from "crypto";
import { CREATOR_EMAIL } from "@/lib/constants";
import { requireCreatorApi } from "@/lib/creatorSecurity";
import { firestoreError, patchFirestoreDocument } from "@/lib/firestoreRest";

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
    const patch: Record<string, unknown> = {
      plan,
      planStatus: plan === "free" ? "free" : "active",
      updatedAt: now.toISOString(),
    };

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
