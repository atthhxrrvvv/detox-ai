import { creatorGuard, jsonError } from "@/lib/api";

export async function GET(request: Request) {
  try {
    creatorGuard(request);
    return Response.json({
      payments: [
        { paymentId: "pay_demo_1", userEmail: "coder@example.com", plan: "pro", amount: 199, status: "pending", transactionId: "TXN8841" },
        { paymentId: "pay_demo_2", userEmail: "creator@example.com", plan: "premium", amount: 499, status: "pending", transactionId: "TXN8842" },
      ],
    });
  } catch {
    return jsonError("Only creator can access this route.", 403);
  }
}

