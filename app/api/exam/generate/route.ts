import { jsonError } from "@/lib/api";
import { generateGroqReply } from "@/lib/groq";
import { verifyFirebaseIdToken } from "@/lib/serverAuth";

type ExamQuestion = {
  type: "mcq" | "short";
  prompt: string;
  options?: string[];
  answer: string;
  explanation: string;
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
    return JSON.parse(cleaned.slice(start, end + 1)) as ExamQuestion[];
  } catch {
    return [];
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json().catch(() => ({}));
    const verifiedUser = await verifyFirebaseIdToken(String(body.idToken ?? ""));
    if (!verifiedUser?.email) {
      return jsonError("Please sign in before generating an AI exam.", 401);
    }

    const subject = String(body.subject ?? "Science").slice(0, 80);
    const classLevel = String(body.classLevel ?? "Class 10").slice(0, 40);
    const topic = String(body.topic ?? "").trim().slice(0, 160);
    const difficulty = String(body.difficulty ?? "medium").slice(0, 20);
    if (!topic) return jsonError("Topic is required.");

    const reply = await generateGroqReply({
      temperature: 0.55,
      maxTokens: 1800,
      messages: [
        {
          role: "system",
          content:
            "You generate student quiz JSON only. Return a JSON array, no markdown, no prose. Each item must have type, prompt, answer, explanation. MCQ items also need exactly four options and the answer must exactly match one option.",
        },
        {
          role: "user",
          content: `Create 6 exam questions for ${classLevel}, subject ${subject}, topic ${topic}, difficulty ${difficulty}. Include 4 MCQs and 2 short-answer questions.`,
        },
      ],
    });

    const questions = parseJsonArray(reply.content)
      .filter((question) => question?.type === "mcq" || question?.type === "short")
      .slice(0, 8);

    if (!questions.length) {
      return jsonError("AI exam generation returned an unreadable quiz.", 502);
    }

    return Response.json({
      questions,
      backendModel: reply.backendModel,
      simulated: reply.simulated,
    });
  } catch (error) {
    return jsonError(error instanceof Error ? error.message : "Exam generation failed.", 500);
  }
}
