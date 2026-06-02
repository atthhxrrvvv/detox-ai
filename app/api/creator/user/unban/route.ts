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
    if (!uid) return Response.json({ error: "uid is required." }, { status: 400 });
    const now = new Date().toISOString();

    await patchFirestoreDocument("users", uid, creator.idToken, {
      isBanned: false,
      planStatus: "free",
      updatedAt: now,
    });
    await patchFirestoreDocument("admin_logs", randomUUID(), creator.idToken, {
      adminEmail: CREATOR_EMAIL,
      action: "USER_UNBANNED",
      targetUserId: uid,
      createdAt: now,
    });

    return Response.json({ ok: true, uid, isBanned: false });
  } catch (error) {
    return firestoreError(error);
  }
}
