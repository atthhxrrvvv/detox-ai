import { jsonError } from "@/lib/api";
import { verifyAdminSecret } from "@/lib/cosmicAdmin";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const pendingToken = String(body.pendingToken ?? "");
    const secretKey = String(body.secretKey ?? "");

    if (!pendingToken || !secretKey) {
      return jsonError("Secret verification is required.", 400);
    }

    const result = verifyAdminSecret(pendingToken, secretKey);
    if (!result.ok) {
      return jsonError("Invalid or expired admin secret.", 401);
    }

    return Response.json({
      adminToken: result.adminToken,
      expiresOnRefresh: true,
    });
  } catch (error) {
    return jsonError(error instanceof Error ? error.message : "Secret verification failed.", 500);
  }
}
