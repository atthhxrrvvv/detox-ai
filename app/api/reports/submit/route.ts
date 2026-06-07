import { randomUUID } from "crypto";
import { jsonError } from "@/lib/api";
import { createFirestoreDocument } from "@/lib/firestoreRest";
import { verifyFirebaseIdToken } from "@/lib/serverAuth";

const reportTypes = ["bug", "feature", "payment"] as const;

function cleanText(value: unknown, maxLength: number) {
  return String(value ?? "").trim().slice(0, maxLength);
}

export async function POST(request: Request) {
  try {
    const body = await request.json().catch(() => ({}));
    const idToken = String(body.idToken ?? "");
    const verifiedUser = await verifyFirebaseIdToken(idToken);

    if (!verifiedUser?.email) {
      return jsonError("Please sign in before sending a report.", 401);
    }

    const type = cleanText(body.type, 30);
    const title = cleanText(body.title, 140);
    const details = cleanText(body.details, 3000);
    const page = cleanText(body.page, 500);

    if (!reportTypes.includes(type as (typeof reportTypes)[number])) {
      return jsonError("Report type must be bug, feature, or payment.");
    }

    if (!title) {
      return jsonError("Add a short title for the report.");
    }

    if (details.length < 12) {
      return jsonError("Add a little more detail so the creator can understand it.");
    }

    const reportId = randomUUID();
    await createFirestoreDocument("reports", reportId, idToken, {
      reportId,
      type,
      reason: type,
      title,
      details,
      page,
      status: "open",
      priority: type === "payment" ? "high" : "normal",
      userId: verifiedUser.uid,
      userEmail: verifiedUser.email,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    });

    return Response.json({ ok: true, reportId });
  } catch (error) {
    return jsonError(error instanceof Error ? error.message : "Could not submit report.", 500);
  }
}
