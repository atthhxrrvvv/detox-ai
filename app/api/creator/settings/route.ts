import { CREATOR_EMAIL, CREATOR_UPI_ID } from "@/lib/constants";
import { creatorGuard, jsonError } from "@/lib/api";

export async function GET(request: Request) {
  try {
    creatorGuard(request);
    return Response.json({
      creatorEmail: CREATOR_EMAIL,
      creatorUpiId: CREATOR_UPI_ID,
      maintenanceMode: false,
      announcement: "",
      freeSignupEnabled: true,
      defaultModel: "flash-1.0",
      defaultTheme: "dark",
      privacyNoticeVersion: "2026-05-29",
    });
  } catch {
    return jsonError("Only creator can access this route.", 403);
  }
}
