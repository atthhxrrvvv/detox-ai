export const APP_NAME = "Detox AI";
export const CREATOR_EMAIL = "cosmiceternal9481@gmail.com";
export const CREATOR_UPI_ID = "atharvxsharma@fam";

export const TAGLINES = [
  "Clean thinking. Powerful answers.",
  "Your premium AI workspace.",
  "Think. Code. Create.",
  "One brain for every task.",
  "Intelligence with style.",
];

export const PLAN_PRICES = {
  lite: 299,
  go: 599,
  pro: 1199,
  premium: 2499,
  ultimate: 4999,
} as const;

export const YEARLY_PLAN_PRICES = {
  lite: 2999,
  go: 5999,
  pro: 11999,
  premium: 24999,
  ultimate: 49999,
} as const;

export const PAYMENT_STATUSES = [
  "pending",
  "approved",
  "rejected",
  "expired",
  "refunded",
] as const;

export const ROLES = [
  "creator",
  "moderator",
  "premium",
  "pro",
  "go",
  "lite",
  "ultimate",
  "free",
  "banned",
] as const;
