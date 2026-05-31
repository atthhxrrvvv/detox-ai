import { creatorGuard, jsonError } from "@/lib/api";

export async function GET(request: Request) {
  try {
    creatorGuard(request);
    return Response.json({
      totalUsers: 1248,
      freeUsers: 988,
      proUsers: 186,
      premiumUsers: 74,
      bannedUsers: 4,
      totalChats: 18420,
      totalMessages: 92341,
      messagesToday: 2931,
      revenueToday: 1497,
      revenueThisMonth: 78900,
      totalRevenue: 124500,
      pendingPayments: 12,
      approvedPayments: 260,
      rejectedPayments: 18,
      reportedChats: 3,
      estimatedApiCost: 2450,
    });
  } catch {
    return jsonError("Only creator can access this route.", 403);
  }
}

