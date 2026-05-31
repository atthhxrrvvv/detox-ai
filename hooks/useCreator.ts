import { canAccessCreatorDashboard } from "@/lib/creator";

export function useCreator(email?: string | null) {
  return {
    isCreator: canAccessCreatorDashboard(email),
    canAccessCreatorDashboard: canAccessCreatorDashboard(email),
  };
}

