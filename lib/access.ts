import { isCreator } from "@/lib/creator";
import { PLAN_LIMITS, type PlanId } from "@/lib/limits";
import { getDetoxModel } from "@/lib/models";

export type AccessUser = {
  email?: string | null;
  plan?: PlanId | "banned";
  isBanned?: boolean;
  dailyMessages?: number;
  monthlyMessages?: number;
};

export function canUseModel(user: AccessUser | null | undefined, modelId: string) {
  if (!user || user.isBanned || user.plan === "banned") return false;
  if (isCreator(user.email)) return true;

  const model = getDetoxModel(modelId);
  if (!model) return false;

  const plan = getPlanForUser(user);
  const allowedModels = PLAN_LIMITS[plan].allowedModels as readonly string[];
  return allowedModels.includes("all") || allowedModels.includes(modelId);
}

export function getPlanForUser(user: AccessUser | null | undefined): PlanId {
  if (isCreator(user?.email)) return "creator";
  if (
    user?.plan === "lite" ||
    user?.plan === "go" ||
    user?.plan === "pro" ||
    user?.plan === "premium" ||
    user?.plan === "ultimate"
  ) {
    return user.plan;
  }
  return "free";
}

export function validateChatAccess(user: AccessUser, modelId: string, input: string) {
  if (user.isBanned || user.plan === "banned") {
    return { ok: false, status: 403, error: "This account is banned from Detox AI." };
  }

  const plan = getPlanForUser(user);
  const limits = PLAN_LIMITS[plan];

  if (!canUseModel(user, modelId)) {
    const model = getDetoxModel(modelId);
    return {
      ok: false,
      status: 402,
      error: `Upgrade your plan to unlock ${model?.displayName ?? "this model"}.`,
    };
  }

  if (input.length > limits.maxInputChars) {
    return {
      ok: false,
      status: 413,
      error: `Your current plan allows ${limits.maxInputChars} input characters.`,
    };
  }

  if (user.dailyMessages !== undefined && user.dailyMessages >= limits.dailyMessages) {
    return { ok: false, status: 429, error: "Daily message limit reached." };
  }

  if (user.monthlyMessages !== undefined && user.monthlyMessages >= limits.monthlyMessages) {
    return { ok: false, status: 429, error: "Monthly message limit reached." };
  }

  return { ok: true, status: 200, error: null };
}
