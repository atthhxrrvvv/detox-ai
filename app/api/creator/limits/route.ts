import { creatorGuard, jsonError } from "@/lib/api";
import { PLAN_LIMITS } from "@/lib/limits";

export async function GET(request: Request) {
  try {
    creatorGuard(request);
    return Response.json({ limits: PLAN_LIMITS });
  } catch {
    return jsonError("Only creator can access this route.", 403);
  }
}

