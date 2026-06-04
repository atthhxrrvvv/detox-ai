"use client";

import Link from "next/link";
import { useEffect, useMemo, useRef, useState } from "react";
import {
  Bell,
  BookOpen,
  Bot,
  Code2,
  Copy,
  Crown,
  FileText,
  FileUp,
  Folder,
  Home,
  Lock,
  LogOut,
  MessageSquare,
  Mic,
  MoreHorizontal,
  PanelLeft,
  Plus,
  RefreshCcw,
  Search,
  Send,
  SlidersHorizontal,
  Sparkles,
  Square,
  Star,
  UserRound,
  Trash2,
  Wand2,
  Wrench,
  X,
} from "lucide-react";
import { onAuthStateChanged, signOut, type User } from "firebase/auth";
import { collection, doc, getDoc, getDocs, increment, query, serverTimestamp, setDoc, where } from "firebase/firestore";
import { AppLogo } from "@/components/AppLogo";
import { CREATOR_EMAIL } from "@/lib/constants";
import { auth, db } from "@/lib/firebase";
import { PLAN_LIMITS, type PlanId } from "@/lib/limits";
import { DETOX_MODELS, type DetoxModel } from "@/lib/models";

type ChatMessage = {
  id: string;
  role: "user" | "assistant";
  content: string;
  modelId?: string;
  createdAt: string;
};

type ChatThread = {
  id: string;
  title: string;
  createdAt: string;
  updatedAt: string;
  messages: ChatMessage[];
};

const STORAGE_KEY = "detox-ai-working-chats";
const HIGH_TEMP_USAGE_KEY = "detox-ai-high-temp-usage";

type HighTemperatureUsage = {
  used: number;
  cycleStartedAt: string;
  resetUsedMonth: string;
};

const promptChips = [
  "Explain Docker in simple terms",
  "Debug this code step by step",
  "Create a 7 day study plan",
  "Plan a startup landing page",
];

const navItems = [
  { label: "Home", icon: Home, href: "/chat" },
  { label: "Chats", icon: MessageSquare, href: "/chat" },
  { label: "Models", icon: Bot, href: "/pricing" },
  { label: "AI Tools", icon: Wrench, href: "/tools" },
  { label: "Projects", icon: Folder, href: "/dashboard" },
  { label: "Prompt Enhancer", icon: Wand2, href: "/tools" },
  { label: "Upgrade Plan", icon: Star, href: "/pricing" },
];

const toolPrompts = [
  ["Code Generator", "Write clean code for: ", Code2],
  ["Study Helper", "Teach me this topic with notes, examples, and quiz questions: ", BookOpen],
  ["Content Writer", "Write polished content for: ", FileText],
  ["Website Planner", "Create a practical website plan for: ", Bot],
  ["Prompt Enhancer", "Improve this prompt: ", Sparkles],
];

function createThread(): ChatThread {
  const now = new Date().toISOString();
  return {
    id: crypto.randomUUID(),
    title: "New Chat",
    createdAt: now,
    updatedAt: now,
    messages: [],
  };
}

type StoredDateValue = Date | string | { toDate?: () => Date } | null | undefined;

function getChatStorageKey(uid?: string | null) {
  return uid ? `${STORAGE_KEY}-${uid}` : STORAGE_KEY;
}

function toIsoDate(value: StoredDateValue, fallback = new Date().toISOString()) {
  if (!value) return fallback;
  if (value instanceof Date) return Number.isNaN(value.getTime()) ? fallback : value.toISOString();
  if (typeof value === "string") {
    const parsed = new Date(value);
    return Number.isNaN(parsed.getTime()) ? fallback : parsed.toISOString();
  }
  const converted = value.toDate?.();
  return converted && !Number.isNaN(converted.getTime()) ? converted.toISOString() : fallback;
}

function loadThreads(storageKey = STORAGE_KEY) {
  if (typeof window === "undefined") return [createThread()];

  try {
    const stored = window.localStorage.getItem(storageKey);
    if (!stored) return [createThread()];
    const parsed = JSON.parse(stored) as ChatThread[];
    return parsed.length ? parsed : [createThread()];
  } catch {
    return [createThread()];
  }
}

async function loadAccountThreads(user: User) {
  const [chatSnapshot, messageSnapshot] = await Promise.all([
    getDocs(query(collection(db, "chats"), where("userId", "==", user.uid))),
    getDocs(query(collection(db, "messages"), where("userId", "==", user.uid))),
  ]);

  const messagesByChat = new Map<string, ChatMessage[]>();

  messageSnapshot.forEach((messageDoc) => {
    const data = messageDoc.data();
    const chatId = typeof data.chatId === "string" ? data.chatId : "";
    const role = data.role === "assistant" ? "assistant" : data.role === "user" ? "user" : null;
    const content = typeof data.content === "string" ? data.content : "";
    if (!chatId || !role || !content) return;

    const message: ChatMessage = {
      id: typeof data.messageId === "string" ? data.messageId : messageDoc.id,
      role,
      content,
      modelId: typeof data.modelId === "string" ? data.modelId : undefined,
      createdAt: toIsoDate(data.createdAt as StoredDateValue),
    };
    messagesByChat.set(chatId, [...(messagesByChat.get(chatId) ?? []), message]);
  });

  const remoteThreads = chatSnapshot.docs
    .map((chatDoc): ChatThread | null => {
      const data = chatDoc.data();
      if (data.isDeleted) return null;
      const chatMessages = (messagesByChat.get(chatDoc.id) ?? []).sort(
        (left, right) => new Date(left.createdAt).getTime() - new Date(right.createdAt).getTime(),
      );

      return {
        id: typeof data.chatId === "string" ? data.chatId : chatDoc.id,
        title: typeof data.title === "string" && data.title.trim() ? data.title : "New Chat",
        createdAt: toIsoDate(data.createdAt as StoredDateValue),
        updatedAt: toIsoDate((data.updatedAt ?? data.lastMessageAt) as StoredDateValue),
        messages: chatMessages,
      };
    })
    .filter((thread): thread is ChatThread => Boolean(thread))
    .sort((left, right) => new Date(right.updatedAt).getTime() - new Date(left.updatedAt).getTime());

  return remoteThreads.length ? remoteThreads : [createThread()];
}

function titleFromMessage(message: string) {
  return message
    .replace(/\s+/g, " ")
    .trim()
    .split(" ")
    .slice(0, 6)
    .join(" ") || "New Chat";
}

function formatTime(value: string) {
  return new Intl.DateTimeFormat("en-IN", {
    hour: "2-digit",
    minute: "2-digit",
  }).format(new Date(value));
}

function getMonthKey(date = new Date()) {
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}`;
}

function loadHighTemperatureUsage(): HighTemperatureUsage {
  const now = new Date();
  const fallback = {
    used: 0,
    cycleStartedAt: now.toISOString(),
    resetUsedMonth: "",
  };

  if (typeof window === "undefined") return fallback;

  try {
    const stored = window.localStorage.getItem(HIGH_TEMP_USAGE_KEY);
    if (!stored) return fallback;

    const parsed = JSON.parse(stored) as HighTemperatureUsage;
    const currentMonth = getMonthKey(now);
    const cycleMonth = getMonthKey(new Date(parsed.cycleStartedAt));
    if (cycleMonth !== currentMonth) {
      return {
        used: 0,
        cycleStartedAt: now.toISOString(),
        resetUsedMonth: "",
      };
    }

    const cycleAgeMs = now.getTime() - new Date(parsed.cycleStartedAt).getTime();
    const canUseWeeklyReset = parsed.resetUsedMonth !== currentMonth;

    if (cycleAgeMs >= 7 * 24 * 60 * 60 * 1000 && canUseWeeklyReset) {
      return {
        used: 0,
        cycleStartedAt: now.toISOString(),
        resetUsedMonth: currentMonth,
      };
    }

    return parsed;
  } catch {
    return fallback;
  }
}

function temperatureLabel(value: number) {
  if (value <= 1) return "Medium thinking";
  if (value <= 1.5) return "Deep thinking";
  return "Extreme thinking";
}

function normalizePlan(value: unknown): PlanId {
  return value === "lite" ||
    value === "go" ||
    value === "pro" ||
    value === "premium" ||
    value === "ultimate" ||
    value === "creator"
    ? value
    : "free";
}

function dateFromUnknown(value: unknown) {
  if (!value) return null;
  if (typeof value === "string") {
    const parsed = new Date(value);
    return Number.isNaN(parsed.getTime()) ? null : parsed;
  }
  if (typeof value === "object" && "toDate" in value && typeof value.toDate === "function") {
    return value.toDate();
  }
  return null;
}

export function ChatExperience() {
  const [threads, setThreads] = useState<ChatThread[]>(loadThreads);
  const [activeThreadId, setActiveThreadId] = useState(() => threads[0]?.id ?? "");
  const [selectedModel, setSelectedModel] = useState("flash-1.0");
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [upgradeNotice, setUpgradeNotice] = useState("");
  const [researchMode, setResearchMode] = useState(false);
  const [attachments, setAttachments] = useState<string[]>([]);
  const [copiedId, setCopiedId] = useState("");
  const [temperature, setTemperature] = useState(0.7);
  const [highTempUsage, setHighTempUsage] = useState<HighTemperatureUsage>(loadHighTemperatureUsage);
  const [notice, setNotice] = useState("");
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);
  const [isTuningOpen, setIsTuningOpen] = useState(false);
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [accountPlan, setAccountPlan] = useState<PlanId>("free");
  const [isAuthReady, setIsAuthReady] = useState(false);
  const [isRemoteChatsLoading, setIsRemoteChatsLoading] = useState(false);
  const [chatSearch, setChatSearch] = useState("");
  const [isAccountMenuOpen, setIsAccountMenuOpen] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const userPlan: PlanId = currentUser?.email === CREATOR_EMAIL ? "creator" : accountPlan;
  const planLimits = PLAN_LIMITS[userPlan];
  const activeThread = threads.find((thread) => thread.id === activeThreadId) ?? threads[0];
  const messages = activeThread?.messages ?? [];
  const filteredThreads = useMemo(() => {
    const query = chatSearch.trim().toLowerCase();
    if (!query) return threads;

    return threads.filter((thread) => {
      const titleMatch = thread.title.toLowerCase().includes(query);
      const messageMatch = thread.messages.some((message) => message.content.toLowerCase().includes(query));
      return titleMatch || messageMatch;
    });
  }, [chatSearch, threads]);
  const activeModel = useMemo(
    () => DETOX_MODELS.find((model) => model.id === selectedModel) ?? DETOX_MODELS[0],
    [selectedModel],
  );
  const dailyUsed = messages.filter((message) => message.role === "user").length;
  const monthlyUsed = threads.reduce(
    (count, thread) => count + thread.messages.filter((message) => message.role === "user").length,
    0,
  );
  const highTemperatureMode = temperature > 1;
  const effectiveDailyLimit = highTemperatureMode
    ? Math.max(1, Math.floor(planLimits.dailyMessages / 2))
    : planLimits.dailyMessages;
  const effectiveMonthlyLimit = highTemperatureMode
    ? Math.max(1, Math.floor(planLimits.monthlyMessages / 2))
    : planLimits.monthlyMessages;
  const highTemperatureLimit = Math.max(1, Math.floor(planLimits.monthlyMessages / 2));
  const resetDate = new Date(highTempUsage.cycleStartedAt);
  resetDate.setDate(resetDate.getDate() + 7);

  useEffect(() => {
    window.localStorage.setItem(getChatStorageKey(currentUser?.uid), JSON.stringify(threads));
  }, [threads, currentUser?.uid]);

  useEffect(() => {
    let isMounted = true;

    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (!isMounted) return;
      setCurrentUser(user);
      setIsAuthReady(true);

      if (!user) {
        setAccountPlan("free");
        const blankThread = createThread();
        setThreads([blankThread]);
        setActiveThreadId(blankThread.id);
        setIsRemoteChatsLoading(false);
        return;
      }

      const cachedThreads = loadThreads(getChatStorageKey(user.uid));
      setThreads(cachedThreads);
      setActiveThreadId(cachedThreads[0]?.id ?? "");
      setIsRemoteChatsLoading(true);

      try {
        const [snapshot, accountThreads] = await Promise.all([
          getDoc(doc(db, "users", user.uid)),
          loadAccountThreads(user),
        ]);
        const profileData = snapshot.data();
        const defaultModel = profileData?.defaultModel;
        if (isMounted && typeof defaultModel === "string" && DETOX_MODELS.some((model) => model.id === defaultModel && model.enabled)) {
          setSelectedModel(defaultModel);
        }
        if (isMounted) {
          const storedPlan = user.email === CREATOR_EMAIL ? "creator" : normalizePlan(profileData?.plan);
          const expiresAt = dateFromUnknown(profileData?.planExpiresAt);
          const paidPlanExpired = storedPlan !== "free" && storedPlan !== "creator" && expiresAt && expiresAt.getTime() <= Date.now();

          if (paidPlanExpired) {
            setAccountPlan("free");
            await setDoc(
              doc(db, "users", user.uid),
              {
                previousPlan: storedPlan,
                plan: "free",
                planStatus: "expired",
                updatedAt: serverTimestamp(),
              },
              { merge: true },
            );
          } else {
            setAccountPlan(storedPlan);
          }
        }
        if (isMounted) {
          setThreads(accountThreads);
          setActiveThreadId(accountThreads[0]?.id ?? "");
          window.localStorage.setItem(getChatStorageKey(user.uid), JSON.stringify(accountThreads));
        }
      } catch {
        // Profile preferences and cloud chat history are optional; chat still works locally.
      } finally {
        if (isMounted) setIsRemoteChatsLoading(false);
      }
    });

    return () => {
      isMounted = false;
      unsubscribe();
    };
  }, []);

  useEffect(() => {
    window.localStorage.setItem(HIGH_TEMP_USAGE_KEY, JSON.stringify(highTempUsage));
  }, [highTempUsage]);

  function updateActiveThread(updater: (thread: ChatThread) => ChatThread) {
    setThreads((current) =>
      current.map((thread) => (thread.id === activeThread.id ? updater(thread) : thread)),
    );
  }

  function showNotice(message: string) {
    setNotice(message);
    window.setTimeout(() => setNotice(""), 2600);
  }

  async function confirmLogout() {
    if (!window.confirm("Do you really want to log out of Detox AI?")) return;
    setIsAccountMenuOpen(false);
    await signOut(auth);
  }

  function isModelLocked(model: DetoxModel) {
    const allowed = planLimits.allowedModels as readonly string[];
    return !allowed.includes("all") && !allowed.includes(model.id);
  }

  function requiredPlanForModel(modelId: string) {
    const order: PlanId[] = ["lite", "go", "pro", "premium", "ultimate"];
    return order.find((plan) => (PLAN_LIMITS[plan].allowedModels as readonly string[]).includes(modelId)) ?? "ultimate";
  }

  function handleModelSelect(modelId: string) {
    const model = DETOX_MODELS.find((item) => item.id === modelId);
    if (!model) return;

    if (isModelLocked(model)) {
      setUpgradeNotice(`Upgrade to ${requiredPlanForModel(model.id)} to unlock ${model.displayName}.`);
      return;
    }

    setUpgradeNotice("");
    setSelectedModel(model.id);
  }

  function startNewChat() {
    const thread = createThread();
    setThreads((current) => [thread, ...current]);
    setActiveThreadId(thread.id);
    setInput("");
    setUpgradeNotice("");
    setIsMobileSidebarOpen(false);
  }

  async function deleteChat(threadId: string) {
    setThreads((current) => {
      const next = current.filter((thread) => thread.id !== threadId);
      if (!next.length) return [createThread()];
      if (threadId === activeThreadId) setActiveThreadId(next[0].id);
      return next;
    });

    if (!currentUser) return;

    try {
      await setDoc(
        doc(db, "chats", threadId),
        {
          isDeleted: true,
          deletedAt: serverTimestamp(),
          updatedAt: serverTimestamp(),
        },
        { merge: true },
      );
    } catch {
      showNotice("Chat removed here. Cloud delete will retry when saved again.");
    }
  }

  async function copyText(text: string, id: string) {
    await navigator.clipboard.writeText(text);
    setCopiedId(id);
    window.setTimeout(() => setCopiedId(""), 1200);
  }

  async function enhancePrompt() {
    const trimmed = input.trim();
    if (!trimmed || isLoading) {
      showNotice("Type a prompt first, then I can enhance it.");
      return;
    }

    const response = await fetch("/api/enhance-prompt", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ prompt: trimmed }),
    });
    const data = await response.json();
    setInput(data.enhancedPrompt ?? trimmed);
    showNotice("Prompt enhanced.");
  }

  async function sendMessage(text = input, appendUser = true) {
    const trimmed = text.trim();
    if (!trimmed || isLoading || !activeThread) return;

    if (!currentUser) {
      setUpgradeNotice("Please login or create an account before messaging Detox AI.");
      return;
    }

    if (dailyUsed >= effectiveDailyLimit || monthlyUsed >= effectiveMonthlyLimit) {
      setUpgradeNotice(
        highTemperatureMode
          ? "High-temperature mode halves your message limits. Lower the temperature or upgrade your plan."
          : "You reached your current message limit. Upgrade your plan to continue.",
      );
      return;
    }

    if (highTemperatureMode && highTempUsage.used >= highTemperatureLimit) {
      setUpgradeNotice(
        `Extreme/deep thinking limit reached. It resets on ${resetDate.toLocaleDateString("en-IN")} if your monthly weekly-reset is still available, otherwise next month.`,
      );
      return;
    }

    const model = DETOX_MODELS.find((item) => item.id === selectedModel);
    if (model && isModelLocked(model)) {
      setUpgradeNotice(`Upgrade to ${requiredPlanForModel(model.id)} to unlock ${model.displayName}.`);
      return;
    }

    const now = new Date().toISOString();
    const userMessage: ChatMessage = {
      id: crypto.randomUUID(),
      role: "user",
      content: attachments.length
        ? `${trimmed}\n\nAttached files: ${attachments.join(", ")}`
        : trimmed,
      modelId: selectedModel,
      createdAt: now,
    };

    if (appendUser) {
      updateActiveThread((thread) => ({
        ...thread,
        title: thread.messages.length ? thread.title : titleFromMessage(trimmed),
        updatedAt: now,
        messages: [...thread.messages, userMessage],
      }));
    }

    setInput("");
    setAttachments([]);
    setIsLoading(true);

    try {
      const idToken = await currentUser.getIdToken();
      const currentHistory = appendUser ? messages : messages.slice(0, -1);
      const response = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          message: trimmed,
          modelId: selectedModel,
          history: currentHistory.map((message) => ({
            role: message.role,
            content: message.content,
          })),
          user: {
            email: currentUser.email,
            plan: userPlan,
            dailyMessages: dailyUsed,
            monthlyMessages: monthlyUsed,
          },
          idToken,
          researchMode,
          temperature,
        }),
      });
      const data = await response.json();
      const assistantMessage: ChatMessage = {
        id: crypto.randomUUID(),
        role: "assistant",
        modelId: selectedModel,
        content: data.reply ?? data.error ?? "Detox AI could not respond.",
        createdAt: new Date().toISOString(),
      };

      updateActiveThread((thread) => ({
        ...thread,
        updatedAt: assistantMessage.createdAt,
        messages: [...thread.messages, assistantMessage],
      }));
      if (highTemperatureMode) {
        setHighTempUsage((current) => ({
          ...current,
          used: current.used + 1,
        }));
      }
      if (response.ok) {
        void recordUsage(userMessage, assistantMessage, data.tokensUsed ?? 0);
      }
    } catch {
      updateActiveThread((thread) => ({
        ...thread,
        updatedAt: new Date().toISOString(),
        messages: [
          ...thread.messages,
          {
            id: crypto.randomUUID(),
            role: "assistant",
            modelId: selectedModel,
            content: "Detox AI could not reach the chat API. Check your dev server and API key.",
            createdAt: new Date().toISOString(),
          },
        ],
      }));
    } finally {
      setIsLoading(false);
    }
  }

  async function recordUsage(userMessage: ChatMessage, assistantMessage: ChatMessage, tokensUsed: number) {
    if (!currentUser || !activeThread) return;

    try {
      const now = serverTimestamp();
      const userEmail = currentUser.email ?? "";
      const chatRef = doc(db, "chats", activeThread.id);
      await setDoc(
        doc(db, "users", currentUser.uid),
        {
          uid: currentUser.uid,
          name: currentUser.displayName ?? userEmail,
          email: userEmail,
          photoURL: currentUser.photoURL,
          role: currentUser.email === CREATOR_EMAIL ? "creator" : "free",
          plan: userPlan,
          isCreator: currentUser.email === CREATOR_EMAIL,
          isBanned: false,
          lastActive: now,
          dailyMessages: increment(1),
          monthlyMessages: increment(1),
          totalMessages: increment(1),
          tokensUsed: increment(Number(tokensUsed) || 0),
        },
        { merge: true },
      );
      await setDoc(
        chatRef,
        {
          chatId: activeThread.id,
          userId: currentUser.uid,
          userEmail,
          title: activeThread.title === "New Chat" ? titleFromMessage(userMessage.content) : activeThread.title,
          modelId: selectedModel,
          createdAt: activeThread.createdAt,
          updatedAt: now,
          messageCount: increment(2),
          lastMessageAt: now,
          isDeleted: false,
        },
        { merge: true },
      );
      await setDoc(
        doc(db, "messages", userMessage.id),
        {
          ...userMessage,
          messageId: userMessage.id,
          chatId: activeThread.id,
          userId: currentUser.uid,
          userEmail,
          createdAt: now,
        },
        { merge: true },
      );
      await setDoc(
        doc(db, "messages", assistantMessage.id),
        {
          ...assistantMessage,
          messageId: assistantMessage.id,
          chatId: activeThread.id,
          userId: currentUser.uid,
          userEmail,
          tokensUsed: Number(tokensUsed) || 0,
          createdAt: now,
        },
        { merge: true },
      );
    } catch (error) {
      console.error("Detox AI: Could not save chat to Firestore.", error);
    }
  }

  function regenerateLastAnswer() {
    const lastUser = [...messages].reverse().find((message) => message.role === "user");
    if (!lastUser) return;

    updateActiveThread((thread) => ({
      ...thread,
      messages: thread.messages.at(-1)?.role === "assistant" ? thread.messages.slice(0, -1) : thread.messages,
    }));
    void sendMessage(lastUser.content, false);
  }

  function explainLastAnswer() {
    const lastAssistant = [...messages].reverse().find((message) => message.role === "assistant");
    if (!lastAssistant) return;
    setInput(`Explain this in simpler words and give an example:\n\n${lastAssistant.content}`);
  }

  function runQuickTool(title: string, prompt: string) {
    const topic = input.trim();
    const quickPrompt = topic
      ? `${prompt}${topic}`
      : `${prompt}Give me a strong, practical starter result for ${title}. Include clear sections, examples, and next steps.`;
    void sendMessage(quickPrompt);
  }

  function useVoicePlaceholder() {
    setInput((current) => current || "Voice note placeholder: ");
    showNotice("Voice input UI is ready. Browser speech capture can be connected next.");
  }

  function clearAttachments() {
    setAttachments([]);
    showNotice("Attachments cleared.");
  }

  function renderMessageContent(message: ChatMessage) {
    const parts = message.content.split(/```/g);
    return parts.map((part, index) => {
      if (index % 2 === 1) {
        return (
          <div key={`${message.id}-${index}`} className="my-3 overflow-hidden rounded-xl border border-white/10 bg-[#020713]">
            <div className="flex items-center justify-between border-b border-white/10 px-3 py-2 text-xs text-slate-400">
              <span>code</span>
              <button onClick={() => copyText(part, `${message.id}-code`)} className="inline-flex items-center gap-1 hover:text-white">
                <Copy size={13} />
                {copiedId === `${message.id}-code` ? "Copied" : "Copy"}
              </button>
            </div>
            <pre className="overflow-x-auto p-3 text-sm leading-6 text-slate-200">
              <code>{part}</code>
            </pre>
          </div>
        );
      }

      return (
        <p key={`${message.id}-${index}`} className="whitespace-pre-wrap leading-7">
          {part}
        </p>
      );
    });
  }

  return (
    <div className="h-screen overflow-hidden bg-[#020713] text-white">
      <input
        ref={fileInputRef}
        type="file"
        multiple
        className="hidden"
        onChange={(event) => setAttachments(Array.from(event.target.files ?? []).map((file) => file.name))}
      />
      {isMobileSidebarOpen ? (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm lg:hidden">
          <div className="flex h-full w-[84vw] max-w-sm flex-col border-r border-white/10 bg-[#050b18] p-5 shadow-2xl">
            <div className="mb-5 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <AppLogo size={42} className="rounded-xl" />
                <span className="font-semibold">Detox AI</span>
              </div>
              <button onClick={() => setIsMobileSidebarOpen(false)} className="grid size-10 place-items-center rounded-xl border border-white/10">
                <X size={18} />
              </button>
            </div>
            <button onClick={startNewChat} className="flex h-11 w-full items-center justify-center gap-2 rounded-xl bg-blue-500 text-sm font-semibold">
              <Plus size={17} />
              New Chat
            </button>
            <div className="mt-4 flex h-10 items-center gap-2 rounded-xl border border-white/10 bg-black/20 px-3 text-slate-400">
              <Search size={15} />
              <input
                value={chatSearch}
                onChange={(event) => setChatSearch(event.target.value)}
                placeholder="Search chats"
                className="min-w-0 flex-1 bg-transparent text-sm text-white outline-none placeholder:text-slate-600"
              />
            </div>
            <div className="detox-scrollbar mt-4 min-h-0 flex-1 space-y-1 overflow-y-auto pr-1">
              {filteredThreads.map((thread) => (
                <button
                  key={thread.id}
                  onClick={() => {
                    setActiveThreadId(thread.id);
                    setIsMobileSidebarOpen(false);
                  }}
                  className={`w-full rounded-xl px-3 py-3 text-left text-sm ${thread.id === activeThreadId ? "bg-blue-500/20 text-white" : "text-slate-400"}`}
                >
                  {thread.title}
                </button>
              ))}
              {!filteredThreads.length ? (
                <p className="rounded-xl border border-white/10 bg-white/5 p-3 text-sm text-slate-500">No chats found.</p>
              ) : null}
            </div>
          </div>
        </div>
      ) : null}

      {isTuningOpen ? (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm xl:hidden">
          <div className="ml-auto h-full w-[86vw] max-w-sm border-l border-white/10 bg-[#050b18] p-5 shadow-2xl">
            <div className="mb-5 flex items-center justify-between">
              <div>
                <p className="text-sm uppercase tracking-[0.2em] text-cyan-200">AI Tuning</p>
                <h2 className="text-xl font-semibold text-white">Temperature</h2>
              </div>
              <button onClick={() => setIsTuningOpen(false)} className="grid size-10 place-items-center rounded-xl border border-white/10">
                <X size={18} />
              </button>
            </div>
            <div className="rounded-2xl border border-cyan-300/15 bg-[#091221]/92 p-4">
              <div className="mb-4 flex items-center justify-between">
                <span className="text-sm font-semibold text-slate-200">{temperatureLabel(temperature)}</span>
                <span className="rounded-lg border border-cyan-300/20 bg-cyan-300/10 px-2 py-1 text-sm font-semibold text-cyan-100">{temperature.toFixed(2)}</span>
              </div>
              <input
                aria-label="Mobile AI temperature"
                type="range"
                min="0.5"
                max="2"
                step="0.05"
                value={temperature}
                onChange={(event) => setTemperature(Number(event.target.value))}
                className="h-2 w-full accent-cyan-300"
              />
              <div className="mt-3 grid grid-cols-4 gap-2 text-center text-[11px] text-slate-500">
                <span>0.5</span>
                <span>1.0</span>
                <span>1.5</span>
                <span>2.0</span>
              </div>
              <p className="mt-4 text-xs leading-5 text-slate-400">
                Higher than 1.00 unlocks deeper thinking and uses half of your message limits.
              </p>
            </div>
          </div>
        </div>
      ) : null}

      <div className="grid h-screen overflow-hidden xl:grid-cols-[300px_1fr_330px] lg:grid-cols-[280px_1fr]">
        <aside className="hidden h-screen border-r border-white/10 bg-[#050b18]/96 p-5 lg:flex lg:flex-col">
          <Link href="/" className="flex items-center gap-3">
            <AppLogo size={50} className="rounded-2xl" />
            <span>
              <span className="block text-xl font-semibold text-white">Detox AI</span>
              <span className="text-xs text-slate-400">A real working AI workspace</span>
            </span>
          </Link>

          <button onClick={startNewChat} className="mt-7 flex h-12 items-center justify-between rounded-xl bg-gradient-to-r from-[#573cff] to-[#2058ff] px-4 text-sm font-semibold text-white">
            <span className="flex items-center gap-3">
              <Plus size={18} />
              New Chat
            </span>
            <kbd className="rounded-lg border border-white/10 bg-black/25 px-2 py-1 text-xs">Ctrl K</kbd>
          </button>

          <nav className="mt-5 grid gap-1.5">
            {navItems.map((item) => {
              const Icon = item.icon;
              return (
                <Link key={item.label} href={item.href} className="flex h-10 items-center gap-3 rounded-xl px-3 text-sm text-slate-400 transition hover:bg-white/6 hover:text-white">
                  <Icon size={17} />
                  {item.label}
                </Link>
              );
            })}
          </nav>

          <div className="mt-6 min-h-0 flex-1 border-t border-white/10 pt-5">
            <div className="mb-3 flex items-center justify-between text-xs">
              <span className="font-medium text-slate-300">Saved Chats</span>
              <span className="text-slate-500">{filteredThreads.length}</span>
            </div>
            <div className="mb-3 flex h-10 items-center gap-2 rounded-xl border border-white/10 bg-black/20 px-3 text-slate-500">
              <Search size={15} />
              <input
                value={chatSearch}
                onChange={(event) => setChatSearch(event.target.value)}
                placeholder="Search chats"
                className="min-w-0 flex-1 bg-transparent text-sm text-white outline-none placeholder:text-slate-600"
              />
            </div>
            <div className="detox-scrollbar h-full min-h-0 space-y-1 overflow-y-auto pr-1">
              {filteredThreads.map((thread) => (
                <button
                  key={thread.id}
                  onClick={() => setActiveThreadId(thread.id)}
                  className={`group flex w-full items-center gap-2 rounded-xl px-2.5 py-2.5 text-left text-sm transition ${
                    thread.id === activeThreadId ? "bg-blue-500/14 text-white" : "text-slate-400 hover:bg-white/6 hover:text-white"
                  }`}
                >
                  <MessageSquare size={14} className="shrink-0" />
                  <span className="min-w-0 flex-1">
                    <span className="block truncate">{thread.title}</span>
                    <span className="text-[11px] text-slate-600">{formatTime(thread.updatedAt)}</span>
                  </span>
                  <span
                    role="button"
                    tabIndex={0}
                    onClick={(event) => {
                      event.stopPropagation();
                      deleteChat(thread.id);
                    }}
                    onKeyDown={(event) => {
                      if (event.key === "Enter") deleteChat(thread.id);
                    }}
                    className="rounded-lg p-1 text-slate-600 opacity-0 hover:bg-red-400/10 hover:text-red-200 group-hover:opacity-100"
                  >
                    <Trash2 size={14} />
                  </span>
                </button>
              ))}
              {!filteredThreads.length ? (
                <p className="rounded-xl border border-white/10 bg-white/5 p-3 text-sm text-slate-500">No chats found.</p>
              ) : null}
            </div>
          </div>
        </aside>

        <main className="relative flex h-screen min-h-0 flex-col overflow-hidden border-r border-white/10 bg-[#020713]">
          <header className="z-30 shrink-0 border-b border-white/10 bg-[#050b18]/88 px-4 py-3 backdrop-blur-xl">
            <div className="flex items-center gap-3">
              <button onClick={() => setIsMobileSidebarOpen(true)} className="grid size-10 place-items-center rounded-xl border border-white/10 text-slate-200 lg:hidden" aria-label="Open history">
                <PanelLeft size={18} />
              </button>
              <AppLogo size={38} className="rounded-xl lg:hidden" />
              <div className="min-w-0 flex-1 sm:flex-none">
                <select
                  value={selectedModel}
                  onChange={(event) => handleModelSelect(event.target.value)}
                  className="h-10 w-full min-w-0 rounded-xl border border-white/10 bg-black/20 px-3 text-sm text-white outline-none sm:w-[330px]"
                  aria-label="Select Detox AI model"
                >
                  {DETOX_MODELS.map((model) => (
                    <option key={model.id} value={model.id} disabled={isModelLocked(model)} className="bg-slate-950">
                      {isModelLocked(model) ? "[Locked] " : ""}{model.displayName} - {model.category} - {model.access}
                    </option>
                  ))}
                </select>
                <p className="mt-1 hidden max-w-[330px] truncate text-xs text-slate-400 sm:block">
                  {activeModel.emoji} {activeModel.category}: {activeModel.description}
                </p>
              </div>
              <span className="hidden rounded-full border border-cyan-400/35 bg-cyan-400/8 px-4 py-2 text-sm font-medium text-cyan-200 sm:inline-flex">
                Starter Access
              </span>
              <div className="ml-auto flex items-center gap-2">
                <Link href="/pricing" className="hidden h-10 items-center gap-2 rounded-xl bg-gradient-to-r from-[#6d35ff] to-[#245dff] px-4 text-sm font-semibold text-white sm:flex">
                  <Crown size={16} />
                  Upgrade
                </Link>
                <button onClick={() => setIsTuningOpen(true)} className="inline-flex h-10 items-center gap-2 rounded-xl border border-white/10 bg-white/5 px-3 text-sm text-slate-200 xl:hidden" aria-label="Open AI tuning">
                  <SlidersHorizontal size={16} />
                  <span className="hidden sm:inline">Temp {temperature.toFixed(2)}</span>
                </button>
                <button onClick={() => showNotice("No new notifications. You are all caught up.")} className="relative grid size-10 place-items-center rounded-full border border-white/10 bg-white/5 text-slate-200">
                  <Bell size={17} />
                  <span className="absolute right-2 top-2 size-1.5 rounded-full bg-fuchsia-400" />
                </button>
                {currentUser ? (
                  <div className="relative">
                    <button
                      onClick={() => setIsAccountMenuOpen((current) => !current)}
                      className="grid size-10 place-items-center overflow-hidden rounded-full border border-white/10 bg-slate-700 text-sm font-semibold"
                      title={currentUser.email ?? "Signed in"}
                      aria-label="Open account menu"
                    >
                      {currentUser.photoURL ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img src={currentUser.photoURL} alt="" className="h-full w-full object-cover" />
                      ) : (
                        (currentUser.displayName ?? currentUser.email ?? "U").slice(0, 2).toUpperCase()
                      )}
                    </button>
                    {isAccountMenuOpen ? (
                      <div className="absolute right-0 top-12 z-50 w-72 overflow-hidden rounded-2xl border border-white/10 bg-[#07111f] shadow-2xl shadow-black/40">
                        <div className="border-b border-white/10 p-4">
                          <p className="truncate text-sm font-semibold text-white">{currentUser.displayName ?? "Detox User"}</p>
                          <p className="mt-1 truncate text-xs text-slate-400">{currentUser.email}</p>
                        </div>
                        <div className="p-2">
                          <Link
                            href="/profile"
                            onClick={() => setIsAccountMenuOpen(false)}
                            className="flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-semibold text-slate-200 transition hover:bg-white/8"
                          >
                            <UserRound size={16} />
                            Edit Profile
                          </Link>
                          <Link
                            href="/settings"
                            onClick={() => setIsAccountMenuOpen(false)}
                            className="flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-semibold text-slate-200 transition hover:bg-white/8"
                          >
                            <SlidersHorizontal size={16} />
                            Profile Settings
                          </Link>
                          <button
                            type="button"
                            onClick={confirmLogout}
                            className="mt-2 flex w-full items-center gap-3 rounded-xl border border-red-300/20 bg-red-400/10 px-3 py-2.5 text-left text-sm font-semibold text-red-100 transition hover:bg-red-400/15"
                          >
                            <LogOut size={16} />
                            Log Out
                          </button>
                        </div>
                      </div>
                    ) : null}
                  </div>
                ) : (
                  <Link href="/login" className="inline-flex h-10 items-center justify-center rounded-xl bg-cyan-300 px-3 text-sm font-semibold text-slate-950">
                    Login
                  </Link>
                )}
              </div>
            </div>
          </header>

          {notice ? (
            <div className="pointer-events-none fixed left-1/2 top-20 z-40 -translate-x-1/2 rounded-full border border-cyan-300/20 bg-[#091221]/95 px-4 py-2 text-sm text-cyan-100 shadow-2xl">
              {notice}
            </div>
          ) : null}

          <section className="detox-scrollbar min-h-0 flex-1 overflow-y-auto px-3 py-5 sm:px-8">
            <div className="mx-auto max-w-4xl">
              {isRemoteChatsLoading ? (
                <div className="mb-5 inline-flex items-center gap-2 rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-slate-300">
                  <Square size={14} />
                  Loading your saved chats...
                </div>
              ) : null}
              {!messages.length ? (
                <div className="rounded-[2rem] border border-white/10 bg-[radial-gradient(circle_at_50%_0%,rgba(37,99,235,0.25),transparent_35%),linear-gradient(180deg,rgba(9,18,33,0.92),rgba(3,7,18,0.7))] p-8">
                  <div className="flex flex-col gap-8 md:flex-row md:items-center md:justify-between">
                    <div>
                      <p className="text-sm font-semibold uppercase tracking-[0.22em] text-cyan-200">Detox AI live</p>
                      <h1 className="mt-4 text-3xl font-semibold tracking-tight text-white sm:text-5xl">What do you want to solve?</h1>
                      <p className="mt-4 max-w-2xl text-slate-300">Ask a question, generate code, study a topic, improve a prompt, or plan a full project. Detox AI uses a private AI engine behind the scenes.</p>
                    </div>
                    <AppLogo size={120} className="rounded-[1.6rem]" />
                  </div>
                  <div className="mt-8 grid gap-3 sm:grid-cols-2">
                    {promptChips.map((chip) => (
                      <button key={chip} onClick={() => sendMessage(chip)} className="rounded-xl border border-white/10 bg-white/7 px-4 py-3 text-left text-sm text-slate-200 transition hover:border-blue-400/40 hover:bg-blue-400/10">
                        {chip}
                      </button>
                    ))}
                  </div>
                  {isAuthReady && !currentUser ? (
                    <div className="mt-6 flex flex-col gap-3 rounded-2xl border border-cyan-300/20 bg-cyan-300/10 p-4 sm:flex-row sm:items-center sm:justify-between">
                      <p className="text-sm text-cyan-50">Sign in first to message Detox AI models and use the live AI engine.</p>
                      <Link href="/login" className="inline-flex h-10 items-center justify-center rounded-xl bg-cyan-300 px-4 text-sm font-semibold text-slate-950">
                        Login to Chat
                      </Link>
                    </div>
                  ) : null}
                  {currentUser?.email === CREATOR_EMAIL ? (
                    <div className="mt-6 rounded-2xl border border-amber-300/25 bg-amber-300/10 p-4 text-sm text-amber-50">
                      Creator unlimited mode active. All models and plans are unlocked for {CREATOR_EMAIL}.
                    </div>
                  ) : null}
                </div>
              ) : null}

              {upgradeNotice ? (
                <div className="mt-5 flex flex-col gap-3 rounded-2xl border border-amber-300/25 bg-amber-300/10 p-4 text-sm text-amber-50 sm:flex-row sm:items-center sm:justify-between">
                  <p className="flex items-center gap-2">
                    <Lock size={16} />
                    {upgradeNotice}
                  </p>
                  <Link href={currentUser ? "/pricing" : "/login"} className="inline-flex h-9 items-center justify-center rounded-xl bg-amber-200 px-4 font-semibold text-amber-950">
                    {currentUser ? "Unlock" : "Login"}
                  </Link>
                </div>
              ) : null}

              <div className="mt-6 space-y-5">
                {messages.map((message) => {
                  const model = DETOX_MODELS.find((item) => item.id === message.modelId);
                  return (
                    <article key={message.id} className={`flex gap-3 ${message.role === "user" ? "justify-end" : ""}`}>
                      {message.role === "assistant" ? <AppLogo size={42} className="mt-1 rounded-2xl" /> : null}
                      <div className={`max-w-[88%] rounded-2xl p-4 text-sm shadow-2xl sm:max-w-[78%] ${message.role === "user" ? "bg-blue-500/18 text-white ring-1 ring-blue-300/20" : "border border-white/10 bg-[#091221] text-slate-100"}`}>
                        <div className="mb-2 flex items-center justify-between gap-3 text-xs text-slate-400">
                          <span>{message.role === "user" ? "You" : model?.displayName ?? "Detox AI"}</span>
                          <span>{formatTime(message.createdAt)}</span>
                        </div>
                        {renderMessageContent(message)}
                        <div className="mt-3 flex flex-wrap gap-2">
                          <button onClick={() => copyText(message.content, message.id)} className="inline-flex h-8 items-center gap-1 rounded-lg border border-white/10 px-2 text-xs text-slate-300 hover:text-white">
                            <Copy size={13} />
                            {copiedId === message.id ? "Copied" : "Copy"}
                          </button>
                          {message.role === "assistant" ? (
                            <>
                              <button onClick={regenerateLastAnswer} className="inline-flex h-8 items-center gap-1 rounded-lg border border-white/10 px-2 text-xs text-slate-300 hover:text-white">
                                <RefreshCcw size={13} />
                                Regenerate
                              </button>
                              <button onClick={explainLastAnswer} className="inline-flex h-8 items-center gap-1 rounded-lg border border-white/10 px-2 text-xs text-slate-300 hover:text-white">
                                <Sparkles size={13} />
                                Explain
                              </button>
                            </>
                          ) : null}
                        </div>
                      </div>
                    </article>
                  );
                })}

                {isLoading ? (
                  <div className="inline-flex items-center gap-2 rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-slate-300">
                    <Square size={14} />
                    <span>{activeModel.displayName} is thinking</span>
                    <span className="typing-dot size-1.5 rounded-full bg-cyan-200" />
                    <span className="typing-dot size-1.5 rounded-full bg-cyan-200 [animation-delay:150ms]" />
                    <span className="typing-dot size-1.5 rounded-full bg-cyan-200 [animation-delay:300ms]" />
                  </div>
                ) : null}
              </div>
            </div>
          </section>

          <div className="z-30 shrink-0 border-t border-white/10 bg-[#020713]/90 px-3 pb-[max(0.65rem,env(safe-area-inset-bottom))] pt-3 backdrop-blur-xl">
            <div className="mx-auto max-w-4xl rounded-2xl border border-white/15 bg-[#091221]/95 p-2.5 shadow-[0_20px_70px_rgba(0,0,0,0.45)]">
              {attachments.length ? (
                <div className="mb-2 flex flex-wrap items-center gap-2">
                  {attachments.map((file) => (
                    <span key={file} className="rounded-lg border border-white/10 bg-white/5 px-2 py-1 text-xs text-slate-300">
                      {file}
                    </span>
                  ))}
                  <button onClick={clearAttachments} className="rounded-lg border border-red-300/20 px-2 py-1 text-xs text-red-100">
                    Clear
                  </button>
                </div>
              ) : null}
              <textarea
                value={input}
                onChange={(event) => setInput(event.target.value)}
                onKeyDown={(event) => {
                  if (event.key === "Enter" && !event.shiftKey) {
                    event.preventDefault();
                    sendMessage();
                  }
                }}
                rows={1}
                placeholder="Ask Detox AI anything..."
                className="max-h-24 min-h-9 w-full resize-none bg-transparent px-2 py-1.5 text-sm text-white outline-none placeholder:text-slate-500"
              />
              <div className="flex flex-wrap items-center gap-2">
                <button onClick={() => fileInputRef.current?.click()} className="inline-flex h-9 items-center gap-2 rounded-xl border border-white/10 bg-white/5 px-3 text-sm text-slate-300 hover:text-white">
                  <FileUp size={16} />
                  Attach
                </button>
                <button onClick={enhancePrompt} className="inline-flex h-9 items-center gap-2 rounded-xl border border-white/10 bg-white/5 px-3 text-sm text-slate-300 hover:text-white">
                  <Wand2 size={16} />
                  Enhance
                </button>
                <button onClick={() => setResearchMode((value) => !value)} className="inline-flex h-9 items-center gap-2 rounded-xl border border-white/10 bg-white/5 px-3 text-sm text-slate-300 hover:text-white">
                  <Search size={16} />
                  Research
                  <span className={`relative h-5 w-9 rounded-full transition ${researchMode ? "bg-blue-500" : "bg-slate-700"}`}>
                    <span className={`absolute top-0.5 size-4 rounded-full bg-white transition ${researchMode ? "left-4" : "left-0.5"}`} />
                  </span>
                </button>
                <div className="ml-auto flex items-center gap-2">
                  <button onClick={useVoicePlaceholder} className="grid size-9 place-items-center rounded-xl border border-white/10 bg-white/5 text-slate-300 hover:text-white" aria-label="Voice input">
                    <Mic size={17} />
                  </button>
                  <button onClick={() => sendMessage()} disabled={isLoading} className="grid size-11 place-items-center rounded-full bg-gradient-to-br from-[#6547ff] to-[#244eff] text-white shadow-[0_0_35px_rgba(80,76,255,0.35)] disabled:opacity-60" aria-label="Send message">
                    <Send size={19} />
                  </button>
                </div>
              </div>
            </div>
            <p className="mx-auto mt-3 max-w-4xl text-center text-xs text-slate-500">Detox AI can make mistakes. Verify important info.</p>
          </div>
        </main>

        <aside className="detox-scrollbar hidden h-screen overflow-y-auto bg-[#050b18]/96 p-4 pb-8 xl:flex xl:flex-col xl:gap-3">
          <section className="rounded-2xl border border-cyan-300/15 bg-[#091221]/92 p-3">
            <div className="mb-3 flex items-center justify-between">
              <h2 className="font-semibold text-white">Response Temperature</h2>
              <span className="rounded-lg border border-cyan-300/20 bg-cyan-300/10 px-2 py-1 text-sm font-semibold text-cyan-100">{temperature.toFixed(2)}</span>
            </div>
            <div className="space-y-3">
              <input
                aria-label="AI temperature"
                type="range"
                min="0.5"
                max="2"
                step="0.05"
                value={temperature}
                onChange={(event) => setTemperature(Number(event.target.value))}
                className="h-2 w-full accent-cyan-300"
              />
              <div className="grid grid-cols-4 gap-2 text-center text-[11px] text-slate-500">
                <span>0.5</span>
                <span>1.0</span>
                <span>1.5</span>
                <span>2.0</span>
              </div>
              <div className="rounded-xl border border-white/10 bg-white/5 p-3">
                <p className="text-sm font-semibold text-white">{temperatureLabel(temperature)}</p>
                <p className="mt-1 text-xs leading-5 text-slate-400">
                  0.50 is calmer, 1.00 is balanced, 1.50 is deeper, and 2.00 is extreme thinking.
                </p>
              </div>
              {highTemperatureMode ? (
                <div className="rounded-xl border border-amber-300/20 bg-amber-300/10 p-3 text-xs leading-5 text-amber-50">
                  Deep modes use half limits. Used {highTempUsage.used}/{highTemperatureLimit}; weekly reset once/month.
                </div>
              ) : null}
            </div>
          </section>

          <section className="rounded-2xl border border-white/10 bg-[#091221]/92 p-3">
            <div className="mb-3 flex items-center justify-between">
              <h2 className="font-semibold text-white">Quick Tools</h2>
              <Link href="/tools" className="text-sm text-blue-300 hover:text-white">View all</Link>
            </div>
            <div className="grid gap-2">
              {toolPrompts.map(([title, prompt, Icon]) => {
                const ToolIcon = Icon as typeof Code2;
                return (
                  <button key={title as string} onClick={() => runQuickTool(title as string, prompt as string)} className="flex items-center gap-3 rounded-xl p-1.5 text-left hover:bg-white/6">
                    <span className="grid size-8 place-items-center rounded-xl bg-blue-500/14 text-blue-200">
                      <ToolIcon size={16} />
                    </span>
                    <span>
                      <span className="block text-sm font-semibold text-white">{title as string}</span>
                      <span className="text-xs text-slate-500">Generate in chat</span>
                    </span>
                  </button>
                );
              })}
            </div>
          </section>

          <section className="rounded-2xl border border-white/10 bg-[#091221]/92 p-3">
            <div className="mb-3 flex items-center justify-between">
              <h2 className="font-semibold text-white">Usage</h2>
              <button onClick={() => showNotice("Usage refreshes automatically as you chat.")} className="rounded-lg p-1 text-slate-500 hover:bg-white/8 hover:text-white">
                <MoreHorizontal size={18} />
              </button>
            </div>
            <div className="space-y-3">
              <div>
                <div className="mb-2 flex items-center justify-between text-sm">
                  <span className="text-slate-200">Daily Messages</span>
                  <span className="text-slate-400">{dailyUsed} / {effectiveDailyLimit}</span>
                </div>
                <div className="h-2 overflow-hidden rounded-full bg-slate-800">
                  <div className="h-full rounded-full bg-gradient-to-r from-[#7b3cff] to-[#1595ff]" style={{ width: `${Math.min(100, (dailyUsed / effectiveDailyLimit) * 100)}%` }} />
                </div>
              </div>
              <div>
                <div className="mb-2 flex items-center justify-between text-sm">
                  <span className="text-slate-200">Monthly Messages</span>
                  <span className="text-slate-400">{monthlyUsed} / {effectiveMonthlyLimit}</span>
                </div>
                <div className="h-2 overflow-hidden rounded-full bg-slate-800">
                  <div className="h-full rounded-full bg-gradient-to-r from-[#7b3cff] to-[#1595ff]" style={{ width: `${Math.min(100, (monthlyUsed / effectiveMonthlyLimit) * 100)}%` }} />
                </div>
              </div>
              <div className="rounded-xl border border-white/10 bg-white/5 p-3 text-xs leading-5 text-slate-400">
                <p className="font-semibold text-slate-200">Thinking rule</p>
                <p>Temperature above 1.00 uses half limits. Weekly high-thinking reset can happen once per month.</p>
                <p className="mt-1 text-cyan-100">Next high-thinking reset window: {resetDate.toLocaleDateString("en-IN")}</p>
              </div>
            </div>
          </section>
        </aside>
      </div>
    </div>
  );
}
