export async function POST(request: Request) {
  const body = await request.json().catch(() => ({}));
  const message = String(body.message ?? "New Detox chat").trim();
  const title = message.split(/\s+/).slice(0, 7).join(" ");

  return Response.json({ title: title || "New Detox chat" });
}

