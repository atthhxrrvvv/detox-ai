import { creatorGuard, jsonError } from "@/lib/api";

export async function POST(request: Request) {
  try {
    const adminEmail = creatorGuard(request);
    const body = await request.json().catch(() => ({}));
    return Response.json({ announcement: body.announcement ?? "", auditAction: "UPDATED_ANNOUNCEMENT", adminEmail });
  } catch {
    return jsonError("Only creator can access this route.", 403);
  }
}

