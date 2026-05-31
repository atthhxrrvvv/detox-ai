import { PLAN_LIMITS, type PlanId } from "@/lib/limits";

export function useUsage(plan: PlanId = "free", dailyMessages = 0, monthlyMessages = 0) {
  const limits = PLAN_LIMITS[plan];

  return {
    limits,
    dailyRemaining: Math.max(0, limits.dailyMessages - dailyMessages),
    monthlyRemaining: Math.max(0, limits.monthlyMessages - monthlyMessages),
  };
}

