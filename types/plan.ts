import type { PlanId } from "@/lib/limits";

export type DetoxPlan = {
  id: PlanId;
  name: string;
  price: number;
  currency: "INR";
  dailyMessages: number;
  monthlyMessages: number;
  maxInputChars: number;
  fileUploadsPerMonth: number;
  allowedModels: readonly string[];
};

