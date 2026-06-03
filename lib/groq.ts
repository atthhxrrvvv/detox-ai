export type GroqChatMessage = {
  role: "system" | "user" | "assistant";
  content: string;
};

type GroqChatResponse = {
  choices?: Array<{
    message?: {
      content?: string;
    };
  }>;
  usage?: {
    total_tokens?: number;
  };
};

const groqChatUrl = "https://api.groq.com/openai/v1/chat/completions";
const defaultGroqToolsModel = "llama-3.1-8b-instant";

export async function generateGroqReply({
  messages,
  maxTokens = 1200,
  temperature = 0.7,
}: {
  messages: GroqChatMessage[];
  maxTokens?: number;
  temperature?: number;
}) {
  const apiKey = process.env.GROQ_API_KEY;
  const model = process.env.GROQ_TOOLS_MODEL ?? defaultGroqToolsModel;

  if (!apiKey) {
    return {
      content: "Groq is ready, but GROQ_API_KEY is not configured yet.",
      backendModel: model,
      tokensUsed: 0,
      simulated: true,
    };
  }

  const response = await fetch(groqChatUrl, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      model,
      messages,
      max_tokens: maxTokens,
      temperature: Math.min(1.5, Math.max(0, temperature)),
    }),
    cache: "no-store",
  });

  if (!response.ok) {
    const details = await response.text();
    throw new Error(details || `Groq request failed with ${response.status}.`);
  }

  const data = (await response.json()) as GroqChatResponse;
  return {
    content: data.choices?.[0]?.message?.content?.trim() || "Detox AI tools could not generate a response.",
    backendModel: model,
    tokensUsed: data.usage?.total_tokens ?? 0,
    simulated: false,
  };
}
