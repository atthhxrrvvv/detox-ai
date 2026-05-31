export type DetoxMessage = {
  messageId: string;
  chatId: string;
  userId: string;
  userEmail: string;
  role: "user" | "assistant" | "system";
  content: string;
  modelId: string;
  backendModel: string;
  tokensUsed: number;
  createdAt: string;
  isFlagged: boolean;
};

