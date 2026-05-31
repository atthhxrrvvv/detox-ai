import { creatorGuard, jsonError } from "@/lib/api";

export async function GET(request: Request) {
  try {
    creatorGuard(request);
    return Response.json({ logs: [] });
  } catch {
    return jsonError("Only creator can access this route.", 403);
  }
}

