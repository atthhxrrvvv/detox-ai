import { creatorGuard, jsonError } from "@/lib/api";

export async function GET(request: Request) {
  try {
    const adminEmail = creatorGuard(request);
    return Response.json({
      chats: [],
      auditAction: "VIEWED_CREATOR_CHATS",
      adminEmail,
      privacyReasonRequired: true,
    });
  } catch {
    return jsonError("Only creator can access this route.", 403);
  }
}

