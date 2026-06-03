import { getCreatorLockStatus, verifyCreatorUsernamePassword } from "@/lib/creatorSecurity";

function lockResponse(lock: ReturnType<typeof getCreatorLockStatus>) {
  return Response.json(
    {
      error: "Creator gate is locked for 5 hours because of repeated incorrect attempts.",
      lock,
    },
    { status: 423 },
  );
}

export async function GET() {
  return Response.json({ lock: getCreatorLockStatus() });
}

export async function POST(request: Request) {
  const body = await request.json().catch(() => ({}));
  const result = verifyCreatorUsernamePassword(String(body.username ?? ""), String(body.password ?? ""));

  if (!result.ok) {
    if (result.locked) return lockResponse(result.lock);
    return Response.json(
      {
        error: "Incorrect creator username or password.",
        lock: result.lock,
      },
      { status: 401 },
    );
  }

  return Response.json({
    pendingToken: result.pendingToken,
    nextStep: "pin",
    lock: result.lock,
  });
}
