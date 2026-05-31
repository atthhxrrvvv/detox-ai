import { clearAdminSession } from "@/lib/cosmicAdmin";

export async function POST(request: Request) {
  clearAdminSession(request.headers.get("authorization"));
  return Response.json({ ok: true });
}
