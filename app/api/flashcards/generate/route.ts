import { jsonError } from "@/lib/api";
import { generateGroqReply } from "@/lib/groq";
import { verifyFirebaseIdToken } from "@/lib/serverAuth";

type FlashcardResponse = {
  question: string;
  answer: string;
};

function parseJsonArray(text: string) {
  const cleaned = text
    .replace(/^```(?:json)?/i, "")
    .replace(/```$/i, "")
    .trim();
  const start = cleaned.indexOf("[");
  const end = cleaned.lastIndexOf("]");
  if (start === -1 || end === -1) return [];
  try {
    return JSON.parse(cleaned.slice(start, end + 1)) as FlashcardResponse[];
  } catch {
    return [];
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json().catch(() => ({}));
    const verifiedUser = await verifyFirebaseIdToken(String(body.idToken ?? ""));
    if (!verifiedUser?.email) {
      return jsonError("Please sign in before generating AI flashcards.", 401);
    }

    const topic = String(body.topic ?? "").trim().slice(0, 160);
    const classLevel = String(body.classLevel ?? "Class 10").slice(0, 40);
    if (!topic) return jsonError("Topic is required.");

    const reply = await generateGroqReply({
      temperature: 0.55,
      maxTokens: 1200,
      messages: [
        {
          role: "system",
          content:
            "Create student flashcards as JSON only. Return a JSON array of 6 objects. Each object must have question and answer. Keep answers concise, accurate, and exam-friendly.",
        },
        {
          role: "user",
          content: `Create 6 flashcards for ${classLevel} on this topic: ${topic}. Make the questions useful for revision.`,
        },
      ],
    });

    const cards = parseJsonArray(reply.content)
      .filter((card) => card?.question && card?.answer)
      .slice(0, 8);

    if (!cards.length) {
      return jsonError("AI flashcard generation returned unreadable cards.", 502);
    }

    return Response.json({
      cards,
      backendModel: reply.backendModel,
      simulated: reply.simulated,
    });
  } catch (error) {
    return jsonError(error instanceof Error ? error.message : "Flashcard generation failed.", 500);
  }
}
