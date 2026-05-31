import { CREATOR_EMAIL } from "@/lib/constants";
import { requireCreator } from "@/lib/creator";

export function getRequestEmail(request: Request) {
  return request.headers.get("x-user-email");
}

export function creatorGuard(request: Request) {
  const email = getRequestEmail(request);
  requireCreator(email);
  return email ?? CREATOR_EMAIL;
}

export function jsonError(error: string, status = 400) {
  return Response.json({ error }, { status });
}

