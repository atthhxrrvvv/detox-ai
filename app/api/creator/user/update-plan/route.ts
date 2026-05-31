import { creatorGuard, jsonError } from "@/lib/api";

export async function POST(request: Request) {
  try {
    const adminEmail = creatorGuard(request);
    const body = await request.json().catch(() => ({}));
    return Response.json({ uid: body.uid, plan: body.plan, auditAction: "UPDATED_USER_PLAN", adminEmail });
  } catch {
    return jsonError("Only creator can access this route.", 403);
  }
}

