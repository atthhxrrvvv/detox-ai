import crypto from "node:crypto";
import { doc, getDoc, serverTimestamp, setDoc } from "firebase/firestore";
import { db } from "@/lib/firebase";

const lockDocId = "cosmic-admin-login";
const lockCollection = "admin_security";
const maxAttempts = 3;
const lockMs = 4 * 60 * 60 * 1000;
const sessionMs = 30 * 60 * 1000;

type AdminLockState = {
  attempts: number;
  lockedUntil: number;
};

type AdminSession = {
  username: string;
  expiresAt: number;
  stage: "secret" | "active";
};

const memoryLock: AdminLockState = {
  attempts: 0,
  lockedUntil: 0,
};

const globalSessions = globalThis as typeof globalThis & {
  detoxAdminSessions?: Map<string, AdminSession>;
};

const sessions = globalSessions.detoxAdminSessions ?? new Map<string, AdminSession>();
globalSessions.detoxAdminSessions = sessions;

function sha256(value: string) {
  return crypto.createHash("sha256").update(value).digest("hex");
}

function safeEqual(a: string, b: string) {
  const aBuffer = Buffer.from(a);
  const bBuffer = Buffer.from(b);
  if (aBuffer.length !== bBuffer.length) return false;
  return crypto.timingSafeEqual(aBuffer, bBuffer);
}

async function readLock(): Promise<AdminLockState> {
  try {
    const snapshot = await getDoc(doc(db, lockCollection, lockDocId));
    const data = snapshot.data() as Partial<AdminLockState> | undefined;
    return {
      attempts: Number(data?.attempts ?? 0),
      lockedUntil: Number(data?.lockedUntil ?? 0),
    };
  } catch {
    return memoryLock;
  }
}

async function writeLock(next: AdminLockState) {
  memoryLock.attempts = next.attempts;
  memoryLock.lockedUntil = next.lockedUntil;

  try {
    await setDoc(
      doc(db, lockCollection, lockDocId),
      {
        ...next,
        updatedAt: serverTimestamp(),
      },
      { merge: true },
    );
  } catch {
    // Memory fallback keeps local development safe if Firestore rules are not ready.
  }
}

export async function getAdminLockStatus() {
  const lock = await readLock();
  const now = Date.now();

  if (lock.lockedUntil > now) {
    return {
      locked: true,
      lockedUntil: lock.lockedUntil,
      attemptsLeft: 0,
    };
  }

  if (lock.lockedUntil && lock.lockedUntil <= now) {
    await writeLock({ attempts: 0, lockedUntil: 0 });
    return {
      locked: false,
      lockedUntil: 0,
      attemptsLeft: maxAttempts,
    };
  }

  return {
    locked: false,
    lockedUntil: 0,
    attemptsLeft: Math.max(0, maxAttempts - lock.attempts),
  };
}

export async function verifyAdminPassword(username: string, password: string) {
  const lock = await getAdminLockStatus();
  if (lock.locked) {
    return { ok: false, locked: true, lockedUntil: lock.lockedUntil, attemptsLeft: 0 };
  }

  const expectedUsername = process.env.ADMIN_USERNAME;
  const expectedPasswordHash = process.env.ADMIN_PASSWORD_HASH;
  const passwordHash = sha256(password);
  const usernameOk = Boolean(expectedUsername) && safeEqual(username, expectedUsername ?? "");
  const passwordOk = Boolean(expectedPasswordHash) && safeEqual(passwordHash, expectedPasswordHash ?? "");

  if (!usernameOk || !passwordOk) {
    const current = await readLock();
    const attempts = current.attempts + 1;
    const lockedUntil = attempts >= maxAttempts ? Date.now() + lockMs : 0;
    await writeLock({ attempts, lockedUntil });

    return {
      ok: false,
      locked: lockedUntil > 0,
      lockedUntil,
      attemptsLeft: Math.max(0, maxAttempts - attempts),
    };
  }

  await writeLock({ attempts: 0, lockedUntil: 0 });
  const pendingToken = crypto.randomBytes(32).toString("hex");
  sessions.set(pendingToken, {
    username,
    expiresAt: Date.now() + 5 * 60 * 1000,
    stage: "secret",
  });

  return {
    ok: true,
    pendingToken,
  };
}

export function verifyAdminSecret(pendingToken: string, secretKey: string) {
  const session = sessions.get(pendingToken);
  if (!session || session.stage !== "secret" || session.expiresAt < Date.now()) {
    sessions.delete(pendingToken);
    return { ok: false };
  }

  const expectedSecret = process.env.ADMIN_SECRET_KEY;
  if (!expectedSecret || !safeEqual(secretKey, expectedSecret)) {
    return { ok: false };
  }

  const adminToken = crypto.randomBytes(32).toString("hex");
  sessions.delete(pendingToken);
  sessions.set(adminToken, {
    username: session.username,
    expiresAt: Date.now() + sessionMs,
    stage: "active",
  });

  return { ok: true, adminToken };
}

export function verifyAdminSession(authHeader?: string | null) {
  const token = authHeader?.startsWith("Bearer ") ? authHeader.slice("Bearer ".length) : "";
  if (!token) return null;

  const session = sessions.get(token);
  if (!session || session.stage !== "active" || session.expiresAt < Date.now()) {
    sessions.delete(token);
    return null;
  }

  return {
    token,
    username: session.username,
    expiresAt: session.expiresAt,
  };
}

export function clearAdminSession(authHeader?: string | null) {
  const token = authHeader?.startsWith("Bearer ") ? authHeader.slice("Bearer ".length) : "";
  if (token) sessions.delete(token);
}
