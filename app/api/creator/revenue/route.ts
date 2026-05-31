import { creatorGuard, jsonError } from "@/lib/api";

export async function GET(request: Request) {
  try {
    creatorGuard(request);
    return Response.json({
      currency: "INR",
      totalRevenue: 124500,
      todayRevenue: 1497,
      monthlyRevenue: 78900,
      proRevenue: 37014,
      premiumRevenue: 87824,
      activeSubscriptions: 260,
      expiredSubscriptions: 31,
      rejectedPayments: 18,
    });
  } catch {
    return jsonError("Only creator can access this route.", 403);
  }
}

