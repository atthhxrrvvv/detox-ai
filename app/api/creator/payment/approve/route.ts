import { creatorGuard, jsonError } from "@/lib/api";

export async function POST(request: Request) {
  try {
    const adminEmail = creatorGuard(request);
    const body = await request.json().catch(() => ({}));
    return Response.json({
      paymentId: body.paymentId,
      status: "approved",
      approvedBy: adminEmail,
      approvedAt: new Date().toISOString(),
      auditAction: "APPROVED_PAYMENT",
      message: "Payment approved. User plan should now be activated in Firestore.",
    });
  } catch {
    return jsonError("Only creator can access this route.", 403);
  }
}

