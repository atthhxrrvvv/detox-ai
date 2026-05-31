import { jsonError } from "@/lib/api";

export async function POST(request: Request) {
  const body = await request.json().catch(() => ({}));
  const prompt = String(body.prompt ?? "").trim();

  if (!prompt) return jsonError("Prompt is required.");

  return Response.json({
    enhancedPrompt: `Rewrite this request with clear goals, constraints, expected format, and context:\n\n${prompt}`,
  });
}

