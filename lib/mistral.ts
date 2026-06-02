import { Mistral } from "@mistralai/mistralai";
import { getDetoxModel } from "@/lib/models";
import { SYSTEM_PROMPTS } from "@/lib/prompts";

export type DetoxChatEngineMessage = {
  role: "user" | "assistant";
  content: string;
};

export async function generateMistralReply(
  modelId: string,
  content: string,
  history: DetoxChatEngineMessage[] = [],
  temperature = 0.7,
) {
  const model = getDetoxModel(modelId);
  if (!model) {
    throw new Error("Unknown Detox AI model.");
  }

  if (!process.env.MISTRAL_API_KEY) {
    return {
      content: `${model.displayName} is ready, but the private AI service key is not configured yet. Add it to .env.local to enable live AI responses.`,
      backendModel: model.backendModel,
      tokensUsed: 0,
      simulated: true,
    };
  }

  const client = new Mistral({ apiKey: process.env.MISTRAL_API_KEY });
  const safeTemperature = Math.min(1.5, Math.max(0.5, temperature));
  const response = await client.chat.complete({
    model: model.backendModel,
    maxTokens: model.maxTokens,
    temperature: safeTemperature,
    messages: [
      { role: "system", content: SYSTEM_PROMPTS[model.id] },
      ...history.slice(-12).map((message) => ({
        role: message.role,
        content: message.content,
      })),
      { role: "user", content },
    ],
  });

  const first = response.choices?.[0]?.message?.content;
  const text = Array.isArray(first)
    ? first.map((part) => ("text" in part ? part.text : "")).join("")
    : first ?? "";

  return {
    content: text || "Detox AI could not generate a response.",
    backendModel: model.backendModel,
    tokensUsed: response.usage?.totalTokens ?? 0,
    simulated: false,
  };
}
