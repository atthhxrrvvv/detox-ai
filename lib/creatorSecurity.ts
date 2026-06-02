import { createHash, createHmac, randomUUID, timingSafeEqual } from "crypto";
import { CREATOR_EMAIL } from "@/lib/constants";
import { verifyFirebaseIdToken } from "@/lib/serverAuth";

const SESSION_COOKIE = "detox_creator_session";
const PENDING_TTL_MS = 10 * 60 * 1000;
const SESSION_TTL_MS = 8 * 60 * 60 * 1000;
const LOCK_TTL_MS = 24 * 60 * 60 * 1000;
const MAX_FAILED_ATTEMPTS = 3;

const USERNAME_HASH =
  process.env.CREATOR_GATE_USERNAME_SHA256 ??
  "147a2508328a3bcb92811be740bcb7d394b70bcd237993424ac56acd129e7eda";
const PASSWORD_HASH =
  process.env.CREATOR_GATE_PASSWORD_SHA256 ??
  "eda79ebe74dfd3d17067cef0a7610caa939f75dc5619619432cef9f4b5c67af7";
const PIN_HASH =
  process.env.CREATOR_GATE_PIN_SHA256 ??
  "ee3c4cb60c12bae69250c88e04459f47031f7bcfe1635dc93227eefc5e5adb69";

type LockState = {
  failedAttempts: number;
  lockedUntil: number;
};

type PendingChallenge = {
  id: string;
  createdAt: number;
};

type CreatorGlobal = typeof globalThis & {
  detoxCreatorLockState?: LockState;
  detoxCreatorPending?: Map<string, PendingChallenge>;
};

const creatorGlobal = globalThis as CreatorGlobal;
const pendingChallenges = creatorGlobal.detoxCreatorPending ?? new Map<string, PendingChallenge>();
creatorGlobal.detoxCreatorPending = pendingChallenges;
creatorGlobal.detoxCreatorLockState = creatorGlobal.detoxCreatorLockState ?? {
  failedAttempts: 0,
  lockedUntil: 0,
};

function getSecret() {
  return (
    process.env.CREATOR_SESSION_SECRET ??
    process.env.NEXTAUTH_SECRET ??
    process.env.ADMIN_SECRET_KEY ??
    "detox-ai-local-creator-session-secret-change-before-production"
  );
}

function hashValue(value: string) {
  return createHmac("sha256", "detox-creator-gate").update(value).digest("hex");
}

function sha256(value: string) {
  return createHash("sha256").update(value).digest("hex");
}

function safeEqual(left: string, right: string) {
  const leftBuffer = Buffer.from(left);
  const rightBuffer = Buffer.from(right);
  return leftBuffer.length === rightBuffer.length && timingSafeEqual(leftBuffer, rightBuffer);
}

function signedPayload(payload: Record<string, unknown>) {
  const encoded = Buffer.from(JSON.stringify(payload)).toString("base64url");
  const signature = createHmac("sha256", getSecret()).update(encoded).digest("base64url");
  return `${encoded}.${signature}`;
}

function readSignedPayload<T>(token?: string | null): T | null {
  if (!token) return null;
  const [encoded, signature] = token.split(".");
  if (!encoded || !signature) return null;
  const expected = createHmac("sha256", getSecret()).update(encoded).digest("base64url");
  if (!safeEqual(signature, expected)) return null;

  try {
    return JSON.parse(Buffer.from(encoded, "base64url").toString("utf8")) as T;
  } catch {
    return null;
  }
}

function getLockState() {
  const lock = creatorGlobal.detoxCreatorLockState!;
  if (lock.lockedUntil && lock.lockedUntil <= Date.now()) {
    lock.failedAttempts = 0;
    lock.lockedUntil = 0;
  }
  return lock;
}

function registerFailedAttempt() {
  const lock = getLockState();
  lock.failedAttempts += 1;
  if (lock.failedAttempts >= MAX_FAILED_ATTEMPTS) {
    lock.lockedUntil = Date.now() + LOCK_TTL_MS;
  }
  return lock;
}

function resetFailedAttempts() {
  const lock = getLockState();
  lock.failedAttempts = 0;
  lock.lockedUntil = 0;
}

export function getCreatorLockStatus() {
  const lock = getLockState();
  return {
    locked: lock.lockedUntil > Date.now(),
    lockedUntil: lock.lockedUntil || null,
    failedAttempts: lock.failedAttempts,
    attemptsRemaining: Math.max(0, MAX_FAILED_ATTEMPTS - lock.failedAttempts),
  };
}

export function verifyCreatorUsernamePassword(username: string, password: string) {
  const lock = getCreatorLockStatus();
  if (lock.locked) {
    return { ok: false, locked: true, lock };
  }

  const usernameOk = safeEqual(sha256(username.trim()), USERNAME_HASH);
  const passwordOk = safeEqual(sha256(password), PASSWORD_HASH);
  if (!usernameOk || !passwordOk) {
    const nextLock = registerFailedAttempt();
    return {
      ok: false,
      locked: nextLock.lockedUntil > Date.now(),
      lock: getCreatorLockStatus(),
    };
  }

  const challenge = {
    id: randomUUID(),
    createdAt: Date.now(),
  };
  pendingChallenges.set(challenge.id, challenge);
  return {
    ok: true,
    pendingToken: signedPayload({ id: challenge.id, stage: "pin", createdAt: challenge.createdAt }),
    lock: getCreatorLockStatus(),
  };
}

export function verifyCreatorPin(pendingToken: string, pin: string) {
  const lock = getCreatorLockStatus();
  if (lock.locked) {
    return { ok: false, locked: true, lock };
  }

  const payload = readSignedPayload<{ id: string; stage: string; createdAt: number }>(pendingToken);
  const challenge = payload?.stage === "pin" ? pendingChallenges.get(payload.id) : null;
  const challengeFresh = challenge && Date.now() - challenge.createdAt <= PENDING_TTL_MS;
  const pinOk = safeEqual(sha256(pin.trim()), PIN_HASH);

  if (!challengeFresh || !pinOk) {
    const nextLock = registerFailedAttempt();
    return {
      ok: false,
      locked: nextLock.lockedUntil > Date.now(),
      lock: getCreatorLockStatus(),
    };
  }

  pendingChallenges.delete(challenge.id);
  resetFailedAttempts();

  return {
    ok: true,
    sessionToken: signedPayload({
      id: hashValue(randomUUID()),
      email: CREATOR_EMAIL,
      stage: "creator",
      createdAt: Date.now(),
      expiresAt: Date.now() + SESSION_TTL_MS,
    }),
    maxAgeSeconds: Math.floor(SESSION_TTL_MS / 1000),
  };
}

export function getCreatorSessionFromRequest(request: Request) {
  const cookie = request.headers
    .get("cookie")
    ?.split(";")
    .map((part) => part.trim())
    .find((part) => part.startsWith(`${SESSION_COOKIE}=`));
  const token = cookie?.slice(`${SESSION_COOKIE}=`.length);
  const session = readSignedPayload<{ email: string; stage: string; expiresAt: number }>(token);
  if (!session || session.stage !== "creator" || session.email !== CREATOR_EMAIL) return null;
  if (session.expiresAt <= Date.now()) return null;
  return session;
}

export function createCreatorSessionCookie(token: string, maxAgeSeconds: number) {
  const secure = process.env.NODE_ENV === "production" ? "; Secure" : "";
  return `${SESSION_COOKIE}=${token}; HttpOnly; SameSite=Strict; Path=/; Max-Age=${maxAgeSeconds}${secure}`;
}

export function clearCreatorSessionCookie() {
  const secure = process.env.NODE_ENV === "production" ? "; Secure" : "";
  return `${SESSION_COOKIE}=; HttpOnly; SameSite=Strict; Path=/; Max-Age=0${secure}`;
}

export async function requireCreatorApi(request: Request) {
  const session = getCreatorSessionFromRequest(request);
  if (!session) {
    return { ok: false as const, response: Response.json({ error: "Creator session required." }, { status: 401 }) };
  }

  const authHeader = request.headers.get("authorization") ?? "";
  const idToken = authHeader.toLowerCase().startsWith("bearer ") ? authHeader.slice(7) : "";
  const verifiedUser = await verifyFirebaseIdToken(idToken);
  if (verifiedUser?.email !== CREATOR_EMAIL) {
    return { ok: false as const, response: Response.json({ error: "Creator Firebase account required." }, { status: 403 }) };
  }

  return {
    ok: true as const,
    idToken,
    uid: verifiedUser.uid,
    email: CREATOR_EMAIL,
  };
}
