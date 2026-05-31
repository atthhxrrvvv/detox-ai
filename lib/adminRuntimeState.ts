type MaintenanceState = {
  maintenanceMode: boolean;
  maintenanceMessage: string;
};

type UserRuntimeState = {
  isBanned?: boolean;
  blockedPermanently?: boolean;
  plan?: string;
};

const globalState = globalThis as typeof globalThis & {
  detoxMaintenanceState?: MaintenanceState;
  detoxUserRuntimeState?: Map<string, UserRuntimeState>;
};

export const runtimeMaintenance =
  globalState.detoxMaintenanceState ??
  ({
    maintenanceMode: false,
    maintenanceMessage: "Detox AI is in maintenance mode.",
  } satisfies MaintenanceState);

globalState.detoxMaintenanceState = runtimeMaintenance;

export const runtimeUsers = globalState.detoxUserRuntimeState ?? new Map<string, UserRuntimeState>();
globalState.detoxUserRuntimeState = runtimeUsers;

export function setRuntimeMaintenance(next: MaintenanceState) {
  runtimeMaintenance.maintenanceMode = next.maintenanceMode;
  runtimeMaintenance.maintenanceMessage = next.maintenanceMessage || "Detox AI is in maintenance mode.";
}

export function setRuntimeUser(uid: string, next: UserRuntimeState) {
  runtimeUsers.set(uid, {
    ...runtimeUsers.get(uid),
    ...next,
  });
}
