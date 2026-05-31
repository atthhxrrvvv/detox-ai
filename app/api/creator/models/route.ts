import { creatorGuard, jsonError } from "@/lib/api";
import { DETOX_MODELS } from "@/lib/models";

export async function GET(request: Request) {
  try {
    creatorGuard(request);
    return Response.json({ models: DETOX_MODELS });
  } catch {
    return jsonError("Only creator can access this route.", 403);
  }
}

