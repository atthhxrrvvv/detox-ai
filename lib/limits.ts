export type PlanId = "free" | "lite" | "go" | "pro" | "premium" | "ultimate" | "creator";

const FREE_MODELS = ["flash-1.0", "scholar-1.4", "spark-1.8", "echo-1.6", "nova-1.5"] as const;
const GO_MODELS = [...FREE_MODELS, "cosmo-1.2", "gamma-2.0"] as const;
const PRO_MODELS = [...GO_MODELS, "orion-2.9", "mentor-3.0", "lyra-3.2"] as const;
const PREMIUM_MODELS = [...PRO_MODELS, "penton-4.4", "sentinel-2.7", "prism-3.8"] as const;
const ULTIMATE_MODELS = [...PREMIUM_MODELS, "titan-5.0", "atlas-4.0"] as const;

export const PLAN_LIMITS = {
  free: {
    dailyMessages: 10,
    monthlyMessages: 100,
    maxInputChars: 1200,
    fileUploadsPerMonth: 0,
    allowedModels: FREE_MODELS,
  },
  lite: {
    dailyMessages: 70,
    monthlyMessages: 1800,
    maxInputChars: 3000,
    fileUploadsPerMonth: 3,
    allowedModels: [...FREE_MODELS, "cosmo-1.2"],
  },
  go: {
    dailyMessages: 150,
    monthlyMessages: 4500,
    maxInputChars: 6000,
    fileUploadsPerMonth: 15,
    allowedModels: GO_MODELS,
  },
  pro: {
    dailyMessages: 400,
    monthlyMessages: 12000,
    maxInputChars: 12000,
    fileUploadsPerMonth: 75,
    allowedModels: PRO_MODELS,
  },
  premium: {
    dailyMessages: 900,
    monthlyMessages: 30000,
    maxInputChars: 20000,
    fileUploadsPerMonth: 300,
    allowedModels: PREMIUM_MODELS,
  },
  ultimate: {
    dailyMessages: 2000,
    monthlyMessages: 75000,
    maxInputChars: 40000,
    fileUploadsPerMonth: 1000,
    allowedModels: ULTIMATE_MODELS,
  },
  creator: {
    dailyMessages: Infinity,
    monthlyMessages: Infinity,
    maxInputChars: Infinity,
    fileUploadsPerMonth: Infinity,
    allowedModels: ["all"],
  },
} as const;
