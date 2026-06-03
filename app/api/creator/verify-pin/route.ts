import { createCreatorSessionCookie, getCreatorLockStatus, verifyCreatorPin } from "@/lib/creatorSecurity";

export async function POST(request: Request) {
  const body = await request.json().catch(() => ({}));
  const result = verifyCreatorPin(String(body.pendingToken ?? ""), String(body.pin ?? ""));

  if (!result.ok) {
    return Response.json(
      {
        error: result.locked ? "Creator gate is locked for 5 hours." : "Incorrect creator PIN.",
        lock: result.lock,
      },
      { status: result.locked ? 423 : 401 },
    );
  }

  if (!result.sessionToken || !result.maxAgeSeconds) {
    return Response.json({ error: "Creator session could not be created." }, { status: 500 });
  }

  return Response.json(
    {
      ok: true,
      lock: getCreatorLockStatus(),
    },
    {
      headers: {
        "Set-Cookie": createCreatorSessionCookie(result.sessionToken, result.maxAgeSeconds),
      },
    },
  );
}
