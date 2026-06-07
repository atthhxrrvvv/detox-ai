"use client";

import Link from "next/link";
import { useEffect, useMemo, useRef, useState } from "react";
import {
  Bell,
  BookOpen,
  Bot,
  Brain,
  Briefcase,
  CheckCircle2,
  CircleHelp,
  ClipboardList,
  Code2,
  Copy,
  CreditCard,
  Crown,
  Download,
  FileText,
  FileUp,
  Folder,
  Home,
  Layers3,
  Lock,
  LogOut,
  Maximize2,
  MessageSquare,
  Mic,
  Minimize2,
  MoreHorizontal,
  PanelLeft,
  Plus,
  RefreshCcw,
  Save,
  Search,
  Send,
  SlidersHorizontal,
  Sparkles,
  Square,
  Star,
  Table2,
  Timer,
  Trophy,
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
const TASK_GENERATOR_STORAGE_KEY = "detox-ai-task-generator";
const EXAM_MODE_STORAGE_KEY = "detox-ai-exam-mode";
const FLASHCARD_STORAGE_KEY = "detox-ai-flashcards";
const PENDING_CHAT_PROMPT_KEY = "detox-ai-pending-chat-prompt";
const SAFE_MODE_STORAGE_KEY = "detox-ai-safe-mode";
const FOCUS_MODE_STORAGE_KEY = "detox-ai-focus-mode";
const MESSAGE_REACTIONS_STORAGE_KEY = "detox-ai-message-reactions";
const LAB_VOTES_STORAGE_KEY = "detox-ai-lab-votes";
const REVISION_NOTIFIED_STORAGE_KEY = "detox-ai-revision-notified";

type HighTemperatureUsage = {
  used: number;
  cycleStartedAt: string;
  resetUsedMonth: string;
};

type CanvasType = "document" | "code" | "study" | "project" | "business";

type CanvasWorkspace = {
  enabled: boolean;
  type: CanvasType;
  title: string;
  content: string;
  updatedAt: string;
};

type GeneratedTask = {
  id: string;
  title: string;
  done: boolean;
  saved: boolean;
  createdAt: string;
};

type TaskGeneratorState = {
  goal: string;
  tasks: GeneratedTask[];
  savedProjectTasks: GeneratedTask[];
  updatedAt: string;
};

type ExamDifficulty = "easy" | "medium" | "hard";

type ExamQuestionType = "mcq" | "short";

type ExamQuestion = {
  id: string;
  type: ExamQuestionType;
  prompt: string;
  options?: string[];
  answer: string;
  explanation: string;
  userAnswer: string;
  createdAt?: string;
};

type ExamModeState = {
  subject: string;
  classLevel: string;
  topic: string;
  difficulty: ExamDifficulty;
  durationMinutes: number;
  remainingSeconds: number;
  questions: ExamQuestion[];
  submitted: boolean;
  startedAt: string;
  updatedAt: string;
};

type FlashcardDifficulty = "new" | "easy" | "hard" | "later";

type Flashcard = {
  id: string;
  question: string;
  answer: string;
  flipped: boolean;
  difficulty: FlashcardDifficulty;
  reviseAt?: string;
  revisionLabel?: string;
  createdAt: string;
};

type FlashcardState = {
  topic: string;
  classLevel: string;
  cards: Flashcard[];
  activeIndex: number;
  updatedAt: string;
};

type ChatErrorState = {
  title: string;
  message: string;
  tone: "error" | "limit";
  retryText?: string;
};

type FocusModeState = {
  enabled: boolean;
  goal: string;
  durationMinutes: number;
  remainingSeconds: number;
  running: boolean;
};

type MessageReaction = "helpful" | "great" | "smart" | "improve";

type CompareMode = "simple-detailed" | "friendly-professional";

type ComparePanelState = {
  messageId: string;
  mode: CompareMode;
};

const promptChips = [
  "Explain Docker in simple terms",
  "Debug this code step by step",
  "Create a 7 day study plan",
  "Plan a startup landing page",
];

const CANVAS_STORAGE_KEY = "detox-ai-canvas-workspace";

const examSubjects = ["Science", "Math", "English", "Social Science", "Computer", "Business"] as const;
const examClasses = ["Class 6", "Class 7", "Class 8", "Class 9", "Class 10", "Class 11", "Class 12"] as const;
const examDifficulties: ExamDifficulty[] = ["easy", "medium", "hard"];

const canvasTypes = [
  {
    id: "document",
    label: "Document Canvas",
    shortLabel: "Document",
    icon: FileText,
    prompt: "Write a polished document with clear headings, concise paragraphs, and editable sections.",
    placeholder: "Your AI-written document appears here.",
  },
  {
    id: "code",
    label: "Code Canvas",
    shortLabel: "Code",
    icon: Code2,
    prompt: "Write clean code or technical specs with file names, code blocks, setup notes, and testing steps.",
    placeholder: "Your code, specs, or implementation notes appear here.",
  },
  {
    id: "study",
    label: "Study Notes Canvas",
    shortLabel: "Study",
    icon: BookOpen,
    prompt: "Write study notes with summaries, key points, examples, definitions, and quick revision questions.",
    placeholder: "Your study notes appear here.",
  },
  {
    id: "project",
    label: "Project Plan Canvas",
    shortLabel: "Project",
    icon: ClipboardList,
    prompt: "Write a project plan with goals, scope, pages or features, milestones, tasks, and next actions.",
    placeholder: "Your project plan appears here.",
  },
  {
    id: "business",
    label: "Business Plan Canvas",
    shortLabel: "Business",
    icon: Briefcase,
    prompt: "Write a business plan with audience, offer, pricing, go-to-market, risks, and 30-day roadmap.",
    placeholder: "Your business plan appears here.",
  },
] as const satisfies ReadonlyArray<{
  id: CanvasType;
  label: string;
  shortLabel: string;
  icon: typeof FileText;
  prompt: string;
  placeholder: string;
}>;

function createCanvasWorkspace(): CanvasWorkspace {
  return {
    enabled: false,
    type: "project",
    title: "Untitled Canvas",
    content: "",
    updatedAt: new Date().toISOString(),
  };
}

function loadCanvasWorkspace() {
  if (typeof window === "undefined") return createCanvasWorkspace();

  try {
    const stored = window.localStorage.getItem(CANVAS_STORAGE_KEY);
    if (!stored) return createCanvasWorkspace();
    const parsed = JSON.parse(stored) as Partial<CanvasWorkspace>;
    const type = canvasTypes.some((canvas) => canvas.id === parsed.type) ? parsed.type : "project";
    return {
      enabled: Boolean(parsed.enabled),
      type: type ?? "project",
      title: typeof parsed.title === "string" && parsed.title.trim() ? parsed.title : "Untitled Canvas",
      content: typeof parsed.content === "string" ? parsed.content : "",
      updatedAt: typeof parsed.updatedAt === "string" ? parsed.updatedAt : new Date().toISOString(),
    } satisfies CanvasWorkspace;
  } catch {
    return createCanvasWorkspace();
  }
}

function createTaskGeneratorState(): TaskGeneratorState {
  return {
    goal: "",
    tasks: [],
    savedProjectTasks: [],
    updatedAt: new Date().toISOString(),
  };
}

function loadTaskGeneratorState() {
  if (typeof window === "undefined") return createTaskGeneratorState();

  try {
    const stored = window.localStorage.getItem(TASK_GENERATOR_STORAGE_KEY);
    if (!stored) return createTaskGeneratorState();
    const parsed = JSON.parse(stored) as Partial<TaskGeneratorState>;
    return {
      goal: typeof parsed.goal === "string" ? parsed.goal : "",
      tasks: Array.isArray(parsed.tasks) ? parsed.tasks.filter((task) => typeof task?.title === "string") as GeneratedTask[] : [],
      savedProjectTasks: Array.isArray(parsed.savedProjectTasks)
        ? parsed.savedProjectTasks.filter((task) => typeof task?.title === "string") as GeneratedTask[]
        : [],
      updatedAt: typeof parsed.updatedAt === "string" ? parsed.updatedAt : new Date().toISOString(),
    };
  } catch {
    return createTaskGeneratorState();
  }
}

function createExamModeState(): ExamModeState {
  return {
    subject: "Science",
    classLevel: "Class 10",
    topic: "",
    difficulty: "medium",
    durationMinutes: 5,
    remainingSeconds: 5 * 60,
    questions: [],
    submitted: false,
    startedAt: "",
    updatedAt: new Date().toISOString(),
  };
}

function loadExamModeState() {
  if (typeof window === "undefined") return createExamModeState();

  try {
    const stored = window.localStorage.getItem(EXAM_MODE_STORAGE_KEY);
    if (!stored) return createExamModeState();
    const parsed = JSON.parse(stored) as Partial<ExamModeState>;
    const difficulty = examDifficulties.includes(parsed.difficulty as ExamDifficulty) ? parsed.difficulty as ExamDifficulty : "medium";
    const durationMinutes = typeof parsed.durationMinutes === "number" ? Math.min(30, Math.max(1, parsed.durationMinutes)) : 5;
    return {
      subject: typeof parsed.subject === "string" && parsed.subject ? parsed.subject : "Science",
      classLevel: typeof parsed.classLevel === "string" && parsed.classLevel ? parsed.classLevel : "Class 10",
      topic: typeof parsed.topic === "string" ? parsed.topic : "",
      difficulty,
      durationMinutes,
      remainingSeconds: typeof parsed.remainingSeconds === "number" ? Math.max(0, parsed.remainingSeconds) : durationMinutes * 60,
      questions: Array.isArray(parsed.questions) ? parsed.questions.filter((question) => typeof question?.prompt === "string") as ExamQuestion[] : [],
      submitted: Boolean(parsed.submitted),
      startedAt: typeof parsed.startedAt === "string" ? parsed.startedAt : "",
      updatedAt: typeof parsed.updatedAt === "string" ? parsed.updatedAt : new Date().toISOString(),
    };
  } catch {
    return createExamModeState();
  }
}

function createFlashcardState(): FlashcardState {
  return {
    topic: "",
    classLevel: "Class 10",
    cards: [],
    activeIndex: 0,
    updatedAt: new Date().toISOString(),
  };
}

function loadFlashcardState() {
  if (typeof window === "undefined") return createFlashcardState();

  try {
    const stored = window.localStorage.getItem(FLASHCARD_STORAGE_KEY);
    if (!stored) return createFlashcardState();
    const parsed = JSON.parse(stored) as Partial<FlashcardState>;
    const cards = Array.isArray(parsed.cards)
      ? parsed.cards.filter((card) => typeof card?.question === "string" && typeof card?.answer === "string") as Flashcard[]
      : [];
    return {
      topic: typeof parsed.topic === "string" ? parsed.topic : "",
      classLevel: typeof parsed.classLevel === "string" && parsed.classLevel ? parsed.classLevel : "Class 10",
      cards,
      activeIndex: typeof parsed.activeIndex === "number" ? Math.min(Math.max(0, parsed.activeIndex), Math.max(0, cards.length - 1)) : 0,
      updatedAt: typeof parsed.updatedAt === "string" ? parsed.updatedAt : new Date().toISOString(),
    };
  } catch {
    return createFlashcardState();
  }
}

function loadSafeMode() {
  if (typeof window === "undefined") return true;
  return window.localStorage.getItem(SAFE_MODE_STORAGE_KEY) !== "off";
}

function createFocusModeState(): FocusModeState {
  return {
    enabled: false,
    goal: "",
    durationMinutes: 25,
    remainingSeconds: 25 * 60,
    running: false,
  };
}

function loadFocusModeState() {
  if (typeof window === "undefined") return createFocusModeState();

  try {
    const stored = window.localStorage.getItem(FOCUS_MODE_STORAGE_KEY);
    if (!stored) return createFocusModeState();
    const parsed = JSON.parse(stored) as Partial<FocusModeState>;
    const durationMinutes = typeof parsed.durationMinutes === "number" ? Math.min(180, Math.max(1, parsed.durationMinutes)) : 25;
    return {
      enabled: Boolean(parsed.enabled),
      goal: typeof parsed.goal === "string" ? parsed.goal : "",
      durationMinutes,
      remainingSeconds: typeof parsed.remainingSeconds === "number" ? Math.min(durationMinutes * 60, Math.max(0, parsed.remainingSeconds)) : durationMinutes * 60,
      running: Boolean(parsed.running),
    };
  } catch {
    return createFocusModeState();
  }
}

function loadMessageReactions() {
  if (typeof window === "undefined") return {} as Record<string, MessageReaction>;

  try {
    const parsed = JSON.parse(window.localStorage.getItem(MESSAGE_REACTIONS_STORAGE_KEY) ?? "{}") as Record<string, unknown>;
    return Object.fromEntries(
      Object.entries(parsed).filter(([, value]) => ["helpful", "great", "smart", "improve"].includes(String(value))),
    ) as Record<string, MessageReaction>;
  } catch {
    return {};
  }
}

function loadLabVotes() {
  if (typeof window === "undefined") return {} as Record<string, number>;

  try {
    const parsed = JSON.parse(window.localStorage.getItem(LAB_VOTES_STORAGE_KEY) ?? "{}") as Record<string, unknown>;
    return Object.fromEntries(
      Object.entries(parsed).map(([key, value]) => [key, typeof value === "number" && Number.isFinite(value) ? value : 0]),
    ) as Record<string, number>;
  } catch {
    return {};
  }
}

function loadRevisionNotifiedIds() {
  if (typeof window === "undefined") return [] as string[];

  try {
    const parsed = JSON.parse(window.localStorage.getItem(REVISION_NOTIFIED_STORAGE_KEY) ?? "[]") as unknown[];
    return parsed.filter((item): item is string => typeof item === "string");
  } catch {
    return [];
  }
}

function formatFocusTime(seconds: number) {
  const minutes = Math.floor(seconds / 60);
  const remaining = seconds % 60;
  return `${String(minutes).padStart(2, "0")}:${String(remaining).padStart(2, "0")}`;
}

function nextDailyReset() {
  const reset = new Date();
  reset.setDate(reset.getDate() + 1);
  reset.setHours(0, 0, 0, 0);
  return reset;
}

function formatCountdown(target: Date, now = Date.now()) {
  const totalSeconds = Math.max(0, Math.ceil((target.getTime() - now) / 1000));
  const hours = Math.floor(totalSeconds / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const seconds = totalSeconds % 60;
  return `${hours}h ${minutes}m ${seconds}s`;
}

function revisionTarget(label: "today" | "tomorrow" | "three-days") {
  const date = new Date();
  if (label === "tomorrow") date.setDate(date.getDate() + 1);
  if (label === "three-days") date.setDate(date.getDate() + 3);
  date.setHours(label === "today" ? 20 : 9, 0, 0, 0);
  return date;
}

function compactAnswer(content: string) {
  const clean = content.replace(/```[\s\S]*?```/g, "").replace(/[#*_>`-]/g, "").replace(/\s+/g, " ").trim();
  const sentences = clean.split(/(?<=[.!?])\s+/).filter(Boolean).slice(0, 4);
  return sentences.join(" ") || clean.slice(0, 600) || content;
}

function createCompareVariants(content: string, mode: CompareMode) {
  if (mode === "friendly-professional") {
    return [
      {
        label: "Friendly Answer",
        tone: "Warm and easy",
        content: `Here is the friendly version:\n\n${content}`,
      },
      {
        label: "Professional Answer",
        tone: "Polished and direct",
        content: `Professional version:\n\n${content}`,
      },
    ];
  }

  return [
    {
      label: "Simple Answer",
      tone: "Short and beginner-friendly",
      content: compactAnswer(content),
    },
    {
      label: "Detailed Answer",
      tone: "Full explanation",
      content,
    },
  ];
}

const reactionOptions = [
  ["helpful", "👍 Helpful"],
  ["great", "🔥 Great"],
  ["smart", "🧠 Smart"],
  ["improve", "👎 Improve"],
] as const satisfies ReadonlyArray<readonly [MessageReaction, string]>;

const labFeatures = [
  ["voice-lab", "Voice Study Coach", "Practice answers with AI voice feedback."],
  ["project-lab", "Project Autopilot", "Turn a goal into tasks, files, and launch steps."],
  ["memory-lab", "Long Memory", "Let Detox remember your learning style and projects."],
  ["team-lab", "Team Workspaces", "Share chats, notes, and plans with friends."],
] as const;

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

const smartReplyPresets = [
  {
    label: "Make it deeper",
    icon: Brain,
    instruction: "Expand this answer with deeper reasoning, more useful detail, stronger structure, and practical next steps.",
  },
  {
    label: "Make it simple",
    icon: Sparkles,
    instruction: "Rewrite this answer in simpler words. Keep it short, clear, and easy for a beginner to understand.",
  },
  {
    label: "Give examples",
    icon: BookOpen,
    instruction: "Add practical examples to this answer. Use clear examples that make the idea easier to apply.",
  },
  {
    label: "Convert to table",
    icon: Table2,
    instruction: "Convert this answer into a clean markdown table. Keep the table useful and easy to scan.",
  },
  {
    label: "Explain like teacher",
    icon: BookOpen,
    instruction: "Explain this like a patient teacher. Break it down step by step and include a quick recap.",
  },
  {
    label: "Make it professional",
    icon: Briefcase,
    instruction: "Rewrite this answer in a polished, professional tone while keeping the meaning accurate.",
  },
  {
    label: "Turn into prompt",
    icon: Wand2,
    instruction: "Turn this answer into a high-quality reusable AI prompt with role, task, context, output format, and constraints.",
  },
  {
    label: "Turn into checklist",
    icon: ClipboardList,
    instruction: "Turn this answer into an actionable checklist with clear steps and checkboxes.",
  },
] as const satisfies ReadonlyArray<{
  label: string;
  icon: typeof Sparkles;
  instruction: string;
}>;

const slashCommands = [
  {
    command: "/study",
    label: "Study",
    description: "Notes, examples, quiz",
    icon: BookOpen,
    instruction: "Study mode: Teach this with clear notes, key points, examples, and a quick revision quiz.",
  },
  {
    command: "/code",
    label: "Code",
    description: "Build or explain code",
    icon: Code2,
    instruction: "Code mode: Help with clean, working code. Include setup steps, file names if useful, and explain the important parts.",
  },
  {
    command: "/write",
    label: "Write",
    description: "Create polished text",
    icon: FileText,
    instruction: "Writing mode: Write this clearly with good structure, natural wording, and a polished final result.",
  },
  {
    command: "/debug",
    label: "Debug",
    description: "Find and fix issues",
    icon: Wrench,
    instruction: "Debug mode: Find the likely problem, explain the cause, and give a fixed version or clear next steps.",
  },
  {
    command: "/summarize",
    label: "Summarize",
    description: "Short and clear",
    icon: ClipboardList,
    instruction: "Summary mode: Summarize this into the most important points, keeping it short, accurate, and easy to scan.",
  },
  {
    command: "/project",
    label: "Project",
    description: "Plan steps",
    icon: Folder,
    instruction: "Project mode: Turn this goal into a practical project plan with milestones, tasks, timeline, and next actions.",
  },
  {
    command: "/quiz",
    label: "Quiz",
    description: "Test knowledge",
    icon: CircleHelp,
    instruction: "Quiz mode: Create a useful quiz with MCQs, short answers, correct answers, and brief explanations.",
  },
  {
    command: "/email",
    label: "Email",
    description: "Draft a message",
    icon: MessageSquare,
    instruction: "Email mode: Write a clear, professional email with a strong subject line and natural wording.",
  },
  {
    command: "/human",
    label: "Human",
    description: "Natural response",
    icon: UserRound,
    instruction: "Human mode: Reply like a natural human. Be warm, clear, conversational, and helpful without sounding robotic or overly formal.",
  },
] as const satisfies ReadonlyArray<{
  command: string;
  label: string;
  description: string;
  icon: typeof Sparkles;
  instruction: string;
}>;

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

function formatDate(value: string) {
  return new Intl.DateTimeFormat("en-IN", {
    day: "2-digit",
    month: "short",
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

function taskId() {
  return typeof crypto !== "undefined" && "randomUUID" in crypto
    ? crypto.randomUUID()
    : `${Date.now()}-${Math.random().toString(16).slice(2)}`;
}

function createTasksForGoal(goal: string): GeneratedTask[] {
  const normalizedGoal = goal.toLowerCase();
  const baseTasks = normalizedGoal.includes("app")
    ? [
        "Choose the app idea and target users",
        "Map the core screens and user flow",
        "Design the UI layout and navigation",
        "Create authentication and user profiles",
        "Build the main dashboard",
        "Add the database structure and rules",
        "Connect the AI or automation features",
        "Test the app on mobile and desktop",
        "Deploy the first version",
      ]
    : normalizedGoal.includes("website") || normalizedGoal.includes("portfolio")
      ? [
          "Define the website goal and audience",
          "Plan the pages and section order",
          "Write the hero, about, work, and contact copy",
          "Design the visual style and responsive layout",
          "Build the page components",
          "Add projects, links, and contact actions",
          "Optimize SEO, images, and performance",
          "Deploy and test the live website",
        ]
      : normalizedGoal.includes("business") || normalizedGoal.includes("startup")
        ? [
            "Define the problem and target customer",
            "Shape the offer and core product",
            "Research competitors and positioning",
            "Create pricing and revenue model",
            "Plan the landing page and sales funnel",
            "Build a 30-day launch roadmap",
            "List risks and validation tests",
            "Prepare the first outreach campaign",
          ]
        : normalizedGoal.includes("study") || normalizedGoal.includes("learn") || normalizedGoal.includes("exam")
          ? [
              "Break the topic into chapters",
              "Collect notes and source material",
              "Create a daily study timetable",
              "Make summaries for each chapter",
              "Practice questions and examples",
              "Review weak areas",
              "Take a mock test",
              "Revise before the deadline",
            ]
          : [
              "Clarify the final outcome",
              "Break the goal into milestones",
              "List the resources needed",
              "Create the first version",
              "Review and improve the work",
              "Test with real users or examples",
              "Fix issues and polish details",
              "Launch or submit the final result",
            ];

  return baseTasks.map((title) => ({
    id: taskId(),
    title,
    done: false,
    saved: false,
    createdAt: new Date().toISOString(),
  }));
}

function normalizeAnswer(value: string) {
  return value.toLowerCase().replace(/[^a-z0-9\s]/g, " ").replace(/\s+/g, " ").trim();
}

function createExamQuestions({
  subject,
  classLevel,
  topic,
  difficulty,
}: {
  subject: string;
  classLevel: string;
  topic: string;
  difficulty: ExamDifficulty;
}): ExamQuestion[] {
  const cleanTopic = topic.trim() || `${subject} basics`;
  const levelWord = difficulty === "easy" ? "basic" : difficulty === "hard" ? "advanced" : "clear";
  const now = new Date().toISOString();

  const questions: ExamQuestion[] = [
    {
      id: taskId(),
      type: "mcq",
      prompt: `What should you understand first when studying ${cleanTopic} in ${subject}?`,
      options: [
        `The core meaning and main idea of ${cleanTopic}`,
        "Only the spelling of the chapter name",
        "Only unrelated examples",
        "Only the last paragraph",
      ],
      answer: `The core meaning and main idea of ${cleanTopic}`,
      explanation: `Start with the core idea of ${cleanTopic}; details become easier after the main concept is clear.`,
      userAnswer: "",
    },
    {
      id: taskId(),
      type: "mcq",
      prompt: `Which method is best for revising ${cleanTopic} before an exam?`,
      options: [
        "Make short notes, practice questions, and review mistakes",
        "Read once and never test yourself",
        "Skip definitions and examples",
        "Memorize random words without meaning",
      ],
      answer: "Make short notes, practice questions, and review mistakes",
      explanation: "Revision works best when notes, practice, and mistake review are combined.",
      userAnswer: "",
    },
    {
      id: taskId(),
      type: "mcq",
      prompt: `For ${classLevel}, what makes an answer on ${cleanTopic} stronger?`,
      options: [
        "Clear points with examples and correct keywords",
        "A very long answer with no structure",
        "Copying the question only",
        "Avoiding the main terms",
      ],
      answer: "Clear points with examples and correct keywords",
      explanation: "Good exam answers are structured, keyword-rich, and supported by examples.",
      userAnswer: "",
    },
    {
      id: taskId(),
      type: "mcq",
      prompt: `What is a ${levelWord} way to check if you really know ${cleanTopic}?`,
      options: [
        "Explain it in your own words without looking",
        "Only highlight the textbook",
        "Close the book and ignore the topic",
        "Read the heading only",
      ],
      answer: "Explain it in your own words without looking",
      explanation: "If you can explain a topic in your own words, your understanding is much stronger.",
      userAnswer: "",
    },
    {
      id: taskId(),
      type: "short",
      prompt: `Explain ${cleanTopic} in 2-3 lines for ${classLevel}.`,
      answer: `${cleanTopic} means understanding the main idea, important terms, and examples in ${subject}. A good answer should define it clearly and connect it to a real example.`,
      explanation: `Your answer should mention ${cleanTopic}, include key terms from ${subject}, and explain the idea clearly.`,
      userAnswer: "",
    },
    {
      id: taskId(),
      type: "short",
      prompt: `Write one exam tip for scoring better in ${subject} questions about ${cleanTopic}.`,
      answer: `Use correct keywords, write in points, add one example, and review your mistakes after practice.`,
      explanation: "Scoring improves when answers are structured and include keywords, examples, and mistake review.",
      userAnswer: "",
    },
  ];

  return questions.map((question) => ({ ...question, createdAt: now }));
}

function isExamAnswerCorrect(question: ExamQuestion) {
  if (!question.userAnswer.trim()) return false;
  if (question.type === "mcq") return question.userAnswer === question.answer;

  const expectedWords = normalizeAnswer(question.answer)
    .split(" ")
    .filter((word) => word.length > 4);
  const userAnswer = normalizeAnswer(question.userAnswer);
  const matchedWords = expectedWords.filter((word) => userAnswer.includes(word)).length;
  return userAnswer.length >= 18 && matchedWords >= Math.min(2, expectedWords.length);
}

function formatExamTime(seconds: number) {
  const minutes = Math.floor(seconds / 60);
  const remainingSeconds = seconds % 60;
  return `${minutes}:${String(remainingSeconds).padStart(2, "0")}`;
}

function createFlashcardsForTopic(topic: string, classLevel: string): Flashcard[] {
  const cleanTopic = topic.trim() || "this topic";
  const now = new Date().toISOString();
  const cards = [
    [
      `What is the main idea of ${cleanTopic}?`,
      `${cleanTopic} is best understood by learning its core definition, important terms, and one clear example for ${classLevel}.`,
    ],
    [
      `Why is ${cleanTopic} important for exams?`,
      `It helps answer direct questions, explain concepts in your own words, and connect examples with key terms.`,
    ],
    [
      `What should you remember first about ${cleanTopic}?`,
      `Start with the definition, then remember 2-3 keywords, a simple explanation, and one common example.`,
    ],
    [
      `How can you revise ${cleanTopic} quickly?`,
      `Read short notes, cover the answer, recall the idea, then solve one practice question without looking.`,
    ],
    [
      `What is a common mistake in ${cleanTopic}?`,
      `A common mistake is memorizing lines without understanding the meaning or where the idea is used.`,
    ],
    [
      `How would you explain ${cleanTopic} to a friend?`,
      `Use simple words, give the main definition, add one example, and ask them to repeat the idea back.`,
    ],
  ];

  return cards.map(([question, answer]) => ({
    id: taskId(),
    question,
    answer,
    flipped: false,
    difficulty: "new",
    createdAt: now,
  }));
}

function resolveSlashCommandText(text: string) {
  const lowerText = text.toLowerCase();
  const matchedCommand = slashCommands.find(
    (item) => lowerText === item.command || lowerText.startsWith(`${item.command} `),
  );

  if (!matchedCommand) {
    return {
      displayText: text,
      aiText: text,
    };
  }

  const commandText = text.slice(matchedCommand.command.length).trim();
  const targetText = commandText || "Ask me one short follow-up question so you can help with the right details.";

  return {
    displayText: commandText ? `${matchedCommand.command} ${commandText}` : matchedCommand.command,
    aiText: `${matchedCommand.instruction}\n\n${targetText}`,
  };
}

export function ChatExperience() {
  const [threads, setThreads] = useState<ChatThread[]>(loadThreads);
  const [activeThreadId, setActiveThreadId] = useState(() => threads[0]?.id ?? "");
  const [selectedModel, setSelectedModel] = useState("flash-1.0");
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [upgradeNotice, setUpgradeNotice] = useState("");
  const [researchMode, setResearchMode] = useState(false);
  const [safeMode, setSafeMode] = useState(loadSafeMode);
  const [focusMode, setFocusMode] = useState<FocusModeState>(loadFocusModeState);
  const [chatError, setChatError] = useState<ChatErrorState | null>(null);
  const [clockNow, setClockNow] = useState(Date.now());
  const [messageReactions, setMessageReactions] = useState<Record<string, MessageReaction>>(loadMessageReactions);
  const [comparePanel, setComparePanel] = useState<ComparePanelState | null>(null);
  const [labVotes, setLabVotes] = useState<Record<string, number>>(loadLabVotes);
  const [notifiedRevisionIds, setNotifiedRevisionIds] = useState<string[]>(loadRevisionNotifiedIds);
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
  const [canvasWorkspace, setCanvasWorkspace] = useState<CanvasWorkspace>(loadCanvasWorkspace);
  const [taskGenerator, setTaskGenerator] = useState<TaskGeneratorState>(loadTaskGeneratorState);
  const [examMode, setExamMode] = useState<ExamModeState>(loadExamModeState);
  const [isExamGenerating, setIsExamGenerating] = useState(false);
  const [flashcards, setFlashcards] = useState<FlashcardState>(loadFlashcardState);
  const [isFlashcardGenerating, setIsFlashcardGenerating] = useState(false);
  const [isAccountMenuOpen, setIsAccountMenuOpen] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

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
  const slashCommandQuery = input.startsWith("/")
    ? input.slice(1).split(/\s/, 1)[0].toLowerCase()
    : "";
  const visibleSlashCommands = useMemo(() => {
    if (!input.startsWith("/") || input.includes("\n")) return [];

    return slashCommands
      .filter((item) => {
        const commandName = item.command.slice(1);
        return (
          commandName.includes(slashCommandQuery) ||
          item.label.toLowerCase().includes(slashCommandQuery) ||
          item.description.toLowerCase().includes(slashCommandQuery)
        );
      })
      .slice(0, 9);
  }, [input, slashCommandQuery]);
  const showSlashCommandBar = visibleSlashCommands.length > 0;
  const activeCanvasType = useMemo(
    () => canvasTypes.find((canvas) => canvas.id === canvasWorkspace.type) ?? canvasTypes[3],
    [canvasWorkspace.type],
  );
  const CanvasIcon = activeCanvasType.icon;
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
  const completedTaskCount = taskGenerator.tasks.filter((task) => task.done).length;
  const examScore = examMode.questions.filter(isExamAnswerCorrect).length;
  const wrongExamQuestions = examMode.submitted
    ? examMode.questions.filter((question) => !isExamAnswerCorrect(question))
    : [];
  const activeFlashcard = flashcards.cards[flashcards.activeIndex];
  const hardFlashcardCount = flashcards.cards.filter((card) => card.difficulty === "hard").length;
  const laterFlashcardCount = flashcards.cards.filter((card) => card.difficulty === "later").length;
  const reviseTodayCount = flashcards.cards.filter((card) => card.reviseAt && new Date(card.reviseAt).getTime() <= Date.now()).length;
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

      // Load profile and chats independently so a profile failure doesn't block chat sync
      try {
        const snapshot = await getDoc(doc(db, "users", user.uid));
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
      } catch (profileError) {
        console.error("Detox AI: Could not load user profile.", profileError);
      }

      // Load remote chats separately — this is the critical part for cross-device sync
      try {
        const accountThreads = await loadAccountThreads(user);
        if (isMounted) {
          setThreads(accountThreads);
          setActiveThreadId(accountThreads[0]?.id ?? "");
          window.localStorage.setItem(getChatStorageKey(user.uid), JSON.stringify(accountThreads));
        }
      } catch (chatError) {
        console.error("Detox AI: Could not load cloud chats.", chatError);
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

  useEffect(() => {
    window.localStorage.setItem(SAFE_MODE_STORAGE_KEY, safeMode ? "on" : "off");
  }, [safeMode]);

  useEffect(() => {
    window.localStorage.setItem(FOCUS_MODE_STORAGE_KEY, JSON.stringify(focusMode));
  }, [focusMode]);

  useEffect(() => {
    window.localStorage.setItem(MESSAGE_REACTIONS_STORAGE_KEY, JSON.stringify(messageReactions));
  }, [messageReactions]);

  useEffect(() => {
    window.localStorage.setItem(LAB_VOTES_STORAGE_KEY, JSON.stringify(labVotes));
  }, [labVotes]);

  useEffect(() => {
    window.localStorage.setItem(REVISION_NOTIFIED_STORAGE_KEY, JSON.stringify(notifiedRevisionIds));
  }, [notifiedRevisionIds]);

  useEffect(() => {
    window.localStorage.setItem(CANVAS_STORAGE_KEY, JSON.stringify(canvasWorkspace));
  }, [canvasWorkspace]);

  useEffect(() => {
    window.localStorage.setItem(TASK_GENERATOR_STORAGE_KEY, JSON.stringify(taskGenerator));
  }, [taskGenerator]);

  useEffect(() => {
    window.localStorage.setItem(EXAM_MODE_STORAGE_KEY, JSON.stringify(examMode));
  }, [examMode]);

  useEffect(() => {
    window.localStorage.setItem(FLASHCARD_STORAGE_KEY, JSON.stringify(flashcards));
  }, [flashcards]);

  useEffect(() => {
    if (!examMode.questions.length || examMode.submitted || examMode.remainingSeconds <= 0) return;

    const interval = window.setInterval(() => {
      setExamMode((current) => {
        if (!current.questions.length || current.submitted) return current;
        const nextSeconds = Math.max(0, current.remainingSeconds - 1);
        return {
          ...current,
          remainingSeconds: nextSeconds,
          submitted: nextSeconds === 0 ? true : current.submitted,
          updatedAt: new Date().toISOString(),
        };
      });
    }, 1000);

    return () => window.clearInterval(interval);
  }, [examMode.questions.length, examMode.remainingSeconds, examMode.submitted]);

  useEffect(() => {
    const interval = window.setInterval(() => setClockNow(Date.now()), 1000);
    return () => window.clearInterval(interval);
  }, []);

  useEffect(() => {
    if (!focusMode.enabled || !focusMode.running || focusMode.remainingSeconds <= 0) return;

    const interval = window.setInterval(() => {
      setFocusMode((current) => {
        if (!current.enabled || !current.running) return current;
        const remainingSeconds = Math.max(0, current.remainingSeconds - 1);
        return {
          ...current,
          remainingSeconds,
          running: remainingSeconds > 0,
        };
      });
    }, 1000);

    return () => window.clearInterval(interval);
  }, [focusMode.enabled, focusMode.remainingSeconds, focusMode.running]);

  useEffect(() => {
    const timers = flashcards.cards
      .filter((card) => card.reviseAt && !notifiedRevisionIds.includes(card.id))
      .map((card) => {
        const delay = Math.max(0, new Date(card.reviseAt ?? "").getTime() - Date.now());
        return window.setTimeout(async () => {
          if ("Notification" in window) {
            if (Notification.permission === "default") {
              await Notification.requestPermission().catch(() => "denied");
            }
            if (Notification.permission === "granted") {
              new Notification("Detox AI revision time", {
                body: `${card.revisionLabel ?? "Revise"}: ${card.question.slice(0, 90)}`,
              });
            }
          }
          setNotifiedRevisionIds((current) => current.includes(card.id) ? current : [...current, card.id]);
        }, delay);
      });

    return () => timers.forEach((timer) => window.clearTimeout(timer));
  }, [flashcards.cards, notifiedRevisionIds]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth", block: "end" });
  }, [messages.length, isLoading, activeThreadId]);

  useEffect(() => {
    if (!isAuthReady) return;

    const pendingPrompt = window.localStorage.getItem(PENDING_CHAT_PROMPT_KEY);
    if (!pendingPrompt) return;

    window.localStorage.removeItem(PENDING_CHAT_PROMPT_KEY);
    const timeoutId = window.setTimeout(() => {
      setInput((current) => current.trim() ? current : pendingPrompt);
      showNotice("Learning lesson loaded in chat.");
    }, 0);

    return () => window.clearTimeout(timeoutId);
  }, [isAuthReady]);

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

  function applySlashCommand(command: (typeof slashCommands)[number]) {
    const currentRemainder = input.replace(/^\/\S*\s*/, "").trim();
    setInput(`${command.instruction}\n\n${currentRemainder}`);
    showNotice(`${command.command} command ready.`);
  }

  async function refreshPlan() {
    if (!currentUser) return;
    try {
      const snapshot = await getDoc(doc(db, "users", currentUser.uid));
      const profileData = snapshot.data();
      if (!profileData) return;

      const storedPlan = currentUser.email === CREATOR_EMAIL ? "creator" : normalizePlan(profileData.plan);
      const expiresAt = dateFromUnknown(profileData.planExpiresAt);
      const paidPlanExpired = storedPlan !== "free" && storedPlan !== "creator" && expiresAt && expiresAt.getTime() <= Date.now();

      if (paidPlanExpired) {
        setAccountPlan("free");
      } else {
        setAccountPlan(storedPlan);
      }
    } catch {
      // If refresh fails, continue with the current plan — the server will validate anyway
    }
  }

  async function sendMessage(text = input, appendUser = true) {
    const rawText = text.trim();
    if (!rawText || isLoading || !activeThread) return;

    setChatError(null);
    const resolvedText = resolveSlashCommandText(rawText);
    const safetyInstruction = safeMode
      ? "\n\nSafety Mode is on. Reply more carefully for students and younger users: keep it age-appropriate, avoid risky instructions, explain uncertainty, encourage asking a trusted adult for serious health, legal, safety, or payment issues, and keep the tone calm and helpful."
      : "";
    const focusInstruction = focusMode.enabled
      ? `\n\nFocus Mode is on. Help the user stay focused on this goal: ${focusMode.goal.trim() || "the current study or coding session"}. Keep the answer direct, structured, and distraction-free.`
      : "";
    const trimmed = `${resolvedText.aiText}${safetyInstruction}${focusInstruction}`;
    const displayText = resolvedText.displayText;

    if (!currentUser) {
      setUpgradeNotice("Please login or create an account before messaging Detox AI.");
      return;
    }

    // Re-read the user's plan from Firestore to catch any creator-assigned changes
    await refreshPlan();

    if (dailyUsed >= effectiveDailyLimit || monthlyUsed >= effectiveMonthlyLimit) {
      setChatError({
        title: dailyUsed >= effectiveDailyLimit ? "You used today's free messages." : "You used this month's messages.",
        message: dailyUsed >= effectiveDailyLimit
          ? `Come back after reset in ${formatCountdown(nextDailyReset(), clockNow)} or upgrade for more messages.`
          : "Your monthly message limit is finished. Upgrade to keep chatting today.",
        tone: "limit",
      });
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
        ? `${displayText}\n\nAttached files: ${attachments.join(", ")}`
        : displayText,
      modelId: selectedModel,
      createdAt: now,
    };

    if (appendUser) {
      updateActiveThread((thread) => ({
        ...thread,
        title: thread.messages.length ? thread.title : titleFromMessage(displayText),
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
      const canvasInstruction = canvasWorkspace.enabled
        ? `\n\nCanvas Mode is active. Create content for ${activeCanvasType.label}. ${activeCanvasType.prompt} Return the canvas-ready content directly with strong headings, editable sections, and no meta commentary about the canvas UI.`
        : "";
      const response = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          message: `${trimmed}${canvasInstruction}`,
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
      if (canvasWorkspace.enabled) {
        updateCanvas({
          title: activeThread.title === "New Chat" ? titleFromMessage(displayText) : activeThread.title,
          content: assistantMessage.content,
        });
      }
      if (highTemperatureMode) {
        setHighTempUsage((current) => ({
          ...current,
          used: current.used + 1,
        }));
      }
      void recordUsage(userMessage, assistantMessage, data.tokensUsed ?? 0);
    } catch {
      setChatError({
        title: "Detox AI is thinking too hard right now.",
        message: "Try again in a moment.",
        tone: "error",
        retryText: rawText,
      });
      const assistantMessage: ChatMessage = {
        id: crypto.randomUUID(),
        role: "assistant",
        modelId: selectedModel,
        content: "Detox AI is thinking too hard right now.\n\nTry again in a moment.",
        createdAt: new Date().toISOString(),
      };

      updateActiveThread((thread) => ({
        ...thread,
        updatedAt: assistantMessage.createdAt,
        messages: [...thread.messages, assistantMessage],
      }));
      void recordUsage(userMessage, assistantMessage, 0);
    } finally {
      setIsLoading(false);
    }
  }

  async function recordUsage(userMessage: ChatMessage, assistantMessage: ChatMessage, tokensUsed: number) {
    if (!currentUser || !activeThread) return;

    const now = serverTimestamp();
    const userEmail = currentUser.email ?? "";
    const chatTitle = activeThread.title === "New Chat" ? titleFromMessage(userMessage.content) : activeThread.title;

    // Write user stats, chat doc, and messages INDEPENDENTLY
    // so a failure in one doesn't block the others
    const results = await Promise.allSettled([
      // 1. Update user stats
      setDoc(
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
      ),
      // 2. Save chat document
      setDoc(
        doc(db, "chats", activeThread.id),
        {
          chatId: activeThread.id,
          userId: currentUser.uid,
          userEmail,
          title: chatTitle,
          modelId: selectedModel,
          createdAt: activeThread.createdAt,
          updatedAt: now,
          messageCount: increment(2),
          lastMessageAt: now,
          isDeleted: false,
        },
        { merge: true },
      ),
      // 3. Save user message
      setDoc(
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
      ),
      // 4. Save assistant message
      setDoc(
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
      ),
    ]);

    const failures = results.filter((r) => r.status === "rejected");
    if (failures.length > 0) {
      for (const f of failures) {
        console.error("Detox AI: Firestore write failed.", (f as PromiseRejectedResult).reason);
      }
      showNotice("Chat could not be saved to cloud. Check your connection.");
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

  function runSmartReplyPreset(message: ChatMessage, preset: (typeof smartReplyPresets)[number]) {
    if (isLoading) {
      showNotice("Wait for the current answer to finish first.");
      return;
    }

    void sendMessage(`${preset.instruction}\n\nAnswer to transform:\n\n${message.content}`);
  }

  async function reactToMessage(message: ChatMessage, reaction: MessageReaction) {
    setMessageReactions((current) => ({
      ...current,
      [message.id]: reaction,
    }));

    if (!currentUser) {
      showNotice("Reaction saved locally.");
      return;
    }

    try {
      await setDoc(
        doc(db, "message_reactions", `${currentUser.uid}_${message.id}`),
        {
          reactionId: `${currentUser.uid}_${message.id}`,
          messageId: message.id,
          chatId: activeThread.id,
          modelId: message.modelId ?? selectedModel,
          reaction,
          userId: currentUser.uid,
          userEmail: currentUser.email,
          createdAt: serverTimestamp(),
          updatedAt: serverTimestamp(),
        },
        { merge: true },
      );
      showNotice("Reaction saved for analytics.");
    } catch {
      showNotice("Reaction saved locally. Cloud sync can retry later.");
    }
  }

  function askAgainBetter(message: ChatMessage) {
    void sendMessage(
      `Improve the previous answer. Make it clearer, more detailed, and more useful.\n\nPrevious answer:\n\n${message.content}`,
    );
  }

  async function keepComparedAnswer(messageId: string, content: string) {
    const now = new Date().toISOString();
    updateActiveThread((thread) => ({
      ...thread,
      messages: thread.messages.map((message) =>
        message.id === messageId ? { ...message, content, createdAt: now } : message,
      ),
      updatedAt: now,
    }));
    setComparePanel(null);

    if (currentUser) {
      try {
        await setDoc(
          doc(db, "messages", messageId),
          {
            content,
            updatedAt: serverTimestamp(),
            compareKept: true,
          },
          { merge: true },
        );
      } catch {
        showNotice("Answer kept here. Cloud update can retry later.");
        return;
      }
    }
    showNotice("Answer style kept.");
  }

  async function voteForLab(featureId: string) {
    setLabVotes((current) => ({
      ...current,
      [featureId]: (current[featureId] ?? 0) + 1,
    }));

    if (currentUser) {
      try {
        await setDoc(
          doc(db, "lab_votes", `${currentUser.uid}_${featureId}`),
          {
            voteId: `${currentUser.uid}_${featureId}`,
            featureId,
            userId: currentUser.uid,
            userEmail: currentUser.email,
            updatedAt: serverTimestamp(),
          },
          { merge: true },
        );
      } catch {
        showNotice("Vote saved locally.");
        return;
      }
    }
    showNotice("Lab vote counted.");
  }

  function runQuickTool(title: string, prompt: string) {
    const topic = input.trim();
    const quickPrompt = topic
      ? `${prompt}${topic}`
      : `${prompt}Give me a strong, practical starter result for ${title}. Include clear sections, examples, and next steps.`;
    void sendMessage(quickPrompt);
  }

  function updateTaskGenerator(patch: Partial<TaskGeneratorState>) {
    setTaskGenerator((current) => ({
      ...current,
      ...patch,
      updatedAt: new Date().toISOString(),
    }));
  }

  function generateTasksFromGoal() {
    const goal = taskGenerator.goal.trim();
    if (!goal) {
      showNotice("Add a goal first.");
      return;
    }

    updateTaskGenerator({ tasks: createTasksForGoal(goal) });
  }

  function toggleTaskDone(taskIdValue: string) {
    updateTaskGenerator({
      tasks: taskGenerator.tasks.map((task) =>
        task.id === taskIdValue ? { ...task, done: !task.done } : task,
      ),
    });
  }

  function askAiAboutTask(task: GeneratedTask) {
    const goal = taskGenerator.goal.trim() || "this project";
    void sendMessage(
      `Help me complete this task for my goal: ${goal}\n\nTask: ${task.title}\n\nGive me the exact steps, important decisions, and common mistakes to avoid.`,
    );
  }

  function saveTaskToProject(task: GeneratedTask) {
    const savedTask = { ...task, saved: true };
    const alreadySaved = taskGenerator.savedProjectTasks.some((item) => item.id === task.id);
    updateTaskGenerator({
      tasks: taskGenerator.tasks.map((item) => (item.id === task.id ? savedTask : item)),
      savedProjectTasks: alreadySaved
        ? taskGenerator.savedProjectTasks.map((item) => (item.id === task.id ? savedTask : item))
        : [savedTask, ...taskGenerator.savedProjectTasks],
    });
    showNotice("Task saved to project.");
  }

  function clearGeneratedTasks() {
    updateTaskGenerator({ tasks: [] });
    showNotice("Tasks cleared.");
  }

  function updateExamMode(patch: Partial<ExamModeState>) {
    setExamMode((current) => ({
      ...current,
      ...patch,
      updatedAt: new Date().toISOString(),
    }));
  }

  async function generateExamQuiz() {
    if (!examMode.topic.trim()) {
      showNotice("Add an exam topic first.");
      return;
    }

    setIsExamGenerating(true);

    try {
      let questions = createExamQuestions(examMode);
      if (currentUser) {
        const idToken = await currentUser.getIdToken();
        const response = await fetch("/api/exam/generate", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            idToken,
            subject: examMode.subject,
            classLevel: examMode.classLevel,
            topic: examMode.topic,
            difficulty: examMode.difficulty,
          }),
        });
        const data = await response.json();
        if (response.ok && Array.isArray(data.questions) && data.questions.length) {
          questions = data.questions.map((question: Partial<ExamQuestion>) => ({
            id: taskId(),
            type: question.type === "short" ? "short" : "mcq",
            prompt: String(question.prompt ?? "Answer this question."),
            options: question.type === "short"
              ? undefined
              : Array.isArray(question.options) && question.options.length >= 4
                ? question.options.map(String).slice(0, 4)
                : [
                    String(question.answer ?? "Correct answer"),
                    "A related but incomplete answer",
                    "An unrelated answer",
                    "A confusing extra detail",
                  ],
            answer: String(question.answer ?? ""),
            explanation: String(question.explanation ?? "Review the key concept and compare it with your answer."),
            userAnswer: "",
            createdAt: new Date().toISOString(),
          }));
        }
      }

      updateExamMode({
        questions,
        remainingSeconds: examMode.durationMinutes * 60,
        submitted: false,
        startedAt: new Date().toISOString(),
      });
    } catch {
      updateExamMode({
        questions: createExamQuestions(examMode),
        remainingSeconds: examMode.durationMinutes * 60,
        submitted: false,
        startedAt: new Date().toISOString(),
      });
    } finally {
      setIsExamGenerating(false);
    }
  }

  function updateExamAnswer(questionId: string, answer: string) {
    updateExamMode({
      questions: examMode.questions.map((question) =>
        question.id === questionId ? { ...question, userAnswer: answer } : question,
      ),
    });
  }

  function submitExamQuiz() {
    if (!examMode.questions.length) {
      showNotice("Generate a quiz first.");
      return;
    }

    updateExamMode({ submitted: true });
    showNotice("Exam submitted.");
  }

  function resetExamQuiz() {
    updateExamMode({
      questions: [],
      submitted: false,
      remainingSeconds: examMode.durationMinutes * 60,
      startedAt: "",
    });
  }

  function reviewExamQuestion(question: ExamQuestion) {
    void sendMessage(
      `Review this wrong exam answer and teach me the correct concept.\n\nSubject: ${examMode.subject}\nClass: ${examMode.classLevel}\nTopic: ${examMode.topic}\nDifficulty: ${examMode.difficulty}\n\nQuestion: ${question.prompt}\nMy answer: ${question.userAnswer || "No answer"}\nCorrect answer: ${question.answer}\n\nExplain why my answer is wrong, then give the correct method and one similar practice question.`,
    );
  }

  function updateFlashcards(patch: Partial<FlashcardState>) {
    setFlashcards((current) => ({
      ...current,
      ...patch,
      updatedAt: new Date().toISOString(),
    }));
  }

  function updateFocusMode(patch: Partial<FocusModeState>) {
    setFocusMode((current) => {
      const durationMinutes = patch.durationMinutes ?? current.durationMinutes;
      const durationChanged = patch.durationMinutes !== undefined && patch.durationMinutes !== current.durationMinutes;
      return {
        ...current,
        ...patch,
        durationMinutes,
        remainingSeconds: durationChanged ? durationMinutes * 60 : patch.remainingSeconds ?? current.remainingSeconds,
      };
    });
  }

  function startFocusSession(minutes = focusMode.durationMinutes) {
    updateFocusMode({
      enabled: true,
      durationMinutes: minutes,
      remainingSeconds: minutes * 60,
      running: true,
    });
    showNotice(`Focus for ${minutes} minutes started.`);
  }

  async function scheduleFlashcardRevision(card: Flashcard, label: "today" | "tomorrow" | "three-days") {
    const target = revisionTarget(label);
    const labelText = label === "today" ? "Revise today" : label === "tomorrow" ? "Revise tomorrow" : "Revise after 3 days";
    updateActiveFlashcard({
      difficulty: "later",
      reviseAt: target.toISOString(),
      revisionLabel: labelText,
    });

    if ("Notification" in window) {
      if (Notification.permission === "default") {
        await Notification.requestPermission().catch(() => "denied");
      }
      if (Notification.permission === "granted") {
        new Notification("Detox AI revision reminder saved", {
          body: `${labelText}: ${card.question.slice(0, 80)}`,
        });
      }
    }

    if (currentUser) {
      try {
        await setDoc(
          doc(db, "revision_reminders", `${currentUser.uid}_${card.id}`),
          {
            userId: currentUser.uid,
            userEmail: currentUser.email,
            cardId: card.id,
            topic: flashcards.topic,
            classLevel: flashcards.classLevel,
            question: card.question,
            answer: card.answer,
            reviseAt: target.toISOString(),
            revisionLabel: labelText,
            status: "scheduled",
            createdAt: serverTimestamp(),
            updatedAt: serverTimestamp(),
          },
          { merge: true },
        );
      } catch {
        showNotice("Reminder saved locally. Cloud sync will retry later.");
      }
    }

    showNotice(`${labelText} reminder saved.`);
  }

  async function generateFlashcards() {
    const topic = flashcards.topic.trim();
    if (!topic) {
      showNotice("Add a flashcard topic first.");
      return;
    }

    setIsFlashcardGenerating(true);

    try {
      let cards = createFlashcardsForTopic(topic, flashcards.classLevel);
      if (currentUser) {
        const idToken = await currentUser.getIdToken();
        const response = await fetch("/api/flashcards/generate", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            idToken,
            topic,
            classLevel: flashcards.classLevel,
          }),
        });
        const data = await response.json();
        if (response.ok && Array.isArray(data.cards) && data.cards.length) {
          cards = data.cards.map((card: Partial<Flashcard>) => ({
            id: taskId(),
            question: String(card.question ?? "Question"),
            answer: String(card.answer ?? "Answer"),
            flipped: false,
            difficulty: "new",
            createdAt: new Date().toISOString(),
          }));
        }
      }

      updateFlashcards({ cards, activeIndex: 0 });
    } catch {
      updateFlashcards({ cards: createFlashcardsForTopic(topic, flashcards.classLevel), activeIndex: 0 });
    } finally {
      setIsFlashcardGenerating(false);
    }
  }

  function updateActiveFlashcard(patch: Partial<Flashcard>) {
    if (!activeFlashcard) return;
    updateFlashcards({
      cards: flashcards.cards.map((card) => (card.id === activeFlashcard.id ? { ...card, ...patch } : card)),
    });
  }

  function moveFlashcard(direction: -1 | 1) {
    if (!flashcards.cards.length) return;
    updateFlashcards({
      activeIndex: (flashcards.activeIndex + direction + flashcards.cards.length) % flashcards.cards.length,
    });
  }

  function askAiAboutFlashcard(card: Flashcard) {
    void sendMessage(
      `Teach me this flashcard clearly.\n\nClass: ${flashcards.classLevel}\nTopic: ${flashcards.topic}\nQuestion: ${card.question}\nAnswer: ${card.answer}\n\nExplain it simply, add one example, and give one memory trick.`,
    );
  }

  function useVoicePlaceholder() {
    setInput((current) => current || "Voice note placeholder: ");
    showNotice("Voice input UI is ready. Browser speech capture can be connected next.");
  }

  function clearAttachments() {
    setAttachments([]);
    showNotice("Attachments cleared.");
  }

  function updateCanvas(patch: Partial<CanvasWorkspace>) {
    setCanvasWorkspace((current) => ({
      ...current,
      ...patch,
      updatedAt: new Date().toISOString(),
    }));
  }

  function selectCanvasType(type: CanvasType) {
    const nextType = canvasTypes.find((canvas) => canvas.id === type);
    if (!nextType) return;

    updateCanvas({
      enabled: true,
      type,
      title: canvasWorkspace.title === "Untitled Canvas" ? nextType.label : canvasWorkspace.title,
    });
  }

  function startCanvasPrompt() {
    updateCanvas({ enabled: true });
    setInput((current) => current || `Create a ${activeCanvasType.label.toLowerCase()} for `);
    showNotice("Canvas Mode is ready.");
  }

  async function copyCanvas() {
    if (!canvasWorkspace.content.trim()) {
      showNotice("Canvas is empty.");
      return;
    }

    await navigator.clipboard.writeText(canvasWorkspace.content);
    showNotice("Canvas copied.");
  }

  function downloadCanvas() {
    if (!canvasWorkspace.content.trim()) {
      showNotice("Canvas is empty.");
      return;
    }

    const extension = canvasWorkspace.type === "code" ? "md" : "txt";
    const safeTitle = canvasWorkspace.title
      .trim()
      .replace(/[^a-z0-9]+/gi, "-")
      .replace(/^-|-$/g, "")
      .toLowerCase() || "detox-canvas";
    const blob = new Blob([canvasWorkspace.content], { type: "text/plain;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `${safeTitle}.${extension}`;
    link.click();
    URL.revokeObjectURL(url);
    showNotice("Canvas downloaded.");
  }

  function clearCanvas() {
    updateCanvas({
      title: "Untitled Canvas",
      content: "",
    });
    showNotice("Canvas cleared.");
  }

  function sendLastAnswerToCanvas() {
    const lastAssistant = [...messages].reverse().find((message) => message.role === "assistant");
    if (!lastAssistant) {
      showNotice("No AI answer to send to canvas yet.");
      return;
    }

    updateCanvas({
      enabled: true,
      title: activeThread?.title && activeThread.title !== "New Chat" ? activeThread.title : activeCanvasType.label,
      content: lastAssistant.content,
    });
    showNotice("Latest answer moved to canvas.");
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
            <div className="mt-3 grid grid-cols-2 gap-2">
              <Link
                href="/pricing"
                onClick={() => setIsMobileSidebarOpen(false)}
                className="flex h-11 items-center justify-center gap-2 rounded-xl border border-cyan-300/20 bg-cyan-300/10 text-sm font-semibold text-cyan-50"
              >
                <Crown size={16} />
                Plans
              </Link>
              <Link
                href="/payment"
                onClick={() => setIsMobileSidebarOpen(false)}
                className="flex h-11 items-center justify-center gap-2 rounded-xl border border-emerald-300/20 bg-emerald-300/10 text-sm font-semibold text-emerald-50"
              >
                <CreditCard size={16} />
                Subscribe
              </Link>
            </div>
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

      <div className={`${focusMode.enabled ? "grid h-screen grid-cols-1 overflow-hidden" : "grid h-screen overflow-hidden xl:grid-cols-[300px_minmax(0,1fr)_330px] lg:grid-cols-[280px_minmax(0,1fr)]"}`}>
        {!focusMode.enabled ? (
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
        ) : null}

        <main className="relative flex h-screen min-h-0 flex-col overflow-hidden border-r border-white/10 bg-[#020713]">
          <header className={`${focusMode.enabled ? "border-b border-cyan-300/15 bg-[#020713]/96" : "border-b border-white/10 bg-[#050b18]/88"} z-30 shrink-0 px-4 py-3 backdrop-blur-xl`}>
            <div className="flex items-center gap-3">
              {!focusMode.enabled ? (
              <button onClick={() => setIsMobileSidebarOpen(true)} className="grid size-10 place-items-center rounded-xl border border-white/10 text-slate-200 lg:hidden" aria-label="Open history">
                <PanelLeft size={18} />
              </button>
              ) : null}
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
                <button
                  type="button"
                  onClick={() => updateCanvas({ enabled: !canvasWorkspace.enabled })}
                  className={`hidden h-10 items-center gap-2 rounded-xl border px-3 text-sm font-semibold transition md:inline-flex ${
                    canvasWorkspace.enabled
                      ? "border-cyan-300/35 bg-cyan-300/12 text-cyan-100"
                      : "border-white/10 bg-white/5 text-slate-200 hover:text-white"
                  }`}
                >
                  <CanvasIcon size={16} />
                  Canvas
                </button>
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
            {focusMode.enabled ? (
              <div className="mt-3 grid gap-2 rounded-2xl border border-cyan-300/15 bg-cyan-300/8 p-2 sm:grid-cols-[1fr_120px_140px_auto] sm:items-center">
                <input
                  value={focusMode.goal}
                  onChange={(event) => updateFocusMode({ goal: event.target.value })}
                  placeholder="Focus goal, e.g. Build login page"
                  className="h-10 min-w-0 rounded-xl border border-white/10 bg-black/20 px-3 text-sm text-white outline-none placeholder:text-slate-500"
                />
                <input
                  type="number"
                  min={1}
                  max={180}
                  value={focusMode.durationMinutes}
                  onChange={(event) => updateFocusMode({ durationMinutes: Math.min(180, Math.max(1, Number(event.target.value) || 25)), running: false })}
                  className="h-10 min-w-0 rounded-xl border border-white/10 bg-black/20 px-3 text-sm text-white outline-none"
                  aria-label="Focus minutes"
                />
                <div className="flex h-10 items-center justify-center rounded-xl border border-white/10 bg-black/20 font-mono text-lg font-semibold text-cyan-100">
                  {formatFocusTime(focusMode.remainingSeconds)}
                </div>
                <button
                  type="button"
                  onClick={() => focusMode.running ? updateFocusMode({ running: false }) : startFocusSession(focusMode.durationMinutes)}
                  className="inline-flex h-10 items-center justify-center gap-2 rounded-xl bg-cyan-200 px-4 text-sm font-semibold text-slate-950 hover:brightness-110"
                >
                  <Timer size={15} />
                  {focusMode.running ? "Pause" : focusMode.remainingSeconds === 0 ? "Restart" : "Start"}
                </button>
              </div>
            ) : null}
          </header>

          {notice ? (
            <div className="pointer-events-none fixed left-1/2 top-20 z-40 -translate-x-1/2 rounded-full border border-cyan-300/20 bg-[#091221]/95 px-4 py-2 text-sm text-cyan-100 shadow-2xl">
              {notice}
            </div>
          ) : null}

          <div className={`min-h-0 flex-1 ${canvasWorkspace.enabled ? "flex flex-col lg:flex-row" : "flex"}`}>
            <section className="detox-scrollbar min-h-0 flex-1 overflow-y-auto px-3 py-5 sm:px-6">
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

              {chatError ? (
                <div className={`mt-5 rounded-2xl border p-4 text-sm ${
                  chatError.tone === "limit"
                    ? "border-amber-300/25 bg-amber-300/10 text-amber-50"
                    : "border-red-300/25 bg-red-400/10 text-red-50"
                }`}>
                  <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                    <div>
                      <p className="font-semibold">{chatError.title}</p>
                      <p className="mt-1 text-slate-300">{chatError.message}</p>
                      {chatError.tone === "limit" ? (
                        <p className="mt-1 text-xs text-slate-400">Daily reset: {formatCountdown(nextDailyReset(), clockNow)}</p>
                      ) : null}
                    </div>
                    <div className="flex gap-2">
                      {chatError.retryText ? (
                        <button
                          type="button"
                          onClick={() => sendMessage(chatError.retryText)}
                          className="inline-flex h-9 items-center justify-center rounded-xl bg-white px-4 text-xs font-semibold text-slate-950"
                        >
                          Retry
                        </button>
                      ) : null}
                      {chatError.tone === "limit" ? (
                        <Link href="/pricing" className="inline-flex h-9 items-center justify-center rounded-xl bg-amber-200 px-4 text-xs font-semibold text-amber-950">
                          Upgrade
                        </Link>
                      ) : null}
                    </div>
                  </div>
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
                              <button onClick={() => askAgainBetter(message)} className="inline-flex h-8 items-center gap-1 rounded-lg border border-white/10 px-2 text-xs text-slate-300 hover:text-white">
                                <RefreshCcw size={13} />
                                Ask Again Better
                              </button>
                              <button
                                type="button"
                                onClick={() => setComparePanel((current) => current?.messageId === message.id ? null : { messageId: message.id, mode: "simple-detailed" })}
                                className="inline-flex h-8 items-center gap-1 rounded-lg border border-white/10 px-2 text-xs text-slate-300 hover:text-white"
                              >
                                <Table2 size={13} />
                                Compare
                              </button>
                              <div className="flex basis-full flex-wrap gap-2 border-t border-white/10 pt-3">
                                {reactionOptions.map(([reaction, label]) => (
                                  <button
                                    key={reaction}
                                    type="button"
                                    onClick={() => reactToMessage(message, reaction)}
                                    className={`inline-flex min-h-8 items-center rounded-lg border px-2.5 text-xs font-medium transition ${
                                      messageReactions[message.id] === reaction
                                        ? "border-amber-300/35 bg-amber-300/12 text-amber-100"
                                        : "border-white/10 bg-white/[0.035] text-slate-300 hover:bg-white/8 hover:text-white"
                                    }`}
                                  >
                                    {label}
                                  </button>
                                ))}
                              </div>
                              {comparePanel?.messageId === message.id ? (
                                <div className="basis-full rounded-xl border border-cyan-300/15 bg-cyan-300/[0.055] p-3">
                                  <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
                                    <p className="text-xs font-semibold uppercase tracking-[0.18em] text-cyan-100">AI Compare Answer Mode</p>
                                    <div className="flex rounded-lg border border-white/10 bg-black/20 p-0.5">
                                      {[
                                        ["simple-detailed", "Simple / Detailed"],
                                        ["friendly-professional", "Friendly / Pro"],
                                      ].map(([mode, label]) => (
                                        <button
                                          key={mode}
                                          type="button"
                                          onClick={() => setComparePanel({ messageId: message.id, mode: mode as CompareMode })}
                                          className={`rounded-md px-2 py-1 text-[11px] font-semibold ${
                                            comparePanel.mode === mode ? "bg-cyan-200 text-slate-950" : "text-slate-400 hover:text-white"
                                          }`}
                                        >
                                          {label}
                                        </button>
                                      ))}
                                    </div>
                                  </div>
                                  <div className="grid gap-2 md:grid-cols-2">
                                    {createCompareVariants(message.content, comparePanel.mode).map((variant) => (
                                      <article key={variant.label} className="rounded-lg border border-white/10 bg-black/20 p-3">
                                        <div className="mb-2 flex items-center justify-between gap-2">
                                          <div>
                                            <p className="text-sm font-semibold text-white">{variant.label}</p>
                                            <p className="text-[11px] text-slate-500">{variant.tone}</p>
                                          </div>
                                          <button
                                            type="button"
                                            onClick={() => keepComparedAnswer(message.id, variant.content)}
                                            className="shrink-0 rounded-lg bg-cyan-200 px-2.5 py-1 text-[11px] font-semibold text-slate-950"
                                          >
                                            Keep
                                          </button>
                                        </div>
                                        <p className="max-h-32 overflow-hidden whitespace-pre-wrap text-xs leading-5 text-slate-300">{variant.content}</p>
                                      </article>
                                    ))}
                                  </div>
                                </div>
                              ) : null}
                              <div className="flex basis-full flex-wrap gap-2 border-t border-white/10 pt-3">
                                {smartReplyPresets.map((preset) => {
                                  const PresetIcon = preset.icon;
                                  return (
                                    <button
                                      key={preset.label}
                                      type="button"
                                      onClick={() => runSmartReplyPreset(message, preset)}
                                      disabled={isLoading}
                                      className="inline-flex min-h-8 items-center gap-1.5 rounded-lg border border-cyan-300/15 bg-cyan-300/8 px-2.5 text-xs font-medium text-cyan-50 transition hover:border-cyan-300/35 hover:bg-cyan-300/12 disabled:cursor-not-allowed disabled:opacity-50"
                                    >
                                      <PresetIcon size={13} />
                                      {preset.label}
                                    </button>
                                  );
                                })}
                              </div>
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
                <div ref={messagesEndRef} aria-hidden="true" />
              </div>
            </div>
            </section>

            {canvasWorkspace.enabled ? (
              <aside className="detox-scrollbar min-h-[340px] shrink-0 overflow-y-auto border-t border-white/10 bg-[#050b18]/94 p-4 lg:h-full lg:w-[480px] lg:border-l lg:border-t-0 xl:w-[520px]">
                <div className="flex items-center justify-between gap-3">
                  <div className="flex min-w-0 items-center gap-3">
                    <span className="grid size-10 shrink-0 place-items-center rounded-xl border border-cyan-300/20 bg-cyan-300/10 text-cyan-100">
                      <CanvasIcon size={18} />
                    </span>
                    <div className="min-w-0">
                      <p className="text-xs font-semibold uppercase tracking-[0.2em] text-cyan-200">Canvas Mode</p>
                      <p className="truncate text-sm text-slate-400">{activeCanvasType.label}</p>
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={() => updateCanvas({ enabled: false })}
                    className="grid size-9 place-items-center rounded-xl border border-white/10 text-slate-300 hover:bg-white/8 hover:text-white"
                    aria-label="Close canvas"
                  >
                    <X size={16} />
                  </button>
                </div>

                <div className="mt-4 grid grid-cols-2 gap-2 sm:grid-cols-3 lg:grid-cols-2 xl:grid-cols-3">
                  {canvasTypes.map((canvas) => {
                    const Icon = canvas.icon;
                    const selected = canvasWorkspace.type === canvas.id;
                    return (
                      <button
                        key={canvas.id}
                        type="button"
                        onClick={() => selectCanvasType(canvas.id)}
                        className={`inline-flex min-h-10 items-center justify-center gap-2 rounded-xl border px-2 text-xs font-semibold transition ${
                          selected
                            ? "border-cyan-300 bg-cyan-300 text-slate-950"
                            : "border-white/10 bg-white/5 text-slate-300 hover:bg-white/8 hover:text-white"
                        }`}
                      >
                        <Icon size={14} />
                        {canvas.shortLabel}
                      </button>
                    );
                  })}
                </div>

                <input
                  value={canvasWorkspace.title}
                  onChange={(event) => updateCanvas({ title: event.target.value })}
                  className="mt-4 h-11 w-full rounded-xl border border-white/10 bg-black/20 px-3 text-sm font-semibold text-white outline-none focus:border-cyan-300/50"
                  aria-label="Canvas title"
                />

                <textarea
                  value={canvasWorkspace.content}
                  onChange={(event) => updateCanvas({ content: event.target.value })}
                  placeholder={activeCanvasType.placeholder}
                  className="mt-3 min-h-[360px] w-full resize-none rounded-xl border border-white/10 bg-[#020713]/85 p-4 font-mono text-sm leading-6 text-slate-100 outline-none placeholder:text-slate-600 focus:border-cyan-300/50 lg:min-h-[calc(100vh-330px)]"
                />

                <div className="mt-3 grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={sendLastAnswerToCanvas}
                    className="inline-flex min-h-10 items-center justify-center gap-2 rounded-xl border border-white/10 bg-white/5 px-3 text-xs font-semibold text-slate-200 hover:bg-white/8 hover:text-white"
                  >
                    <Sparkles size={14} />
                    Use Latest
                  </button>
                  <button
                    type="button"
                    onClick={copyCanvas}
                    className="inline-flex min-h-10 items-center justify-center gap-2 rounded-xl border border-white/10 bg-white/5 px-3 text-xs font-semibold text-slate-200 hover:bg-white/8 hover:text-white"
                  >
                    <Copy size={14} />
                    Copy
                  </button>
                  <button
                    type="button"
                    onClick={downloadCanvas}
                    className="inline-flex min-h-10 items-center justify-center gap-2 rounded-xl border border-white/10 bg-white/5 px-3 text-xs font-semibold text-slate-200 hover:bg-white/8 hover:text-white"
                  >
                    <Download size={14} />
                    Download
                  </button>
                  <button
                    type="button"
                    onClick={clearCanvas}
                    className="inline-flex min-h-10 items-center justify-center gap-2 rounded-xl border border-red-300/20 bg-red-400/10 px-3 text-xs font-semibold text-red-100 hover:bg-red-400/15"
                  >
                    <Trash2 size={14} />
                    Clear
                  </button>
                </div>
              </aside>
            ) : null}
          </div>

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
              {showSlashCommandBar ? (
                <div className="mb-2 rounded-xl border border-cyan-300/20 bg-[#06101e] p-1.5 shadow-2xl shadow-black/25">
                  <div className="grid max-h-48 gap-1 overflow-y-auto sm:grid-cols-3">
                    {visibleSlashCommands.map((command) => {
                      const Icon = command.icon;
                      return (
                        <button
                          key={command.command}
                          type="button"
                          onClick={() => applySlashCommand(command)}
                          className="flex min-h-12 items-center gap-2 rounded-lg px-2.5 py-2 text-left transition hover:bg-cyan-300/10"
                        >
                          <span className="grid size-8 shrink-0 place-items-center rounded-lg border border-white/10 bg-white/5 text-cyan-100">
                            <Icon size={15} />
                          </span>
                          <span className="min-w-0">
                            <span className="block truncate text-sm font-semibold text-white">{command.command}</span>
                            <span className="block truncate text-xs text-slate-400">{command.description}</span>
                          </span>
                        </button>
                      );
                    })}
                  </div>
                </div>
              ) : null}
              <textarea
                value={input}
                onChange={(event) => setInput(event.target.value)}
                onKeyDown={(event) => {
                  if (event.key === "Tab" && showSlashCommandBar) {
                    event.preventDefault();
                    applySlashCommand(visibleSlashCommands[0]);
                    return;
                  }

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
                <button
                  onClick={startCanvasPrompt}
                  className={`inline-flex h-9 items-center gap-2 rounded-xl border px-3 text-sm hover:text-white ${
                    canvasWorkspace.enabled
                      ? "border-cyan-300/35 bg-cyan-300/10 text-cyan-100"
                      : "border-white/10 bg-white/5 text-slate-300"
                  }`}
                >
                  <CanvasIcon size={16} />
                  Canvas
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

        {!focusMode.enabled ? (
        <aside className="detox-scrollbar hidden h-screen min-w-0 overflow-x-hidden overflow-y-auto bg-[#050b18]/96 p-4 pb-8 xl:flex xl:flex-col xl:gap-3">
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
            <div className="mx-auto grid max-w-[260px] grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => setSafeMode((value) => !value)}
                className={`inline-flex min-h-12 flex-col items-center justify-center rounded-xl border px-3 text-sm font-semibold transition ${
                  safeMode
                    ? "border-emerald-300/35 bg-emerald-300/12 text-emerald-100"
                    : "border-white/10 bg-white/[0.035] text-slate-300 hover:bg-white/8 hover:text-white"
                }`}
              >
                <span className="inline-flex items-center gap-1.5">
                  <Lock size={13} />
                  Safe
                </span>
                <span>Mode {safeMode ? "On" : "Off"}</span>
              </button>
              <button
                type="button"
                onClick={() => updateFocusMode({ enabled: !focusMode.enabled, running: focusMode.enabled ? false : focusMode.running })}
                className={`inline-flex min-h-12 flex-col items-center justify-center rounded-xl border px-3 text-sm font-semibold transition ${
                  focusMode.enabled
                    ? "border-cyan-300 bg-cyan-300 text-slate-950"
                    : "border-white/10 bg-white/[0.035] text-slate-200 hover:bg-white/8 hover:text-white"
                }`}
              >
                <span className="inline-flex items-center gap-1.5">
                  {focusMode.enabled ? <Minimize2 size={13} /> : <Maximize2 size={13} />}
                  Focus
                </span>
                <span>{focusMode.enabled ? formatFocusTime(focusMode.remainingSeconds) : "25 min"}</span>
              </button>
            </div>
          </section>

          <section className="rounded-2xl border border-emerald-300/15 bg-[#091221]/92 p-3">
            <div className="mb-3 flex items-center justify-between gap-3">
              <h2 className="font-semibold text-white">AI Exam Mode</h2>
              <span className={`inline-flex items-center gap-1 rounded-lg border px-2 py-1 text-xs ${
                examMode.submitted
                  ? "border-emerald-300/25 bg-emerald-300/10 text-emerald-100"
                  : "border-white/10 bg-white/5 text-slate-300"
              }`}>
                {examMode.submitted ? <Trophy size={12} /> : <Timer size={12} />}
                {examMode.submitted ? `${examScore}/${examMode.questions.length}` : formatExamTime(examMode.remainingSeconds)}
              </span>
            </div>

            <div className="grid grid-cols-2 gap-2">
              <label className="grid gap-1 text-xs text-slate-500">
                Subject
                <select
                  value={examMode.subject}
                  onChange={(event) => updateExamMode({ subject: event.target.value })}
                  className="h-9 rounded-lg border border-white/10 bg-black/20 px-2 text-xs text-white outline-none"
                >
                  {examSubjects.map((subject) => (
                    <option key={subject} value={subject} className="bg-slate-950">{subject}</option>
                  ))}
                </select>
              </label>
              <label className="grid gap-1 text-xs text-slate-500">
                Class
                <select
                  value={examMode.classLevel}
                  onChange={(event) => updateExamMode({ classLevel: event.target.value })}
                  className="h-9 rounded-lg border border-white/10 bg-black/20 px-2 text-xs text-white outline-none"
                >
                  {examClasses.map((classLevel) => (
                    <option key={classLevel} value={classLevel} className="bg-slate-950">{classLevel}</option>
                  ))}
                </select>
              </label>
              <label className="grid gap-1 text-xs text-slate-500">
                Difficulty
                <select
                  value={examMode.difficulty}
                  onChange={(event) => updateExamMode({ difficulty: event.target.value as ExamDifficulty })}
                  className="h-9 rounded-lg border border-white/10 bg-black/20 px-2 text-xs capitalize text-white outline-none"
                >
                  {examDifficulties.map((difficulty) => (
                    <option key={difficulty} value={difficulty} className="bg-slate-950">{difficulty}</option>
                  ))}
                </select>
              </label>
              <label className="grid gap-1 text-xs text-slate-500">
                Timer
                <input
                  type="number"
                  min={1}
                  max={30}
                  value={examMode.durationMinutes}
                  onChange={(event) => {
                    const durationMinutes = Math.min(30, Math.max(1, Number(event.target.value) || 5));
                    updateExamMode({ durationMinutes, remainingSeconds: durationMinutes * 60 });
                  }}
                  className="h-9 rounded-lg border border-white/10 bg-black/20 px-2 text-xs text-white outline-none"
                />
              </label>
            </div>

            <label className="mt-2 grid gap-1 text-xs text-slate-500">
              Topic
              <input
                value={examMode.topic}
                onChange={(event) => updateExamMode({ topic: event.target.value })}
                placeholder="Photosynthesis, algebra, grammar..."
                className="h-10 rounded-lg border border-white/10 bg-black/20 px-3 text-sm text-white outline-none placeholder:text-slate-600"
              />
            </label>

            <div className="mt-3 grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={generateExamQuiz}
                disabled={isExamGenerating}
                className="inline-flex min-h-9 items-center justify-center gap-2 rounded-lg bg-emerald-300 px-3 text-xs font-semibold text-slate-950 hover:brightness-110"
              >
                {isExamGenerating ? <RefreshCcw size={14} className="animate-spin" /> : <CircleHelp size={14} />}
                {isExamGenerating ? "Generating" : "Generate Quiz"}
              </button>
              <button
                type="button"
                onClick={submitExamQuiz}
                disabled={!examMode.questions.length || examMode.submitted}
                className="inline-flex min-h-9 items-center justify-center gap-2 rounded-lg border border-white/10 px-3 text-xs font-semibold text-slate-300 hover:bg-white/8 hover:text-white disabled:cursor-not-allowed disabled:opacity-45"
              >
                <Trophy size={14} />
                Submit
              </button>
            </div>

            {examMode.questions.length ? (
              <div className="mt-3 rounded-xl border border-white/10 bg-white/[0.035] p-2">
                <div className="mb-2 flex items-center justify-between text-xs">
                  <span className="text-slate-400">
                    {examMode.questions.filter((question) => question.type === "mcq").length} MCQs + {examMode.questions.filter((question) => question.type === "short").length} short answers
                  </span>
                  <button type="button" onClick={resetExamQuiz} className="font-semibold text-slate-400 hover:text-white">
                    Reset
                  </button>
                </div>
                <div className="h-1.5 overflow-hidden rounded-full bg-slate-800">
                  <div
                    className="h-full rounded-full bg-emerald-300"
                    style={{ width: `${examMode.submitted ? (examScore / examMode.questions.length) * 100 : Math.max(0, (examMode.remainingSeconds / (examMode.durationMinutes * 60)) * 100)}%` }}
                  />
                </div>
              </div>
            ) : null}

            <div className="mt-3 space-y-3">
              {examMode.questions.map((question, index) => {
                const correct = isExamAnswerCorrect(question);
                return (
                  <div key={question.id} className="rounded-xl border border-white/10 bg-white/[0.035] p-3">
                    <div className="mb-2 flex items-start justify-between gap-2">
                      <p className="text-sm font-semibold leading-5 text-slate-100">
                        <span className="mr-1 text-xs text-slate-500">{index + 1}.</span>
                        {question.prompt}
                      </p>
                      <span className="shrink-0 rounded-md border border-white/10 bg-black/20 px-1.5 py-0.5 text-[10px] uppercase text-slate-400">
                        {question.type}
                      </span>
                    </div>

                    {question.type === "mcq" ? (
                      <div className="grid gap-1.5">
                        {question.options?.map((option) => {
                          const selected = question.userAnswer === option;
                          return (
                            <button
                              key={option}
                              type="button"
                              onClick={() => updateExamAnswer(question.id, option)}
                              disabled={examMode.submitted}
                              className={`rounded-lg border px-2 py-2 text-left text-xs leading-4 transition ${
                                selected
                                  ? "border-emerald-300/35 bg-emerald-300/12 text-emerald-50"
                                  : "border-white/10 bg-black/15 text-slate-300 hover:bg-white/8 hover:text-white"
                              } disabled:cursor-default`}
                            >
                              {option}
                            </button>
                          );
                        })}
                      </div>
                    ) : (
                      <textarea
                        value={question.userAnswer}
                        onChange={(event) => updateExamAnswer(question.id, event.target.value)}
                        disabled={examMode.submitted}
                        placeholder="Type your short answer..."
                        rows={3}
                        className="min-h-20 w-full resize-none rounded-lg border border-white/10 bg-black/20 p-2 text-xs leading-5 text-white outline-none placeholder:text-slate-600 disabled:opacity-70"
                      />
                    )}

                    {examMode.submitted ? (
                      <div className={`mt-2 rounded-lg border p-2 text-xs leading-5 ${
                        correct
                          ? "border-emerald-300/20 bg-emerald-300/10 text-emerald-50"
                          : "border-red-300/20 bg-red-400/10 text-red-50"
                      }`}>
                        <p className="font-semibold">{correct ? "Correct" : "Review this"}</p>
                        <p className="mt-1 text-slate-300">Answer: {question.answer}</p>
                        <p className="mt-1 text-slate-400">{question.explanation}</p>
                      </div>
                    ) : null}
                  </div>
                );
              })}
            </div>

            {examMode.submitted && wrongExamQuestions.length ? (
              <div className="mt-3 rounded-xl border border-red-300/20 bg-red-400/10 p-3">
                <p className="text-sm font-semibold text-red-50">Review wrong answers</p>
                <div className="mt-2 grid gap-2">
                  {wrongExamQuestions.map((question, index) => (
                    <button
                      key={question.id}
                      type="button"
                      onClick={() => reviewExamQuestion(question)}
                      className="rounded-lg border border-red-300/20 bg-black/15 px-2 py-2 text-left text-xs leading-4 text-red-50 hover:bg-red-400/10"
                    >
                      {index + 1}. {question.prompt}
                    </button>
                  ))}
                </div>
              </div>
            ) : null}
          </section>

          <section className="rounded-2xl border border-fuchsia-300/15 bg-[#091221]/92 p-3">
            <div className="mb-3 flex items-center justify-between gap-3">
              <h2 className="font-semibold text-white">Flashcards</h2>
              <div className="flex min-w-0 items-center gap-1.5">
                <span className="inline-flex h-8 items-center gap-1 rounded-lg border border-white/10 bg-white/5 px-2 text-xs text-slate-300">
                  <Layers3 size={12} />
                  {flashcards.cards.length}
                </span>
                <span className="inline-flex h-8 items-center rounded-lg border border-cyan-300/20 bg-cyan-300/10 px-2 text-xs font-semibold text-cyan-100">
                  {reviseTodayCount} due
                </span>
              </div>
            </div>

            <div className="mb-2 grid grid-cols-3 gap-1.5">
              <select
                value={flashcards.classLevel}
                onChange={(event) => updateFlashcards({ classLevel: event.target.value })}
                className="h-9 min-w-0 rounded-lg border border-white/10 bg-black/20 px-2 text-xs text-white outline-none"
                aria-label="Flashcard class"
              >
                {examClasses.map((classLevel) => (
                  <option key={classLevel} value={classLevel} className="bg-slate-950">{classLevel}</option>
                ))}
              </select>
              <button
                type="button"
                onClick={() => activeFlashcard ? scheduleFlashcardRevision(activeFlashcard, "today") : showNotice("Generate flashcards first.")}
                className="inline-flex h-9 min-w-0 items-center justify-center rounded-lg border border-white/10 px-2 text-[11px] font-semibold text-slate-300 hover:bg-white/8 hover:text-white"
              >
                Today
              </button>
              <button
                type="button"
                onClick={() => activeFlashcard ? scheduleFlashcardRevision(activeFlashcard, "tomorrow") : showNotice("Generate flashcards first.")}
                className="inline-flex h-9 min-w-0 items-center justify-center rounded-lg border border-white/10 px-2 text-[11px] font-semibold text-slate-300 hover:bg-white/8 hover:text-white"
              >
                Tomorrow
              </button>
            </div>

            <div className="grid gap-2">
              <input
                value={flashcards.topic}
                onChange={(event) => updateFlashcards({ topic: event.target.value })}
                placeholder="Topic for flashcards"
                className="h-10 min-w-0 rounded-lg border border-white/10 bg-black/20 px-3 text-sm text-white outline-none placeholder:text-slate-600"
              />
            </div>

            <button
              type="button"
              onClick={generateFlashcards}
              disabled={isFlashcardGenerating}
              className="mt-2 inline-flex min-h-9 w-full items-center justify-center gap-2 rounded-lg bg-fuchsia-200 px-3 text-xs font-semibold text-slate-950 hover:brightness-110 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {isFlashcardGenerating ? <RefreshCcw size={14} className="animate-spin" /> : <Layers3 size={14} />}
              {isFlashcardGenerating ? "Generating" : "Generate Flashcards"}
            </button>

            {activeFlashcard ? (
              <div className="mt-3">
                <button
                  type="button"
                  onClick={() => updateActiveFlashcard({ flipped: !activeFlashcard.flipped })}
                  className="min-h-52 w-full rounded-2xl border border-fuchsia-300/20 bg-[linear-gradient(145deg,rgba(232,121,249,0.14),rgba(6,182,212,0.08)),linear-gradient(180deg,rgba(15,23,42,0.92),rgba(2,7,19,0.94))] p-4 text-left shadow-[0_18px_60px_rgba(0,0,0,0.28)] transition hover:border-fuchsia-300/35"
                >
                  <div className="mb-4 flex items-center justify-between gap-3 text-xs">
                    <span className="rounded-full border border-white/10 bg-white/6 px-2 py-1 text-slate-300">
                      {flashcards.activeIndex + 1}/{flashcards.cards.length}
                    </span>
                    <span className="rounded-full border border-fuchsia-300/20 bg-fuchsia-300/10 px-2 py-1 text-fuchsia-100">
                      {activeFlashcard.flipped ? "Answer side" : "Question side"}
                    </span>
                  </div>
                  <p className="text-xs font-semibold uppercase tracking-[0.2em] text-fuchsia-200">
                    {activeFlashcard.flipped ? "Answer" : "Question"}
                  </p>
                  <p className="mt-3 text-base font-semibold leading-7 text-white">
                    {activeFlashcard.flipped ? activeFlashcard.answer : activeFlashcard.question}
                  </p>
                  <p className="mt-5 text-xs text-slate-500">Tap card to flip</p>
                </button>

                <div className="mt-2 grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => moveFlashcard(-1)}
                    className="inline-flex min-h-9 items-center justify-center rounded-lg border border-white/10 text-xs font-semibold text-slate-300 hover:bg-white/8 hover:text-white"
                  >
                    Previous
                  </button>
                  <button
                    type="button"
                    onClick={() => moveFlashcard(1)}
                    className="inline-flex min-h-9 items-center justify-center rounded-lg border border-white/10 text-xs font-semibold text-slate-300 hover:bg-white/8 hover:text-white"
                  >
                    Next
                  </button>
                </div>

                <div className="mt-2 grid grid-cols-3 gap-1.5">
                  <button
                    type="button"
                    onClick={() => updateActiveFlashcard({ difficulty: "easy" })}
                    className={`inline-flex min-h-8 items-center justify-center rounded-lg border px-2 text-[11px] font-semibold ${
                      activeFlashcard.difficulty === "easy"
                        ? "border-emerald-300/35 bg-emerald-300/12 text-emerald-100"
                        : "border-white/10 text-slate-300 hover:bg-white/8 hover:text-white"
                    }`}
                  >
                    Easy
                  </button>
                  <button
                    type="button"
                    onClick={() => updateActiveFlashcard({ difficulty: "hard" })}
                    className={`inline-flex min-h-8 items-center justify-center rounded-lg border px-2 text-[11px] font-semibold ${
                      activeFlashcard.difficulty === "hard"
                        ? "border-amber-300/35 bg-amber-300/12 text-amber-100"
                        : "border-white/10 text-slate-300 hover:bg-white/8 hover:text-white"
                    }`}
                  >
                    Hard
                  </button>
                  <button
                    type="button"
                    onClick={() => updateActiveFlashcard({ difficulty: "later" })}
                    className={`inline-flex min-h-8 items-center justify-center rounded-lg border px-2 text-[11px] font-semibold ${
                      activeFlashcard.difficulty === "later"
                        ? "border-cyan-300/35 bg-cyan-300/12 text-cyan-100"
                        : "border-white/10 text-slate-300 hover:bg-white/8 hover:text-white"
                    }`}
                  >
                    Later
                  </button>
                </div>

                <div className="mt-2 grid grid-cols-3 gap-1.5">
                  <button
                    type="button"
                    onClick={() => scheduleFlashcardRevision(activeFlashcard, "today")}
                    className="inline-flex min-h-8 items-center justify-center rounded-lg border border-emerald-300/20 px-2 text-[11px] font-semibold text-emerald-100 hover:bg-emerald-300/10"
                  >
                    Revise today
                  </button>
                  <button
                    type="button"
                    onClick={() => scheduleFlashcardRevision(activeFlashcard, "tomorrow")}
                    className="inline-flex min-h-8 items-center justify-center rounded-lg border border-cyan-300/20 px-2 text-[11px] font-semibold text-cyan-100 hover:bg-cyan-300/10"
                  >
                    Tomorrow
                  </button>
                  <button
                    type="button"
                    onClick={() => scheduleFlashcardRevision(activeFlashcard, "three-days")}
                    className="inline-flex min-h-8 items-center justify-center rounded-lg border border-violet-300/20 px-2 text-[11px] font-semibold text-violet-100 hover:bg-violet-300/10"
                  >
                    3 days
                  </button>
                </div>
                {activeFlashcard.reviseAt ? (
                  <p className="mt-2 rounded-lg border border-cyan-300/15 bg-cyan-300/8 px-2 py-1.5 text-xs text-cyan-50">
                    {activeFlashcard.revisionLabel ?? "Revision"} scheduled for {formatDate(activeFlashcard.reviseAt)}
                  </p>
                ) : null}

                <button
                  type="button"
                  onClick={() => askAiAboutFlashcard(activeFlashcard)}
                  className="mt-2 inline-flex min-h-9 w-full items-center justify-center gap-2 rounded-lg border border-white/10 bg-white/5 px-3 text-xs font-semibold text-slate-200 hover:bg-white/8 hover:text-white"
                >
                  <Sparkles size={14} />
                  Ask AI
                </button>

                <div className="mt-3 grid grid-cols-2 gap-2 text-xs">
                  <div className="rounded-lg border border-white/10 bg-white/[0.035] p-2 text-slate-400">
                    Hard: <span className="font-semibold text-amber-100">{hardFlashcardCount}</span>
                  </div>
                  <div className="rounded-lg border border-white/10 bg-white/[0.035] p-2 text-slate-400">
                    Revise later: <span className="font-semibold text-cyan-100">{laterFlashcardCount}</span>
                  </div>
                </div>
              </div>
            ) : (
              <div className="mt-3 rounded-xl border border-white/10 bg-white/[0.035] p-3 text-sm text-slate-500">
                No flashcards yet.
              </div>
            )}
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

          <section className="rounded-2xl border border-violet-300/15 bg-[#091221]/92 p-3">
            <div className="mb-3 flex items-center justify-between gap-3">
              <div>
                <h2 className="font-semibold text-white">Detox Labs</h2>
                <p className="mt-1 text-xs text-slate-500">Experimental features and beta tools</p>
              </div>
              <span className="rounded-lg border border-violet-300/20 bg-violet-300/10 px-2 py-1 text-xs font-semibold text-violet-100">
                Labs
              </span>
            </div>
            <div className="grid gap-2">
              {labFeatures.map(([featureId, title, description]) => (
                <article key={featureId} className="rounded-xl border border-white/10 bg-white/[0.035] p-2.5">
                  <div className="flex items-start justify-between gap-2">
                    <div className="min-w-0">
                      <p className="text-sm font-semibold text-white">{title}</p>
                      <p className="mt-1 text-xs leading-5 text-slate-500">{description}</p>
                    </div>
                    <button
                      type="button"
                      onClick={() => voteForLab(featureId)}
                      className="shrink-0 rounded-lg border border-violet-300/20 bg-violet-300/10 px-2 py-1 text-xs font-semibold text-violet-100 hover:bg-violet-300/15"
                    >
                      Vote {labVotes[featureId] ?? 0}
                    </button>
                  </div>
                </article>
              ))}
            </div>
          </section>

          <section className="rounded-2xl border border-cyan-300/15 bg-[#091221]/92 p-3">
            <div className="mb-3 flex items-center justify-between gap-3">
              <h2 className="font-semibold text-white">AI Task Generator</h2>
              <span className="rounded-lg border border-white/10 bg-white/5 px-2 py-1 text-xs text-slate-400">
                {completedTaskCount}/{taskGenerator.tasks.length || 0}
              </span>
            </div>
            <div className="rounded-xl border border-white/10 bg-black/20 p-2">
              <textarea
                value={taskGenerator.goal}
                onChange={(event) => updateTaskGenerator({ goal: event.target.value })}
                placeholder="I want to build an app"
                rows={2}
                className="min-h-16 w-full resize-none bg-transparent text-sm leading-5 text-white outline-none placeholder:text-slate-600"
              />
              <div className="mt-2 flex items-center justify-between gap-2 border-t border-white/10 pt-2">
                <span className="text-xs text-slate-500">{taskGenerator.savedProjectTasks.length} saved</span>
                <div className="flex gap-2">
                  {taskGenerator.tasks.length ? (
                    <button
                      type="button"
                      onClick={clearGeneratedTasks}
                      className="inline-flex h-8 items-center justify-center rounded-lg border border-white/10 px-2 text-xs font-semibold text-slate-300 hover:bg-white/8 hover:text-white"
                    >
                      Clear
                    </button>
                  ) : null}
                  <button
                    type="button"
                    onClick={generateTasksFromGoal}
                    className="inline-flex h-8 items-center gap-1.5 rounded-lg bg-cyan-300 px-2.5 text-xs font-semibold text-slate-950 hover:brightness-110"
                  >
                    <ClipboardList size={13} />
                    Generate
                  </button>
                </div>
              </div>
            </div>

            <div className="mt-3 space-y-2">
              {taskGenerator.tasks.map((task, index) => (
                <div key={task.id} className="rounded-xl border border-white/10 bg-white/[0.035] p-2.5">
                  <div className="flex items-start gap-2">
                    <button
                      type="button"
                      onClick={() => toggleTaskDone(task.id)}
                      className={`mt-0.5 grid size-6 shrink-0 place-items-center rounded-lg border ${
                        task.done
                          ? "border-emerald-300/35 bg-emerald-300/15 text-emerald-100"
                          : "border-white/10 bg-black/20 text-slate-500 hover:text-white"
                      }`}
                      aria-label={task.done ? "Mark task not done" : "Mark task done"}
                    >
                      {task.done ? <CheckCircle2 size={14} /> : <Square size={12} />}
                    </button>
                    <p className={`min-w-0 flex-1 text-sm leading-5 ${task.done ? "text-slate-500 line-through" : "text-slate-100"}`}>
                      <span className="mr-1 text-xs text-slate-500">{index + 1}.</span>
                      {task.title}
                    </p>
                  </div>
                  <div className="mt-2 grid grid-cols-3 gap-1.5">
                    <button
                      type="button"
                      onClick={() => toggleTaskDone(task.id)}
                      className="inline-flex min-h-8 items-center justify-center gap-1 rounded-lg border border-white/10 px-2 text-[11px] font-semibold text-slate-300 hover:bg-white/8 hover:text-white"
                    >
                      <CheckCircle2 size={12} />
                      Done
                    </button>
                    <button
                      type="button"
                      onClick={() => askAiAboutTask(task)}
                      className="inline-flex min-h-8 items-center justify-center gap-1 rounded-lg border border-white/10 px-2 text-[11px] font-semibold text-slate-300 hover:bg-white/8 hover:text-white"
                    >
                      <Sparkles size={12} />
                      Ask AI
                    </button>
                    <button
                      type="button"
                      onClick={() => saveTaskToProject(task)}
                      className={`inline-flex min-h-8 items-center justify-center gap-1 rounded-lg border px-2 text-[11px] font-semibold ${
                        task.saved
                          ? "border-cyan-300/30 bg-cyan-300/10 text-cyan-100"
                          : "border-white/10 text-slate-300 hover:bg-white/8 hover:text-white"
                      }`}
                    >
                      <Save size={12} />
                      Save
                    </button>
                  </div>
                </div>
              ))}
              {!taskGenerator.tasks.length ? (
                <div className="rounded-xl border border-white/10 bg-white/[0.035] p-3 text-sm text-slate-500">
                  No tasks yet.
                </div>
              ) : null}
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
        ) : null}
      </div>
    </div>
  );
}
