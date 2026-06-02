import type { PlanId } from "@/lib/limits";

export type UserRole = "creator" | "moderator" | "premium" | "pro" | "free" | "banned";

export type DetoxUser = {
  uid: string;
  name: string;
  email: string;
  photoURL?: string | null;
  role: UserRole;
  plan: PlanId;
  isCreator: boolean;
  isBanned: boolean;
  createdAt: string;
  lastLogin: string;
  dailyMessages: number;
  monthlyMessages: number;
  tokensUsed: number;
  fileUploadsUsed: number;
  proUntil?: string | null;
  premiumUntil?: string | null;
  settings?: Record<string, unknown>;
};
