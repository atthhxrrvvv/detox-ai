import { creatorGuard, jsonError } from "@/lib/api";

export async function POST(request: Request) {
  try {
    const adminEmail = creatorGuard(request);
    const body = await request.json().catch(() => ({}));
    return Response.json({
      paymentId: body.paymentId,
      status: "rejected",
      rejectedBy: adminEmail,
      rejectedAt: new Date().toISOString(),
      rejectedReason: body.reason ?? "Payment could not be verified.",
      auditAction: "REJECTED_PAYMENT",
    });
  } catch {
    return jsonError("Only creator can access this route.", 403);
  }
}

