"use client";

import Link from "next/link";
import { FormEvent, useEffect, useMemo, useState } from "react";
import { onAuthStateChanged, type User } from "firebase/auth";
import {
  AlertTriangle,
  BarChart3,
  Bot,
  Check,
  ChevronRight,
  Crown,
  CreditCard,
  FileText,
  LifeBuoy,
  Loader2,
  Lock,
  LogOut,
  Menu,
  Megaphone,
  MessageSquare,
  MoreHorizontal,
  RefreshCw,
  Search,
  Settings,
  ShieldCheck,
  Sparkles,
  Star,
  Users,
  Wrench,
  X,
} from "lucide-react";
import { AppLogo } from "@/components/AppLogo";
import { CREATOR_EMAIL } from "@/lib/constants";
import { auth } from "@/lib/firebase";

type CreatorStats = {
  creatorEmail: string;
  generatedAt: string;
  summary: Record<string, number | string>;
  charts: {
    planCounts: Record<string, number>;
    revenueByPlan: Record<string, number>;
    paymentStatus: Record<string, number>;
    messageReactions: Record<string, number>;
    labVotes: Record<string, number>;
  };
  collections: {
    users: CreatorRecord[];
    chats: CreatorRecord[];
    messages: CreatorRecord[];
    payments: CreatorRecord[];
    reports: CreatorRecord[];
    reactions: CreatorRecord[];
    labVotes: CreatorRecord[];
    models: CreatorRecord[];
    logs: CreatorRecord[];
  };
};

type CreatorRecord = Record<string, unknown> & {
  id: string;
};

type LockState = {
  locked: boolean;
  lockedUntil: number | null;
  attemptsRemaining: number;
  failedAttempts: number;
};

type CreatorActionButtonProps = {
  children: React.ReactNode;
  className?: string;
  disabled?: boolean;
  tone?: "neutral" | "primary" | "success" | "danger";
  onClick: () => void;
};

const navItems = [
  ["overview", "Overview", BarChart3],
  ["users", "Users", Users],
  ["payments", "Payments", CreditCard],
  ["revenue", "Revenue", Crown],
  ["plans", "Plans", Star],
  ["limits", "Limits", Wrench],
  ["models", "Models", Bot],
  ["tools", "AI Tools", Sparkles],
  ["chats", "Chats", MessageSquare],
  ["reports", "Reports", AlertTriangle],
  ["feedback", "Feedback", Star],
  ["support", "Support", LifeBuoy],
  ["security", "Security", ShieldCheck],
  ["announcements", "Announcements", Megaphone],
  ["app-settings", "App Settings", Settings],
  ["logs", "Audit Logs", FileText],
] as const;

const paidPlans = ["lite", "go", "pro", "premium", "ultimate"] as const;
const maxCreatorFailedAttempts = 5;

const primaryMobileSections = ["overview", "users", "payments", "reports", "revenue", "logs"] as const;

const creatorPlanActions = [
  { label: "Free", plan: "free", tone: "neutral" },
  { label: "Lite", plan: "lite", tone: "primary" },
  { label: "Plus", plan: "go", tone: "primary" },
  { label: "Pro", plan: "pro", tone: "primary" },
  { label: "Premium", plan: "premium", tone: "success" },
  { label: "Ultimate", plan: "ultimate", tone: "success" },
] as const satisfies ReadonlyArray<{
  label: string;
  plan: string;
  tone: "neutral" | "primary" | "success";
}>;

function asString(value: unknown, fallback = "No data yet") {
  return typeof value === "string" && value.trim() ? value : fallback;
}

function stringValue(value: unknown, fallback = "") {
  return typeof value === "string" && value.trim() ? value : fallback;
}

function asNumber(value: unknown) {
  return typeof value === "number" && Number.isFinite(value) ? value : 0;
}

function toIsoDate(value: unknown) {
  if (!value) return "";
  if (value instanceof Date) return Number.isNaN(value.getTime()) ? "" : value.toISOString();
  if (typeof value === "string") {
    const parsed = new Date(value);
    return Number.isNaN(parsed.getTime()) ? "" : parsed.toISOString();
  }
  if (typeof value === "object" && "toDate" in value && typeof value.toDate === "function") {
    const date = value.toDate();
    return date instanceof Date && !Number.isNaN(date.getTime()) ? date.toISOString() : "";
  }
  return "";
}

function formatRupees(value: unknown) {
  return new Intl.NumberFormat("en-IN", {
    currency: "INR",
    maximumFractionDigits: 0,
    style: "currency",
  }).format(asNumber(value));
}

function formatNumber(value: unknown) {
  return new Intl.NumberFormat("en-IN").format(asNumber(value));
}

function formatDate(value: unknown) {
  const iso = toIsoDate(value);
  if (!iso) return "Not set";
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return "Not set";
  return new Intl.DateTimeFormat("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  }).format(date);
}

function reportTypeLabel(value: unknown) {
  const type = stringValue(value, "bug");
  if (type === "feature") return "Feature Suggestion";
  if (type === "payment") return "Payment Issue";
  return "Bug Report";
}

function lockLabel(lock?: LockState | null) {
  if (!lock?.locked || !lock.lockedUntil) return null;
  return `Locked until ${new Date(lock.lockedUntil).toLocaleString("en-IN")}`;
}

function attemptStatusLabel(lock?: LockState | null) {
  if (lock?.locked) return "No attempts remaining. Creator panel is locked for 5 hours.";
  return `Attempts remaining: ${lock?.attemptsRemaining ?? maxCreatorFailedAttempts}`;
}

function gateErrorLabel(error: string, lock?: LockState | null) {
  if (!lock) return error;
  if (lock.locked) return `${error} No attempts remaining. Locked for 5 hours.`;

  const attempts = lock.attemptsRemaining;
  return `${error} ${attempts} ${attempts === 1 ? "attempt" : "attempts"} remaining.`;
}

function EmptyState({ label = "No data yet. Your Detox AI platform is ready to grow." }: { label?: string }) {
  return (
    <div className="rounded-2xl border border-white/10 bg-white/[0.035] p-6 text-sm text-slate-400">
      {label}
    </div>
  );
}

function StatCard({ label, value, accent = "text-cyan-100" }: { label: string; value: string | number; accent?: string }) {
  return (
    <article className="relative overflow-hidden rounded-2xl border border-white/10 bg-[#091221]/88 p-5 shadow-[0_22px_80px_rgba(0,0,0,0.24)]">
      <div className="absolute inset-x-8 top-0 h-px bg-gradient-to-r from-transparent via-cyan-300/70 to-transparent" />
      <p className="text-xs uppercase tracking-[0.18em] text-slate-500">{label}</p>
      <p className={`mt-3 text-2xl font-semibold ${accent}`}>{value}</p>
    </article>
  );
}

function MiniBarChart({ title, values }: { title: string; values: Record<string, number> }) {
  const entries = Object.entries(values);
  const max = Math.max(1, ...entries.map(([, value]) => value));

  return (
    <section className="rounded-2xl border border-white/10 bg-[#091221]/88 p-5">
      <h3 className="font-semibold text-white">{title}</h3>
      <div className="mt-5 grid gap-3">
        {entries.length ? (
          entries.map(([label, value]) => (
            <div key={label}>
              <div className="mb-1 flex justify-between text-xs text-slate-400">
                <span className="capitalize">{label}</span>
                <span>{formatNumber(value)}</span>
              </div>
              <div className="h-2 overflow-hidden rounded-full bg-slate-800">
                <div className="h-full rounded-full bg-gradient-to-r from-cyan-300 via-blue-500 to-violet-400" style={{ width: `${Math.max(3, (value / max) * 100)}%` }} />
              </div>
            </div>
          ))
        ) : (
          <EmptyState />
        )}
      </div>
    </section>
  );
}

function Field({ label, value }: { label: string; value: unknown }) {
  return (
    <div className="rounded-xl border border-white/10 bg-white/[0.035] p-3">
      <p className="text-[11px] uppercase tracking-[0.16em] text-slate-500">{label}</p>
      <p className="mt-2 break-words text-sm font-semibold text-white">{String(value ?? "Not set")}</p>
    </div>
  );
}

function ProfileValue({ label, value }: { label: string; value: unknown }) {
  return (
    <div className="rounded-xl border border-white/10 bg-white/[0.035] p-3">
      <p className="text-[11px] uppercase tracking-[0.14em] text-slate-500">{label}</p>
      <p className="mt-1 break-words text-sm font-semibold text-slate-100">{String(value ?? "Not set") || "Not set"}</p>
    </div>
  );
}

function UserProfileDrawer({ user, onClose }: { user: CreatorRecord | null; onClose: () => void }) {
  if (!user) return null;

  const socials = typeof user.socialLinks === "object" && user.socialLinks !== null
    ? user.socialLinks as Record<string, unknown>
    : {};
  const avatarUrl = stringValue(user.photoURL);

  return (
    <div className="fixed inset-0 z-50">
      <button
        type="button"
        aria-label="Close user profile"
        className="absolute inset-0 bg-black/65 backdrop-blur-sm"
        onClick={onClose}
      />
      <aside className="detox-scrollbar absolute right-0 top-0 h-full w-[min(34rem,92vw)] overflow-y-auto border-l border-white/10 bg-[#050b18] p-5 text-white shadow-[-24px_0_90px_rgba(0,0,0,0.46)]">
        <div className="flex items-start justify-between gap-3">
          <div className="flex min-w-0 items-center gap-3">
            <div className="grid size-14 shrink-0 place-items-center overflow-hidden rounded-2xl border border-cyan-300/20 bg-cyan-300/10 text-lg font-semibold text-cyan-100">
              {avatarUrl ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={avatarUrl} alt="" className="h-full w-full object-cover" />
              ) : (
                asString(user.name, asString(user.email, "DU")).slice(0, 2).toUpperCase()
              )}
            </div>
            <div className="min-w-0">
              <p className="truncate text-xl font-semibold">{asString(user.name, "Detox User")}</p>
              <p className="truncate text-sm text-slate-400">{asString(user.email)}</p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="grid size-10 shrink-0 place-items-center rounded-xl border border-white/10 text-slate-300 hover:bg-white/8 hover:text-white"
            aria-label="Close user profile"
          >
            <X size={18} />
          </button>
        </div>

        <div className="mt-5 grid grid-cols-2 gap-3">
          <ProfileValue label="Plan" value={asString(user.plan, "free")} />
          <ProfileValue label="Status" value={user.isBanned ? "Banned" : asString(user.planStatus, "active")} />
          <ProfileValue label="Username" value={asString(user.username)} />
          <ProfileValue label="Role" value={asString(user.role)} />
          <ProfileValue label="Occupation" value={asString(user.occupation)} />
          <ProfileValue label="Language" value={asString(user.language)} />
        </div>

        <div className="mt-3 grid gap-3">
          <ProfileValue label="Bio" value={asString(user.bio)} />
          <ProfileValue label="Response Style" value={asString(user.responseStyle ?? user.tone)} />
          <ProfileValue label="Default Theme" value={asString(user.defaultTheme)} />
          <ProfileValue label="Default Model" value={asString(user.defaultModel)} />
        </div>

        <div className="mt-5">
          <p className="text-sm font-semibold text-white">Social links</p>
          <div className="mt-3 grid grid-cols-2 gap-3">
            <ProfileValue label="Instagram" value={asString(socials.instagram)} />
            <ProfileValue label="YouTube" value={asString(socials.youtube)} />
            <ProfileValue label="GitHub" value={asString(socials.github)} />
            <ProfileValue label="Website" value={asString(socials.website)} />
          </div>
        </div>

        <div className="mt-5">
          <p className="text-sm font-semibold text-white">Usage and dates</p>
          <div className="mt-3 grid grid-cols-2 gap-3">
            <ProfileValue label="Daily Messages" value={formatNumber(user.dailyMessages)} />
            <ProfileValue label="Monthly Messages" value={formatNumber(user.monthlyMessages)} />
            <ProfileValue label="Total Messages" value={formatNumber(user.totalMessages)} />
            <ProfileValue label="Tokens Used" value={formatNumber(user.tokensUsed)} />
            <ProfileValue label="Created" value={formatDate(user.createdAt)} />
            <ProfileValue label="Updated" value={formatDate(user.updatedAt)} />
            <ProfileValue label="Last Login" value={formatDate(user.lastLogin)} />
            <ProfileValue label="Plan Expires" value={formatDate(user.planExpiresAt)} />
          </div>
        </div>

        <div className="mt-5 rounded-2xl border border-white/10 bg-black/20 p-3">
          <p className="text-xs font-semibold uppercase tracking-[0.16em] text-slate-500">Account IDs</p>
          <div className="mt-3 grid gap-2 text-xs text-slate-400">
            <p className="break-all">UID: {user.id}</p>
            <p className="break-all">Photo URL: {avatarUrl || "Not set"}</p>
          </div>
        </div>
      </aside>
    </div>
  );
}

function CreatorActionButton({ children, className = "", disabled = false, tone = "neutral", onClick }: CreatorActionButtonProps) {
  const tones = {
    danger: "border-red-300/20 bg-red-400/10 text-red-100 hover:bg-red-400/15",
    neutral: "border-white/10 bg-white/[0.035] text-slate-200 hover:bg-white/8",
    primary: "border-cyan-300/20 bg-cyan-300/10 text-cyan-100 hover:bg-cyan-300/15",
    success: "border-emerald-300/20 bg-emerald-300/12 text-emerald-100 hover:bg-emerald-300/18",
  };

  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      className={`inline-flex min-h-9 items-center justify-center rounded-lg border px-3 py-1.5 text-xs font-semibold transition disabled:cursor-not-allowed disabled:opacity-50 ${tones[tone]} ${className}`}
    >
      {children}
    </button>
  );
}

function DataTable({
  title,
  rows,
  columns,
  empty,
}: {
  title: string;
  rows: CreatorRecord[];
  columns: Array<[string, (row: CreatorRecord) => React.ReactNode]>;
  empty?: string;
}) {
  return (
    <section className="rounded-2xl border border-white/10 bg-[#091221]/88 p-4 shadow-[0_22px_80px_rgba(0,0,0,0.22)] sm:p-5">
      <div className="flex items-center justify-between gap-3">
        <h3 className="font-semibold text-white">{title}</h3>
        <span className="rounded-full border border-white/10 bg-white/[0.035] px-2.5 py-1 text-xs font-semibold text-slate-400">
          {formatNumber(rows.length)}
        </span>
      </div>
      <div className="mt-4">
        {rows.length ? (
          <>
            <div className="grid gap-3 md:hidden">
              {rows.map((row) => (
                <article key={row.id} className="rounded-xl border border-white/10 bg-black/20 p-3">
                  <div className="grid gap-3">
                    {columns.map(([label, render]) => (
                      <div key={label} className={label === "Actions" ? "border-t border-white/10 pt-3" : ""}>
                        <p className="text-[11px] uppercase tracking-[0.14em] text-slate-500">{label}</p>
                        <div className="mt-1 break-words text-sm text-slate-200">{render(row)}</div>
                      </div>
                    ))}
                  </div>
                </article>
              ))}
            </div>
            <div className="hidden overflow-x-auto md:block">
              <table className="w-full min-w-[760px] text-left text-sm">
                <thead className="text-xs uppercase tracking-[0.14em] text-slate-500">
                  <tr className="border-b border-white/10">
                    {columns.map(([label]) => (
                      <th key={label} className="px-3 py-3 font-semibold">{label}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {rows.map((row) => (
                    <tr key={row.id} className="border-b border-white/8 text-slate-300">
                      {columns.map(([label, render]) => (
                        <td key={label} className="px-3 py-3 align-top">{render(row)}</td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </>
        ) : (
          <EmptyState label={empty} />
        )}
      </div>
    </section>
  );
}

function ChatTranscriptPanel({
  chats,
  messages,
  selectedChatId,
  onSelectChat,
}: {
  chats: CreatorRecord[];
  messages: CreatorRecord[];
  selectedChatId: string;
  onSelectChat: (chatId: string) => void;
}) {
  const selectedChat = chats.find((chat) => stringValue(chat.chatId, chat.id) === selectedChatId) ?? chats[0];
  const selectedId = selectedChat ? stringValue(selectedChat.chatId, selectedChat.id) : "";
  const selectedMessages = useMemo(
    () =>
      messages
        .filter((message) => stringValue(message.chatId) === selectedId)
        .sort((left, right) => new Date(toIsoDate(left.createdAt)).getTime() - new Date(toIsoDate(right.createdAt)).getTime()),
    [messages, selectedId],
  );

  return (
    <section className="rounded-2xl border border-white/10 bg-[#091221]/88 p-4 shadow-[0_22px_80px_rgba(0,0,0,0.22)] sm:p-5">
      <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h3 className="font-semibold text-white">Chat moderation</h3>
          <p className="mt-1 text-sm text-slate-400">Open a user chat to review the full user and AI conversation.</p>
        </div>
        <span className="w-fit rounded-full border border-white/10 bg-white/[0.035] px-2.5 py-1 text-xs font-semibold text-slate-400">
          {formatNumber(chats.length)} chats
        </span>
      </div>

      {chats.length ? (
        <div className="mt-5 grid min-h-[560px] gap-4 xl:grid-cols-[360px_1fr]">
          <div className="detox-scrollbar max-h-[620px] overflow-y-auto rounded-2xl border border-white/10 bg-black/20 p-2">
            {chats.map((chat) => {
              const chatId = stringValue(chat.chatId, chat.id);
              const isActive = chatId === selectedId;
              return (
                <button
                  key={chat.id}
                  type="button"
                  onClick={() => onSelectChat(chatId)}
                  className={`mb-2 w-full rounded-xl border p-3 text-left transition ${
                    isActive ? "border-cyan-300/30 bg-cyan-300/12" : "border-white/8 bg-white/[0.025] hover:bg-white/[0.05]"
                  }`}
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0">
                      <p className="truncate text-sm font-semibold text-white">{asString(chat.title, "New Chat")}</p>
                      <p className="mt-1 truncate text-xs text-slate-400">{asString(chat.userEmail, "Unknown user")}</p>
                    </div>
                    <span className="shrink-0 rounded-lg border border-white/10 px-2 py-1 text-[11px] text-slate-400">
                      {formatNumber(chat.messageCount)}
                    </span>
                  </div>
                  <div className="mt-3 flex flex-wrap gap-2 text-[11px] text-slate-500">
                    <span>{asString(chat.modelId, "model")}</span>
                    <span>{formatDate(chat.updatedAt)}</span>
                  </div>
                </button>
              );
            })}
          </div>

          <div className="flex min-h-0 flex-col rounded-2xl border border-white/10 bg-[#020713]/70">
            {selectedChat ? (
              <>
                <div className="border-b border-white/10 p-4">
                  <p className="text-xs uppercase tracking-[0.18em] text-cyan-200">Selected chat</p>
                  <h4 className="mt-2 text-xl font-semibold text-white">{asString(selectedChat.title, "New Chat")}</h4>
                  <div className="mt-3 grid gap-2 text-sm text-slate-400 md:grid-cols-3">
                    <span className="truncate">User: {asString(selectedChat.userEmail, "Unknown")}</span>
                    <span>Model: {asString(selectedChat.modelId, "Unknown")}</span>
                    <span>Updated: {formatDate(selectedChat.updatedAt)}</span>
                  </div>
                </div>

                <div className="detox-scrollbar min-h-0 flex-1 space-y-3 overflow-y-auto p-4">
                  {selectedMessages.length ? (
                    selectedMessages.map((message) => {
                      const isUser = stringValue(message.role) === "user";
                      const content = asString(message.content, "Empty message");
                      return (
                        <article key={message.id} className={`flex ${isUser ? "justify-end" : "justify-start"}`}>
                          <div className={`max-w-[92%] rounded-2xl border p-3 text-sm leading-6 ${
                            isUser
                              ? "border-blue-300/20 bg-blue-500/15 text-blue-50"
                              : "border-white/10 bg-white/[0.045] text-slate-100"
                          }`}
                          >
                            <div className="mb-2 flex flex-wrap items-center justify-between gap-3 text-xs text-slate-500">
                              <span className="font-semibold text-slate-300">{isUser ? "User" : "Detox AI"}</span>
                              <span>{formatDate(message.createdAt)}</span>
                            </div>
                            <p className="whitespace-pre-wrap break-words">{content}</p>
                          </div>
                        </article>
                      );
                    })
                  ) : (
                    <EmptyState label="No messages saved for this chat yet." />
                  )}
                </div>
              </>
            ) : (
              <EmptyState label="Select a chat to review messages." />
            )}
          </div>
        </div>
      ) : (
        <EmptyState label="No chats yet." />
      )}
    </section>
  );
}

function CreatorNav({ activeSection, onNavigate }: { activeSection: string; onNavigate?: () => void }) {
  return (
    <nav className="grid gap-1">
      {navItems.map(([id, label, Icon]) => (
        <Link
          key={id}
          href={id === "overview" ? "/creator" : `/creator/${id}`}
          onClick={onNavigate}
          className={`flex min-h-11 items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-semibold transition ${
            activeSection === id ? "bg-cyan-300 text-slate-950" : "text-slate-300 hover:bg-white/8 hover:text-white"
          }`}
        >
          <Icon size={16} />
          {label}
        </Link>
      ))}
    </nav>
  );
}

export function CreatorDashboard({ section }: { section: string }) {
  const activeSection = navItems.some(([id]) => id === section) ? section : "overview";
  const [firebaseUser, setFirebaseUser] = useState<User | null>(null);
  const [isAuthReady, setIsAuthReady] = useState(false);
  const [isCreatorSessionReady, setIsCreatorSessionReady] = useState(false);
  const [creatorSession, setCreatorSession] = useState(false);
  const [lock, setLock] = useState<LockState | null>(null);
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [pin, setPin] = useState("");
  const [pendingToken, setPendingToken] = useState("");
  const [gateError, setGateError] = useState("");
  const [stats, setStats] = useState<CreatorStats | null>(null);
  const [isLoadingStats, setIsLoadingStats] = useState(false);
  const [actionStatus, setActionStatus] = useState("");
  const [busyAction, setBusyAction] = useState("");
  const [isMobileNavOpen, setIsMobileNavOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [selectedCreatorChatId, setSelectedCreatorChatId] = useState("");
  const [selectedUserProfile, setSelectedUserProfile] = useState<CreatorRecord | null>(null);

  useEffect(() => {
    fetch("/api/creator/session")
      .then((response) => response.json())
      .then((data) => {
        setCreatorSession(Boolean(data.authenticated));
        setLock(data.lock ?? null);
      })
      .catch(() => setCreatorSession(false))
      .finally(() => setIsCreatorSessionReady(true));

    return onAuthStateChanged(auth, (user) => {
      setFirebaseUser(user);
      setIsAuthReady(true);
    });
  }, []);

  const isFirebaseCreator = firebaseUser?.email === CREATOR_EMAIL;
  const activeNavItem = navItems.find(([id]) => id === activeSection) ?? navItems[0];
  const ActiveSectionIcon = activeNavItem[2];

  async function creatorFetch<T>(endpoint: string, init?: RequestInit) {
    if (!firebaseUser || !creatorSession || !isFirebaseCreator) return;
    const idToken = await firebaseUser.getIdToken();
    const response = await fetch(endpoint, {
      ...init,
      headers: {
        Authorization: `Bearer ${idToken}`,
        ...(init?.body ? { "Content-Type": "application/json" } : {}),
        ...(init?.headers ?? {}),
      },
    });
    const data = await response.json().catch(() => ({}));

    if (!response.ok) {
      throw new Error(typeof data.error === "string" ? data.error : "Creator request failed.");
    }

    return data as T;
  }

  async function loadStats(options: { preserveStatus?: boolean } = {}) {
    if (!firebaseUser || !creatorSession || !isFirebaseCreator) return;
    setIsLoadingStats(true);
    if (!options.preserveStatus) setActionStatus("");
    try {
      const data = await creatorFetch<CreatorStats>("/api/creator/stats");
      if (data) setStats(data);
    } catch (error) {
      setActionStatus(
        error instanceof Error
          ? error.message
          : "Could not load creator dashboard.",
      );
    } finally {
      setIsLoadingStats(false);
    }
  }

  useEffect(() => {
    const timer = window.setTimeout(() => {
      void loadStats();
    }, 0);
    return () => window.clearTimeout(timer);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [creatorSession, isFirebaseCreator, firebaseUser?.uid]);

  async function submitCredentials(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setGateError("");
    const response = await fetch("/api/creator/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ username, password }),
    });
    const data = await response.json();
    setLock(data.lock ?? null);
    if (!response.ok) {
      setGateError(gateErrorLabel(data.error ?? "Creator login failed.", data.lock));
      return;
    }
    setPendingToken(data.pendingToken);
  }

  async function submitPin(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setGateError("");
    const response = await fetch("/api/creator/verify-pin", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ pendingToken, pin }),
    });
    const data = await response.json();
    setLock(data.lock ?? null);
    if (!response.ok) {
      setGateError(gateErrorLabel(data.error ?? "PIN verification failed.", data.lock));
      return;
    }
    setCreatorSession(true);
    setPassword("");
    setPin("");
  }

  async function logoutCreator() {
    await fetch("/api/creator/logout", { method: "POST" });
    setCreatorSession(false);
    setStats(null);
    setPendingToken("");
  }

  async function creatorAction(endpoint: string, body: Record<string, unknown>, success: string) {
    if (!firebaseUser) return;
    const actionKey = `${endpoint}:${JSON.stringify(body)}`;
    setActionStatus("");
    setBusyAction(actionKey);
    try {
      await creatorFetch(endpoint, {
        method: "POST",
        body: JSON.stringify(body),
      });
      await loadStats({ preserveStatus: true });
      setActionStatus(success);
    } catch (error) {
      setActionStatus(
        error instanceof Error
          ? error.message
        : "Creator action failed.",
      );
    } finally {
      setBusyAction("");
    }
  }

  const filteredUsers = useMemo(() => {
    const users = stats?.collections.users ?? [];
    const search = query.trim().toLowerCase();
    if (!search) return users;
    return users.filter((user) =>
      [user.email, user.name, user.username, user.plan, user.role].some((value) =>
        String(value ?? "").toLowerCase().includes(search),
      ),
    );
  }, [query, stats?.collections.users]);

  const filteredChats = useMemo(() => {
    const chats = stats?.collections.chats ?? [];
    const search = query.trim().toLowerCase();
    if (!search) return chats;
    return chats.filter((chat) =>
      [chat.title, chat.userEmail, chat.modelId, chat.chatId, chat.id].some((value) =>
        String(value ?? "").toLowerCase().includes(search),
      ),
    );
  }, [query, stats?.collections.chats]);

  const filteredReports = useMemo(() => {
    const reports = stats?.collections.reports ?? [];
    const search = query.trim().toLowerCase();
    if (!search) return reports;
    return reports.filter((report) =>
      [report.type, report.reason, report.title, report.details, report.userEmail, report.page, report.status, report.priority].some((value) =>
        String(value ?? "").toLowerCase().includes(search),
      ),
    );
  }, [query, stats?.collections.reports]);

  function isActionRunning(endpoint: string, body: Record<string, unknown>) {
    return busyAction === `${endpoint}:${JSON.stringify(body)}`;
  }

  if (!isCreatorSessionReady || !isAuthReady) {
    return (
      <div className="grid min-h-screen place-items-center bg-[#020713] text-slate-200">
        <Loader2 className="animate-spin text-cyan-100" size={28} />
      </div>
    );
  }

  if (!creatorSession) {
    const lockedText = lockLabel(lock);

    return (
      <main className="min-h-screen bg-[#020713] px-4 py-10 text-white">
        <div className="mx-auto grid max-w-5xl gap-6 lg:grid-cols-[0.95fr_1.05fr] lg:items-center">
          <section>
            <AppLogo size={82} className="rounded-2xl" />
            <p className="mt-8 text-sm uppercase tracking-[0.26em] text-cyan-200">Detox AI Creator Gate</p>
            <h1 className="mt-4 text-4xl font-semibold tracking-tight sm:text-6xl">Founder control stays locked.</h1>
            <p className="mt-5 max-w-xl leading-7 text-slate-400">
              Enter the creator username and password first. After that, the PIN check unlocks a signed server session.
              Five wrong attempts lock this panel for 5 hours.
            </p>
            <div className="mt-6 grid gap-3 text-sm text-slate-300 sm:grid-cols-2">
              {["Server-side credential checks", "HttpOnly signed session", "PIN second step", "5-hour lockout"].map((item) => (
                <div key={item} className="flex items-center gap-2 rounded-2xl border border-white/10 bg-white/5 p-3">
                  <ShieldCheck size={16} className="text-cyan-100" />
                  {item}
                </div>
              ))}
            </div>
          </section>

          <section className="rounded-3xl border border-white/10 bg-[#091221]/90 p-6 shadow-[0_35px_120px_rgba(0,0,0,0.42)]">
            <div className="flex items-center gap-3">
              <span className="grid size-11 place-items-center rounded-2xl bg-amber-300/10 text-amber-100">
                <Lock size={20} />
              </span>
              <div>
                <h2 className="text-xl font-semibold">Creator authentication</h2>
                <p className="text-sm text-slate-400">{pendingToken ? "Enter creator PIN" : "Enter creator credentials"}</p>
              </div>
            </div>

            {lockedText ? (
              <p className="mt-5 rounded-2xl border border-red-300/25 bg-red-400/10 p-4 text-sm text-red-100">{lockedText}</p>
            ) : null}

            {gateError ? (
              <p className="mt-5 rounded-2xl border border-red-300/25 bg-red-400/10 p-4 text-sm text-red-100">{gateError}</p>
            ) : null}

            {!pendingToken ? (
              <form onSubmit={submitCredentials} className="mt-6 grid gap-4">
                <label className="text-sm text-slate-300" htmlFor="creator-username">Username</label>
                <input
                  id="creator-username"
                  value={username}
                  onChange={(event) => setUsername(event.target.value)}
                  className="h-11 rounded-xl border border-white/10 bg-black/25 px-3 outline-none focus:border-cyan-300/60"
                  autoComplete="off"
                  disabled={Boolean(lock?.locked)}
                  required
                />
                <label className="text-sm text-slate-300" htmlFor="creator-password">Password</label>
                <input
                  id="creator-password"
                  value={password}
                  onChange={(event) => setPassword(event.target.value)}
                  className="h-11 rounded-xl border border-white/10 bg-black/25 px-3 outline-none focus:border-cyan-300/60"
                  type="password"
                  autoComplete="off"
                  disabled={Boolean(lock?.locked)}
                  required
                />
                <button type="submit" disabled={Boolean(lock?.locked)} className="mt-2 h-11 rounded-xl bg-white font-semibold text-slate-950 disabled:cursor-not-allowed disabled:opacity-50">
                  Continue to PIN
                </button>
              </form>
            ) : (
              <form onSubmit={submitPin} className="mt-6 grid gap-4">
                <label className="text-sm text-slate-300" htmlFor="creator-pin">PIN</label>
                <input
                  id="creator-pin"
                  value={pin}
                  onChange={(event) => setPin(event.target.value.replace(/\D/g, "").slice(0, 6))}
                  className="h-12 rounded-xl border border-white/10 bg-black/25 px-3 text-center text-xl tracking-[0.45em] outline-none focus:border-cyan-300/60"
                  type="password"
                  inputMode="numeric"
                  autoComplete="off"
                  disabled={Boolean(lock?.locked)}
                  required
                />
                <button type="submit" disabled={Boolean(lock?.locked)} className="mt-2 h-11 rounded-xl bg-cyan-300 font-semibold text-slate-950 disabled:cursor-not-allowed disabled:opacity-50">
                  Unlock Creator Dashboard
                </button>
                <button type="button" onClick={() => setPendingToken("")} className="text-sm font-semibold text-slate-400 hover:text-white">
                  Back to username and password
                </button>
              </form>
            )}

            <p className="mt-5 text-xs leading-5 text-slate-500">
              {attemptStatusLabel(lock)}. Credentials are checked on the server, then the browser receives only a signed creator session cookie.
            </p>
          </section>
        </div>
      </main>
    );
  }

  if (!isFirebaseCreator) {
    return (
      <main className="grid min-h-screen place-items-center bg-[#020713] px-4 text-white">
        <section className="max-w-lg rounded-3xl border border-white/10 bg-[#091221]/92 p-6 text-center">
          <ShieldCheck className="mx-auto text-cyan-100" size={36} />
          <h1 className="mt-4 text-2xl font-semibold">Creator Firebase account required</h1>
          <p className="mt-3 text-sm leading-6 text-slate-400">
            The creator gate is unlocked, but dashboard data only loads when Firebase is signed in as {CREATOR_EMAIL}.
          </p>
          <div className="mt-5 flex justify-center gap-3">
            <Link href="/login" className="inline-flex h-10 items-center rounded-xl bg-white px-4 text-sm font-semibold text-slate-950">Login</Link>
            <button type="button" onClick={logoutCreator} className="inline-flex h-10 items-center rounded-xl border border-white/10 px-4 text-sm font-semibold text-slate-200">Lock Creator Gate</button>
          </div>
        </section>
      </main>
    );
  }

  const summary = stats?.summary ?? {};
  const pendingPayments = (stats?.collections.payments ?? []).filter((payment) => payment.status === "pending");
  const approvedPayments = (stats?.collections.payments ?? []).filter((payment) => payment.status === "approved");
  const rejectedPayments = (stats?.collections.payments ?? []).filter((payment) => payment.status === "rejected");

  return (
    <div className="min-h-screen bg-[#020713] text-white">
      <UserProfileDrawer user={selectedUserProfile} onClose={() => setSelectedUserProfile(null)} />
      <div className="fixed inset-0 bg-[radial-gradient(circle_at_20%_20%,rgba(6,182,212,0.12),transparent_28%),radial-gradient(circle_at_80%_0%,rgba(139,92,246,0.13),transparent_24%)]" />
      {isMobileNavOpen ? (
        <div className="fixed inset-0 z-50 lg:hidden">
          <button
            type="button"
            aria-label="Close navigation overlay"
            className="absolute inset-0 bg-black/65 backdrop-blur-sm"
            onClick={() => setIsMobileNavOpen(false)}
          />
          <aside className="relative flex h-full w-[min(22rem,88vw)] flex-col border-r border-white/10 bg-[#050b18] p-4 shadow-[24px_0_90px_rgba(0,0,0,0.45)]">
            <div className="flex items-center justify-between gap-3">
              <Link href="/creator" onClick={() => setIsMobileNavOpen(false)} className="flex min-w-0 items-center gap-3">
                <AppLogo size={42} className="rounded-xl" />
                <span className="min-w-0">
                  <span className="block truncate font-semibold">Detox AI Admin</span>
                  <span className="text-xs text-amber-100">Creator Mode</span>
                </span>
              </Link>
              <button
                type="button"
                onClick={() => setIsMobileNavOpen(false)}
                className="grid size-10 shrink-0 place-items-center rounded-xl border border-white/10 bg-white/5 text-slate-200"
                aria-label="Close creator navigation"
              >
                <X size={18} />
              </button>
            </div>
            <div className="mt-5 min-h-0 flex-1 overflow-y-auto pr-1 detox-scrollbar">
              <CreatorNav activeSection={activeSection} onNavigate={() => setIsMobileNavOpen(false)} />
            </div>
          </aside>
        </div>
      ) : null}
      <div className="relative flex min-h-screen">
        <aside className="hidden w-72 shrink-0 border-r border-white/10 bg-[#050b18]/94 p-4 lg:block">
          <Link href="/creator" className="flex items-center gap-3 rounded-2xl border border-white/10 bg-white/5 p-3">
            <AppLogo size={42} className="rounded-xl" />
            <span>
              <span className="block font-semibold">Detox AI Admin</span>
              <span className="text-xs text-amber-100">Creator Mode</span>
            </span>
          </Link>
          <div className="mt-5">
            <CreatorNav activeSection={activeSection} />
          </div>
        </aside>

        <main className="min-w-0 flex-1">
          <header className="sticky top-0 z-30 border-b border-white/10 bg-[#020713]/82 px-4 py-3 backdrop-blur-xl">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div className="flex min-w-0 items-center gap-3">
                <button
                  type="button"
                  onClick={() => setIsMobileNavOpen(true)}
                  className="grid size-10 shrink-0 place-items-center rounded-xl border border-white/10 bg-white/5 text-slate-200 lg:hidden"
                  aria-label="Open creator navigation"
                >
                  <Menu size={18} />
                </button>
                <span className="grid size-10 shrink-0 place-items-center rounded-xl border border-cyan-300/20 bg-cyan-300/10 text-cyan-100 lg:hidden">
                  <ActiveSectionIcon size={18} />
                </span>
                <div className="min-w-0">
                <p className="text-xs uppercase tracking-[0.22em] text-cyan-200">Detox AI Admin</p>
                  <h1 className="truncate text-xl font-semibold capitalize sm:text-2xl">{activeSection.replace("-", " ")}</h1>
                </div>
              </div>
              <div className="flex min-w-0 items-center gap-2">
                <div className="hidden h-10 min-w-64 items-center gap-2 rounded-xl border border-white/10 bg-white/5 px-3 text-slate-400 md:flex">
                  <Search size={16} />
                  <input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Search users, payments, chats..." className="w-full bg-transparent text-sm outline-none" />
                </div>
                <button
                  type="button"
                  onClick={() => void loadStats()}
                  disabled={isLoadingStats}
                  className="grid size-10 place-items-center rounded-xl border border-white/10 bg-white/5 text-slate-200 transition hover:bg-white/8 disabled:cursor-not-allowed disabled:opacity-55"
                  aria-label="Refresh creator data"
                  title="Refresh creator data"
                >
                  <RefreshCw className={isLoadingStats ? "animate-spin" : ""} size={17} />
                </button>
                <span className="hidden items-center gap-2 rounded-xl border border-amber-300/25 bg-amber-300/10 px-3 py-2 text-sm font-semibold text-amber-100 sm:inline-flex">
                  <Crown size={15} />
                  Unlimited Access
                </span>
                <button type="button" onClick={logoutCreator} className="inline-flex h-10 items-center gap-2 rounded-xl border border-red-300/20 bg-red-400/10 px-3 text-sm font-semibold text-red-100">
                  <LogOut size={15} />
                  Logout
                </button>
              </div>
            </div>
            <div className="mt-3 grid gap-3 lg:hidden">
              <div className="flex h-10 items-center gap-2 rounded-xl border border-white/10 bg-white/5 px-3 text-slate-400 md:hidden">
                <Search size={16} />
                <input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Search admin data..." className="w-full bg-transparent text-sm outline-none" />
              </div>
              <nav className="-mx-4 flex gap-2 overflow-x-auto px-4 pb-1 detox-scrollbar" aria-label="Quick creator sections">
                {navItems.filter(([id]) => primaryMobileSections.includes(id as (typeof primaryMobileSections)[number])).map(([id, label, Icon]) => (
                  <Link
                    key={id}
                    href={id === "overview" ? "/creator" : `/creator/${id}`}
                    className={`inline-flex min-h-9 shrink-0 items-center gap-2 rounded-full border px-3 text-xs font-semibold transition ${
                      activeSection === id
                        ? "border-cyan-300 bg-cyan-300 text-slate-950"
                        : "border-white/10 bg-white/[0.035] text-slate-300"
                    }`}
                  >
                    <Icon size={14} />
                    {label}
                  </Link>
                ))}
              </nav>
            </div>
          </header>

          <div className="p-4 sm:p-6">
            {actionStatus ? (
              <p className="mb-4 inline-flex items-center gap-2 rounded-xl border border-cyan-300/20 bg-cyan-300/10 px-3 py-2 text-sm text-cyan-50">
                <Check size={16} />
                {actionStatus}
              </p>
            ) : null}

            {isLoadingStats ? (
              <div className="mb-4 inline-flex items-center gap-2 rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-sm text-slate-300">
                <Loader2 className="animate-spin" size={16} />
                Loading real Firestore data...
              </div>
            ) : null}

            {activeSection === "overview" ? (
              <div className="grid gap-5">
                <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
                  <StatCard label="Total users" value={formatNumber(summary.totalUsers)} />
                  <StatCard label="Total chats" value={formatNumber(summary.totalChats)} />
                  <StatCard label="Total messages" value={formatNumber(summary.totalMessages)} />
                  <StatCard label="Total revenue" value={formatRupees(summary.totalRevenue)} accent="text-amber-100" />
                  <StatCard label="Pending payments" value={formatNumber(summary.pendingPayments)} />
                  <StatCard label="Active paid plans" value={formatNumber(summary.activePaidPlans)} />
                  <StatCard label="Expired plans" value={formatNumber(summary.expiredPlans)} />
                  <StatCard label="Most used model" value={asString(summary.mostUsedModel)} />
                </div>
                <div className="grid gap-5 xl:grid-cols-3">
                  <MiniBarChart title="Plan distribution" values={stats?.charts.planCounts ?? {}} />
                  <MiniBarChart title="Revenue by plan" values={stats?.charts.revenueByPlan ?? {}} />
                  <MiniBarChart title="Payment status" values={stats?.charts.paymentStatus ?? {}} />
                  <MiniBarChart title="AI reply reactions" values={stats?.charts.messageReactions ?? {}} />
                  <MiniBarChart title="Detox Labs votes" values={stats?.charts.labVotes ?? {}} />
                </div>
                {!stats || asNumber(summary.totalUsers) + asNumber(summary.totalMessages) + asNumber(summary.totalRevenue) === 0 ? <EmptyState /> : null}
              </div>
            ) : null}

            {activeSection === "users" ? (
              <DataTable
                title="User management"
                rows={filteredUsers}
                empty="No users yet."
                columns={[
                  ["Name", (row) => asString(row.name, "Detox User")],
                  ["Email", (row) => asString(row.email)],
                  ["Plan", (row) => <span className="capitalize">{asString(row.plan, "free")}</span>],
                  ["Status", (row) => String(row.isBanned ? "Banned" : asString(row.planStatus, "active"))],
                  ["Expires", (row) => formatDate(row.planExpiresAt)],
                  ["Usage", (row) => `${formatNumber(row.dailyMessages)} today / ${formatNumber(row.monthlyMessages)} month`],
                  ["Actions", (row) => {
                    const accessBody = { uid: row.id };
                    const accessEndpoint = row.isBanned ? "/api/creator/user/unban" : "/api/creator/user/ban";

                    return (
                      <div className="grid min-w-[260px] grid-cols-3 gap-2 xl:min-w-[360px] xl:grid-cols-6">
                        {creatorPlanActions.map((action) => {
                          const body = { uid: row.id, plan: action.plan };
                          const isCurrentPlan = stringValue(row.plan, "free") === action.plan;

                          return (
                            <CreatorActionButton
                              key={action.plan}
                              tone={isCurrentPlan ? "success" : action.tone}
                              disabled={isActionRunning("/api/creator/user/update-plan", body)}
                              onClick={() =>
                                creatorAction(
                                  "/api/creator/user/update-plan",
                                  body,
                                  `User moved to ${action.label} plan${action.plan === "free" ? "." : " for 30 days."}`,
                                )
                              }
                              className={isCurrentPlan ? "ring-1 ring-emerald-200/40" : ""}
                            >
                              {action.label}
                            </CreatorActionButton>
                          );
                        })}
                        <div className="col-span-3 grid grid-cols-[1fr_44px] gap-2 xl:col-span-6">
                          <CreatorActionButton
                            tone={row.isBanned ? "success" : "danger"}
                            disabled={isActionRunning(accessEndpoint, accessBody)}
                            onClick={() => creatorAction(accessEndpoint, accessBody, row.isBanned ? "User unbanned." : "User banned.")}
                          >
                            {row.isBanned ? "Unban" : "Ban"}
                          </CreatorActionButton>
                          <button
                            type="button"
                            onClick={() => setSelectedUserProfile(row)}
                            className="grid min-h-9 place-items-center rounded-lg border border-white/10 bg-white/[0.035] text-slate-200 transition hover:bg-white/8 hover:text-white"
                            aria-label={`Open profile for ${asString(row.email, "user")}`}
                            title="View edited profile and more"
                          >
                            <MoreHorizontal size={17} />
                          </button>
                        </div>
                      </div>
                    );
                  }],
                ]}
              />
            ) : null}

            {activeSection === "payments" ? (
              <div className="grid gap-5">
                <DataTable
                  title="Pending payments"
                  rows={pendingPayments}
                  empty="No pending payments."
                  columns={[
                    ["User", (row) => asString(row.userEmail)],
                    ["Plan", (row) => <span className="capitalize">{asString(row.plan)}</span>],
                    ["Amount", (row) => formatRupees(row.amount)],
                    ["Transaction", (row) => asString(row.transactionId)],
                    ["Submitted", (row) => formatDate(row.createdAt)],
                    ["Proof", (row) => row.screenshotUrl ? <a className="text-cyan-100 underline" href={String(row.screenshotUrl)} target="_blank">Open</a> : "No proof"],
                    ["Actions", (row) => {
                      const approveBody = { paymentId: row.id };
                      const rejectBody = { paymentId: row.id, rejectedReason: "Payment proof could not be verified." };

                      return (
                        <div className="grid grid-cols-2 gap-2 sm:flex sm:flex-wrap">
                          <CreatorActionButton
                            tone="success"
                            disabled={isActionRunning("/api/creator/payment/approve", approveBody)}
                            onClick={() => creatorAction("/api/creator/payment/approve", approveBody, "Payment approved and plan activated for 30 days.")}
                          >
                            Approve
                          </CreatorActionButton>
                          <CreatorActionButton
                            tone="danger"
                            disabled={isActionRunning("/api/creator/payment/reject", rejectBody)}
                            onClick={() => creatorAction("/api/creator/payment/reject", rejectBody, "Payment rejected.")}
                          >
                            Reject
                          </CreatorActionButton>
                        </div>
                      );
                    }],
                  ]}
                />
                <DataTable
                  title="Payment history"
                  rows={[...approvedPayments, ...rejectedPayments]}
                  empty="No payment history yet."
                  columns={[
                    ["User", (row) => asString(row.userEmail)],
                    ["Plan", (row) => <span className="capitalize">{asString(row.plan)}</span>],
                    ["Amount", (row) => formatRupees(row.amount)],
                    ["Status", (row) => <span className="capitalize">{asString(row.status)}</span>],
                    ["Approved", (row) => formatDate(row.approvedAt)],
                    ["Rejected", (row) => formatDate(row.rejectedAt)],
                  ]}
                />
              </div>
            ) : null}

            {activeSection === "revenue" ? (
              <div className="grid gap-5">
                <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
                  <StatCard label="Total revenue" value={formatRupees(summary.totalRevenue)} accent="text-amber-100" />
                  <StatCard label="Today revenue" value={formatRupees(summary.todayRevenue)} />
                  <StatCard label="This week" value={formatRupees(summary.weekRevenue)} />
                  <StatCard label="This month" value={formatRupees(summary.monthRevenue)} />
                </div>
                <MiniBarChart title="Plan-wise approved revenue" values={stats?.charts.revenueByPlan ?? {}} />
              </div>
            ) : null}

            {activeSection === "logs" ? (
              <DataTable
                title="Audit logs"
                rows={stats?.collections.logs ?? []}
                empty="No audit logs yet."
                columns={[
                  ["Action", (row) => asString(row.action)],
                  ["Admin", (row) => asString(row.adminEmail)],
                  ["Target user", (row) => asString(row.targetUserId, "-")],
                  ["Payment", (row) => asString(row.targetPaymentId, "-")],
                  ["Created", (row) => formatDate(row.createdAt)],
                ]}
              />
            ) : null}

            {activeSection === "chats" ? (
              <ChatTranscriptPanel
                chats={filteredChats}
                messages={stats?.collections.messages ?? []}
                selectedChatId={selectedCreatorChatId}
                onSelectChat={setSelectedCreatorChatId}
              />
            ) : null}

            {activeSection === "reports" ? (
              <DataTable
                title="Reports, feature suggestions, and payment issues"
                rows={filteredReports}
                empty="No reports yet."
                columns={[
                  ["Type", (row) => reportTypeLabel(row.type ?? row.reason)],
                  ["Title", (row) => asString(row.title, asString(row.reason))],
                  ["User", (row) => asString(row.userEmail)],
                  ["Details", (row) => asString(row.details, "-")],
                  ["Page", (row) => row.page ? <a className="text-cyan-100 underline" href={String(row.page)} target="_blank">Open page</a> : "-"],
                  ["Priority", (row) => <span className="capitalize">{asString(row.priority, "normal")}</span>],
                  ["Status", (row) => <span className="capitalize">{asString(row.status, "open")}</span>],
                  ["Created", (row) => formatDate(row.createdAt)],
                ]}
              />
            ) : null}

            {["plans", "limits", "models", "tools", "feedback", "support", "security", "announcements", "app-settings"].includes(activeSection) ? (
              <section className="grid gap-5">
                <div className="rounded-2xl border border-white/10 bg-[#091221]/88 p-6">
                  <div className="flex items-start justify-between gap-4">
                    <div>
                      <h2 className="text-xl font-semibold capitalize">{activeSection.replace("-", " ")}</h2>
                      <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-400">
                        This page is connected to the creator shell and protected APIs. The next pass can deepen the editor forms for this section without changing the security gate.
                      </p>
                    </div>
                    <ChevronRight className="text-cyan-100" />
                  </div>
                  <div className="mt-5 grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
                    {paidPlans.map((plan) => (
                      <Field key={plan} label={`${plan} duration`} value="30 days after approval" />
                    ))}
                    <Field label="Creator access" value="Unlimited, no expiry" />
                  </div>
                </div>
                {activeSection === "models" ? (
                  <DataTable
                    title="Model records"
                    rows={stats?.collections.models ?? []}
                    empty="No custom model records yet. Current app models still load from code."
                    columns={[
                      ["Model", (row) => asString(row.displayName ?? row.modelId)],
                      ["Access", (row) => asString(row.access)],
                      ["Backend", (row) => asString(row.backendModel)],
                      ["Enabled", (row) => String(row.enabled ?? true)],
                      ["Updated", (row) => formatDate(row.updatedAt)],
                    ]}
                  />
                ) : null}
              </section>
            ) : null}
          </div>
        </main>
      </div>
    </div>
  );
}
