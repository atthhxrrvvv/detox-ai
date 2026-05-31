import { creatorGuard, jsonError } from "@/lib/api";

export async function GET(request: Request) {
  try {
    creatorGuard(request);
    return Response.json({
      users: [
        { uid: "demo-free", email: "student@example.com", plan: "free", dailyMessages: 12, isBanned: false },
        { uid: "demo-pro", email: "coder@example.com", plan: "pro", dailyMessages: 42, isBanned: false },
        { uid: "demo-premium", email: "creator@example.com", plan: "premium", dailyMessages: 87, isBanned: false },
      ],
    });
  } catch {
    return jsonError("Only creator can access this route.", 403);
  }
}

