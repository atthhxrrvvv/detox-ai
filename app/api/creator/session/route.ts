import { getCreatorLockStatus, getCreatorSessionFromRequest } from "@/lib/creatorSecurity";

export async function GET(request: Request) {
  const session = getCreatorSessionFromRequest(request);
  return Response.json({
    authenticated: Boolean(session),
    email: session?.email ?? null,
    lock: getCreatorLockStatus(),
  });
}
