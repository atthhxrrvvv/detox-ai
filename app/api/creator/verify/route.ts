import { requireCreatorApi } from "@/lib/creatorSecurity";

export async function GET(request: Request) {
  const creator = await requireCreatorApi(request);
  if (!creator.ok) return creator.response;

  return Response.json({
    ok: true,
    email: creator.email,
    uid: creator.uid,
  });
}
