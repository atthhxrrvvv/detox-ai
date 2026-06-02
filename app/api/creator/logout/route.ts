import { clearCreatorSessionCookie } from "@/lib/creatorSecurity";

export async function POST() {
  return Response.json(
    { ok: true },
    {
      headers: {
        "Set-Cookie": clearCreatorSessionCookie(),
      },
    },
  );
}
