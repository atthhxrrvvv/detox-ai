import { jsonError } from "@/lib/api";
import { generateGroqReply } from "@/lib/groq";
import { verifyFirebaseIdToken } from "@/lib/serverAuth";

export async function POST(request: Request) {
  try {
    const body = await request.json().catch(() => ({}));
    const verifiedUser = await verifyFirebaseIdToken(String(body.idToken ?? ""));
    if (!verifiedUser?.email) {
      return jsonError("Please sign in before using Detox AI tools.", 401);
    }

    const title = String(body.title ?? "Detox AI Tool").slice(0, 120);
    const prompt = String(body.prompt ?? "").trim();
    const input = String(body.input ?? "").trim();
    if (!prompt || !input) return jsonError("Tool prompt and details are required.");

    const reply = await generateGroqReply({
      temperature: 0.75,
      maxTokens: 1400,
      messages: [
        {
          role: "system",
          content:
            "You are Detox AI Tools. Produce practical, polished, ready-to-use outputs. Keep formatting clean, use concise headings when helpful, and do not mention internal model providers.",
        },
        {
          role: "user",
          content: `Tool: ${title}\n\nInstruction:\n${prompt}\n\nUser details:\n${input}`,
        },
      ],
    });

    return Response.json({
      reply: reply.content,
      backendModel: reply.backendModel,
      tokensUsed: reply.tokensUsed,
      simulated: reply.simulated,
    });
  } catch (error) {
    return jsonError(error instanceof Error ? error.message : "Detox AI tools failed.", 500);
  }
}
