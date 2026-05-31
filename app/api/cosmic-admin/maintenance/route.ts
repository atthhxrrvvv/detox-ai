import { doc, serverTimestamp, setDoc } from "firebase/firestore";
import { jsonError } from "@/lib/api";
import { verifyAdminSession } from "@/lib/cosmicAdmin";
import { db } from "@/lib/firebase";
import { setRuntimeMaintenance } from "@/lib/adminRuntimeState";

export async function POST(request: Request) {
  const session = verifyAdminSession(request.headers.get("authorization"));
  if (!session) {
    return jsonError("Admin session required.", 401);
  }

  try {
    const body = await request.json();
    const maintenanceMode = Boolean(body.maintenanceMode);
    const maintenanceMessage = String(body.maintenanceMessage || "Detox AI is in maintenance mode.");
    setRuntimeMaintenance({ maintenanceMode, maintenanceMessage });

    try {
      await setDoc(
        doc(db, "app_settings", "global"),
        {
          maintenanceMode,
          maintenanceMessage,
          maintenanceUpdatedAt: serverTimestamp(),
          maintenanceUpdatedBy: session.username,
        },
        { merge: true },
      );

      await setDoc(doc(db, "admin_logs", crypto.randomUUID()), {
        action: maintenanceMode ? "MAINTENANCE_ENABLED" : "MAINTENANCE_DISABLED",
        adminEmail: session.username,
        details: { maintenanceMessage },
        createdAt: serverTimestamp(),
      });
    } catch {
      // Firestore rules may block local admin writes; runtime state still protects this dev server.
    }

    return Response.json({ ok: true, maintenanceMode, maintenanceMessage });
  } catch (error) {
    return jsonError(error instanceof Error ? error.message : "Maintenance update failed.", 500);
  }
}
