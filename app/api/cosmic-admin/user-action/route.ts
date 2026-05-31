import { doc, serverTimestamp, setDoc } from "firebase/firestore";
import { jsonError } from "@/lib/api";
import { verifyAdminSession } from "@/lib/cosmicAdmin";
import { db } from "@/lib/firebase";
import { setRuntimeUser } from "@/lib/adminRuntimeState";

export async function POST(request: Request) {
  const session = verifyAdminSession(request.headers.get("authorization"));
  if (!session) {
    return jsonError("Admin session required.", 401);
  }

  try {
    const body = await request.json();
    const uid = String(body.uid ?? "");
    const action = String(body.action ?? "");

    if (!uid) return jsonError("User id is required.", 400);

    const patch =
      action === "ban"
        ? { isBanned: true, blockedPermanently: false, status: "banned" }
        : action === "unban"
          ? { isBanned: false, blockedPermanently: false, status: "active", plan: "free" }
          : action === "block"
            ? { isBanned: true, blockedPermanently: true, status: "blocked", plan: "banned" }
            : null;

    if (!patch) return jsonError("Unknown user action.", 400);
    setRuntimeUser(uid, patch);

    try {
      await setDoc(
        doc(db, "users", uid),
        {
          ...patch,
          updatedAt: serverTimestamp(),
          updatedBy: session.username,
        },
        { merge: true },
      );

      await setDoc(doc(db, "admin_logs", crypto.randomUUID()), {
        action: action.toUpperCase(),
        targetUserId: uid,
        adminEmail: session.username,
        createdAt: serverTimestamp(),
      });
    } catch {
      // Runtime state still blocks users on this dev server if Firestore rules block writes.
    }

    return Response.json({ ok: true, uid, action });
  } catch (error) {
    return jsonError(error instanceof Error ? error.message : "User action failed.", 500);
  }
}
