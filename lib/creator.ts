import { CREATOR_EMAIL } from "@/lib/constants";

export function isCreator(email?: string | null) {
  return email === CREATOR_EMAIL;
}

export function hasUnlimitedAccess(email?: string | null) {
  return isCreator(email);
}

export function canAccessCreatorDashboard(email?: string | null) {
  return isCreator(email);
}

export function requireCreator(email?: string | null) {
  if (!isCreator(email)) {
    throw new Error("Unauthorized creator access");
  }

  return true;
}

