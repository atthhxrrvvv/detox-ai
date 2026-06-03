import { jsonError } from "@/lib/api";
import { generateGroqReply } from "@/lib/groq";

export async function POST(request: Request) {
  try {
    const body = await request.json().catch(() => ({}));
    const prompt = String(body.prompt ?? "").trim();

    if (!prompt) return jsonError("Prompt is required.");

    const reply = await generateGroqReply({
      temperature: 0.45,
      maxTokens: 700,
      messages: [
        {
          role: "system",
          content:
            "Rewrite user prompts into clearer, stronger prompts. Keep the user's intent, add useful constraints, expected format, and relevant context. Return only the improved prompt.",
        },
        {
          role: "user",
          content: prompt,
        },
      ],
    });

    return Response.json({
      enhancedPrompt: reply.content,
      backendModel: reply.backendModel,
      tokensUsed: reply.tokensUsed,
    });
  } catch (error) {
    return jsonError(error instanceof Error ? error.message : "Prompt enhancement failed.", 500);
  }
}
