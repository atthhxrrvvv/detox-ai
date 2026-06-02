export function getRequestEmail(request: Request) {
  return request.headers.get("x-user-email");
}

export function jsonError(error: string, status = 400) {
  return Response.json({ error }, { status });
}
