import { jsonError } from "@/lib/api";
import { verifyAdminPassword } from "@/lib/cosmicAdmin";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const username = String(body.username ?? "");
    const password = String(body.password ?? "");

    if (!username || !password) {
      return jsonError("Username and password are required.", 400);
    }

    const result = await verifyAdminPassword(username, password);
    if (!result.ok) {
      return Response.json(
        {
          error: result.locked ? "Admin login locked for 4 hours." : "Invalid admin username or password.",
          locked: result.locked,
          lockedUntil: result.lockedUntil,
          attemptsLeft: result.attemptsLeft,
        },
        { status: result.locked ? 423 : 401 },
      );
    }

    return Response.json({
      secretRequired: true,
      pendingToken: result.pendingToken,
    });
  } catch (error) {
    return jsonError(error instanceof Error ? error.message : "Admin login failed.", 500);
  }
}
