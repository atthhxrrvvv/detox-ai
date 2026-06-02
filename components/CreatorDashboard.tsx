"use client";

import Link from "next/link";
import { FormEvent, useEffect, useMemo, useState } from "react";
import { onAuthStateChanged, type User } from "firebase/auth";
import { collection, doc, getDocs, serverTimestamp, setDoc, writeBatch } from "firebase/firestore";
import {
  AlertTriangle,
  BarChart3,
  Bell,
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
  Megaphone,
  MessageSquare,
  Search,
  Settings,
  ShieldCheck,
  Sparkles,
  Star,
  Users,
  Wrench,
} from "lucide-react";
import { AppLogo } from "@/components/AppLogo";
import { CREATOR_EMAIL } from "@/lib/constants";
import { auth, db } from "@/lib/firebase";

type CreatorStats = {
  creatorEmail: string;
  generatedAt: string;
  summary: Record<string, number | string>;
  charts: {
    planCounts: Record<string, number>;
    revenueByPlan: Record<string, number>;
    paymentStatus: Record<string, number>;
  };
  collections: {
    users: CreatorRecord[];
    chats: CreatorRecord[];
    messages: CreatorRecord[];
    payments: CreatorRecord[];
    reports: CreatorRecord[];
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

function asString(value: unknown, fallback = "No data yet") {
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

function isSameDay(value: unknown, now = new Date()) {
  const iso = toIsoDate(value);
  if (!iso) return false;
  return new Date(iso).toDateString() === now.toDateString();
}

function isSameMonth(value: unknown, now = new Date()) {
  const iso = toIsoDate(value);
  if (!iso) return false;
  const date = new Date(iso);
  return date.getFullYear() === now.getFullYear() && date.getMonth() === now.getMonth();
}

function isSameWeek(value: unknown, now = new Date()) {
  const iso = toIsoDate(value);
  if (!iso) return false;
  const date = new Date(iso);
  const start = new Date(now);
  start.setDate(now.getDate() - now.getDay());
  start.setHours(0, 0, 0, 0);
  return date >= start && date <= now;
}

function countBy(collectionRows: CreatorRecord[], predicate: (item: CreatorRecord) => boolean) {
  return collectionRows.reduce((count, item) => count + (predicate(item) ? 1 : 0), 0);
}

function mostUsedModel(messages: CreatorRecord[]) {
  const counts = new Map<string, number>();
  messages.forEach((message) => {
    const modelId = asString(message.modelId, "");
    if (!modelId) return;
    counts.set(modelId, (counts.get(modelId) ?? 0) + 1);
  });
  return [...counts.entries()].sort((a, b) => b[1] - a[1])[0]?.[0] ?? "No data yet";
}

function mostActiveUser(messages: CreatorRecord[]) {
  const counts = new Map<string, number>();
  messages.forEach((message) => {
    const userEmail = asString(message.userEmail, "");
    if (!userEmail) return;
    counts.set(userEmail, (counts.get(userEmail) ?? 0) + 1);
  });
  return [...counts.entries()].sort((a, b) => b[1] - a[1])[0]?.[0] ?? "No data yet";
}

async function readCollection(name: string) {
  const snapshot = await getDocs(collection(db, name));
  return snapshot.docs.map((documentSnapshot) => ({
    id: documentSnapshot.id,
    ...documentSnapshot.data(),
  })) as CreatorRecord[];
}

function buildCreatorStats(collections: CreatorStats["collections"]): CreatorStats {
  const paidPlanIds = ["lite", "go", "pro", "premium", "ultimate"];
  const approvedPayments = collections.payments.filter((payment) => payment.status === "approved");
  const totalRevenue = approvedPayments.reduce((total, payment) => total + asNumber(payment.amount), 0);
  const revenueByPlan = Object.fromEntries(
    paidPlanIds.map((plan) => [
      plan,
      approvedPayments
        .filter((payment) => payment.plan === plan)
        .reduce((total, payment) => total + asNumber(payment.amount), 0),
    ]),
  );
  const planCounts = Object.fromEntries(
    ["free", ...paidPlanIds, "creator"].map((plan) => [
      plan,
      countBy(collections.users, (user) => asString(user.plan, "free") === plan),
    ]),
  );
  const activePaidUsers = collections.users.filter((user) => paidPlanIds.includes(asString(user.plan, "")) && asString(user.planStatus, "active") === "active");
  const expiredUsers = collections.users.filter((user) => asString(user.planStatus, "") === "expired");

  return {
    creatorEmail: CREATOR_EMAIL,
    generatedAt: new Date().toISOString(),
    summary: {
      totalUsers: collections.users.length,
      freeUsers: planCounts.free ?? 0,
      liteUsers: planCounts.lite ?? 0,
      goUsers: planCounts.go ?? 0,
      proUsers: planCounts.pro ?? 0,
      premiumUsers: planCounts.premium ?? 0,
      ultimateUsers: planCounts.ultimate ?? 0,
      creatorUsers: planCounts.creator ?? 0,
      bannedUsers: countBy(collections.users, (user) => Boolean(user.isBanned)),
      totalChats: collections.chats.length,
      totalMessages: collections.messages.length,
      messagesToday: countBy(collections.messages, (message) => isSameDay(message.createdAt)),
      messagesThisWeek: countBy(collections.messages, (message) => isSameWeek(message.createdAt)),
      messagesThisMonth: countBy(collections.messages, (message) => isSameMonth(message.createdAt)),
      totalRevenue,
      todayRevenue: approvedPayments.filter((payment) => isSameDay(payment.approvedAt ?? payment.createdAt)).reduce((total, payment) => total + asNumber(payment.amount), 0),
      weekRevenue: approvedPayments.filter((payment) => isSameWeek(payment.approvedAt ?? payment.createdAt)).reduce((total, payment) => total + asNumber(payment.amount), 0),
      monthRevenue: approvedPayments.filter((payment) => isSameMonth(payment.approvedAt ?? payment.createdAt)).reduce((total, payment) => total + asNumber(payment.amount), 0),
      pendingPayments: countBy(collections.payments, (payment) => payment.status === "pending"),
      approvedPayments: approvedPayments.length,
      rejectedPayments: countBy(collections.payments, (payment) => payment.status === "rejected"),
      activePaidPlans: activePaidUsers.length,
      expiredPlans: expiredUsers.length,
      totalReports: collections.reports.length,
      openReports: countBy(collections.reports, (report) => asString(report.status, "open") === "open"),
      solvedReports: countBy(collections.reports, (report) => asString(report.status, "") === "solved"),
      mostUsedModel: mostUsedModel(collections.messages),
      mostActiveUser: mostActiveUser(collections.messages),
      apiUsageEstimate: collections.messages.reduce((total, message) => total + asNumber(message.tokensUsed), 0),
    },
    charts: {
      planCounts,
      revenueByPlan,
      paymentStatus: {
        pending: countBy(collections.payments, (payment) => payment.status === "pending"),
        approved: approvedPayments.length,
        rejected: countBy(collections.payments, (payment) => payment.status === "rejected"),
        expired: countBy(collections.payments, (payment) => payment.status === "expired"),
        refunded: countBy(collections.payments, (payment) => payment.status === "refunded"),
      },
    },
    collections,
  };
}

function lockLabel(lock?: LockState | null) {
  if (!lock?.locked || !lock.lockedUntil) return null;
  return `Locked until ${new Date(lock.lockedUntil).toLocaleString("en-IN")}`;
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
    <section className="rounded-2xl border border-white/10 bg-[#091221]/88 p-5">
      <h3 className="font-semibold text-white">{title}</h3>
      <div className="mt-4 overflow-x-auto">
        {rows.length ? (
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
        ) : (
          <EmptyState label={empty} />
        )}
      </div>
    </section>
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
  const [query, setQuery] = useState("");

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

  async function loadStats() {
    if (!firebaseUser || !creatorSession || !isFirebaseCreator) return;
    setIsLoadingStats(true);
    setActionStatus("");
    try {
      const [users, chats, messages, payments, reports, models, logs] = await Promise.all([
        readCollection("users"),
        readCollection("chats"),
        readCollection("messages"),
        readCollection("payments"),
        readCollection("reports").catch(() => []),
        readCollection("models").catch(() => []),
        readCollection("admin_logs").catch(() => []),
      ]);
      setStats(buildCreatorStats({ users, chats, messages, payments, reports, models, logs }));
    } catch (error) {
      setActionStatus(
        error instanceof Error
          ? `${error.message} If this is Firestore rules, deploy the updated firestore.rules file.`
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
      setGateError(data.error ?? "Creator login failed.");
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
      setGateError(data.error ?? "PIN verification failed.");
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
    setActionStatus("");
    try {
      if (endpoint === "/api/creator/payment/approve") {
        const paymentId = String(body.paymentId ?? "");
        const payment = stats?.collections.payments.find((item) => item.id === paymentId);
        if (!payment) throw new Error("Payment not found.");
        const userId = asString(payment.userId, "");
        const plan = asString(payment.plan, "");
        if (!userId || !paidPlans.includes(plan as (typeof paidPlans)[number])) throw new Error("Payment has invalid user or plan.");
        const activatedAt = new Date();
        const expiresAt = new Date(activatedAt);
        expiresAt.setDate(expiresAt.getDate() + 30);
        const batch = writeBatch(db);
        batch.set(doc(db, "users", userId), {
          plan,
          planStatus: "active",
          planActivatedAt: serverTimestamp(),
          planExpiresAt: expiresAt,
          planDurationDays: 30,
          updatedAt: serverTimestamp(),
        }, { merge: true });
        batch.set(doc(db, "payments", paymentId), {
          status: "approved",
          approvedAt: serverTimestamp(),
          approvedBy: CREATOR_EMAIL,
          planActivatedAt: serverTimestamp(),
          planExpiresAt: expiresAt,
          planDurationDays: 30,
          updatedAt: serverTimestamp(),
        }, { merge: true });
        batch.set(doc(collection(db, "admin_logs")), {
          adminEmail: CREATOR_EMAIL,
          action: "PAYMENT_APPROVED",
          targetUserId: userId,
          targetPaymentId: paymentId,
          details: { plan, planDurationDays: 30 },
          createdAt: serverTimestamp(),
        });
        await batch.commit();
      } else if (endpoint === "/api/creator/payment/reject") {
        const paymentId = String(body.paymentId ?? "");
        const payment = stats?.collections.payments.find((item) => item.id === paymentId);
        const batch = writeBatch(db);
        batch.set(doc(db, "payments", paymentId), {
          status: "rejected",
          rejectedAt: serverTimestamp(),
          rejectedBy: CREATOR_EMAIL,
          rejectedReason: String(body.rejectedReason ?? "Payment proof could not be verified."),
          updatedAt: serverTimestamp(),
        }, { merge: true });
        batch.set(doc(collection(db, "admin_logs")), {
          adminEmail: CREATOR_EMAIL,
          action: "PAYMENT_REJECTED",
          targetUserId: payment?.userId ?? null,
          targetPaymentId: paymentId,
          details: { rejectedReason: String(body.rejectedReason ?? "") },
          createdAt: serverTimestamp(),
        });
        await batch.commit();
      } else if (endpoint === "/api/creator/user/update-plan") {
        const uid = String(body.uid ?? "");
        const plan = String(body.plan ?? "free");
        const patch: Record<string, unknown> = {
          plan,
          planStatus: plan === "free" ? "free" : "active",
          updatedAt: serverTimestamp(),
        };
        if (paidPlans.includes(plan as (typeof paidPlans)[number])) {
          const expiresAt = new Date();
          expiresAt.setDate(expiresAt.getDate() + 30);
          patch.planActivatedAt = serverTimestamp();
          patch.planExpiresAt = expiresAt;
          patch.planDurationDays = 30;
        }
        await setDoc(doc(db, "users", uid), patch, { merge: true });
        await setDoc(doc(collection(db, "admin_logs")), {
          adminEmail: CREATOR_EMAIL,
          action: "USER_PLAN_CHANGED",
          targetUserId: uid,
          details: { plan },
          createdAt: serverTimestamp(),
        });
      } else if (endpoint === "/api/creator/user/ban" || endpoint === "/api/creator/user/unban") {
        const uid = String(body.uid ?? "");
        const isBanned = endpoint.endsWith("/ban");
        await setDoc(doc(db, "users", uid), {
          isBanned,
          planStatus: isBanned ? "banned" : "free",
          updatedAt: serverTimestamp(),
        }, { merge: true });
        await setDoc(doc(collection(db, "admin_logs")), {
          adminEmail: CREATOR_EMAIL,
          action: isBanned ? "USER_BANNED" : "USER_UNBANNED",
          targetUserId: uid,
          createdAt: serverTimestamp(),
        });
      }
      setActionStatus(success);
      await loadStats();
    } catch (error) {
      setActionStatus(
        error instanceof Error
          ? `${error.message} If this is Firestore rules, deploy the updated firestore.rules file.`
          : "Creator action failed.",
      );
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
              Three wrong attempts locks this panel for 24 hours.
            </p>
            <div className="mt-6 grid gap-3 text-sm text-slate-300 sm:grid-cols-2">
              {["Server-side credential checks", "HttpOnly signed session", "PIN second step", "24-hour lockout"].map((item) => (
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
                <button disabled={Boolean(lock?.locked)} className="mt-2 h-11 rounded-xl bg-white font-semibold text-slate-950 disabled:cursor-not-allowed disabled:opacity-50">
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
                <button disabled={Boolean(lock?.locked)} className="mt-2 h-11 rounded-xl bg-cyan-300 font-semibold text-slate-950 disabled:cursor-not-allowed disabled:opacity-50">
                  Unlock Creator Dashboard
                </button>
                <button type="button" onClick={() => setPendingToken("")} className="text-sm font-semibold text-slate-400 hover:text-white">
                  Back to username and password
                </button>
              </form>
            )}

            <p className="mt-5 text-xs leading-5 text-slate-500">
              Attempts remaining: {lock?.attemptsRemaining ?? 3}. Credentials are checked on the server, then the browser receives only a signed creator session cookie.
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
            <button onClick={logoutCreator} className="inline-flex h-10 items-center rounded-xl border border-white/10 px-4 text-sm font-semibold text-slate-200">Lock Creator Gate</button>
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
      <div className="fixed inset-0 bg-[radial-gradient(circle_at_20%_20%,rgba(6,182,212,0.12),transparent_28%),radial-gradient(circle_at_80%_0%,rgba(139,92,246,0.13),transparent_24%)]" />
      <div className="relative flex min-h-screen">
        <aside className="hidden w-72 shrink-0 border-r border-white/10 bg-[#050b18]/94 p-4 lg:block">
          <Link href="/creator" className="flex items-center gap-3 rounded-2xl border border-white/10 bg-white/5 p-3">
            <AppLogo size={42} className="rounded-xl" />
            <span>
              <span className="block font-semibold">Detox AI Admin</span>
              <span className="text-xs text-amber-100">Creator Mode</span>
            </span>
          </Link>
          <nav className="mt-5 grid gap-1">
            {navItems.map(([id, label, Icon]) => (
              <Link
                key={id}
                href={id === "overview" ? "/creator" : `/creator/${id}`}
                className={`flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-semibold transition ${
                  activeSection === id ? "bg-cyan-300 text-slate-950" : "text-slate-300 hover:bg-white/8 hover:text-white"
                }`}
              >
                <Icon size={16} />
                {label}
              </Link>
            ))}
          </nav>
        </aside>

        <main className="min-w-0 flex-1">
          <header className="sticky top-0 z-30 border-b border-white/10 bg-[#020713]/82 px-4 py-3 backdrop-blur-xl">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div>
                <p className="text-xs uppercase tracking-[0.22em] text-cyan-200">Detox AI Admin</p>
                <h1 className="text-2xl font-semibold capitalize">{activeSection.replace("-", " ")}</h1>
              </div>
              <div className="flex min-w-0 items-center gap-2">
                <div className="hidden h-10 min-w-64 items-center gap-2 rounded-xl border border-white/10 bg-white/5 px-3 text-slate-400 md:flex">
                  <Search size={16} />
                  <input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Search users, payments, chats..." className="w-full bg-transparent text-sm outline-none" />
                </div>
                <button className="grid size-10 place-items-center rounded-xl border border-white/10 bg-white/5 text-slate-200" aria-label="Notifications">
                  <Bell size={17} />
                </button>
                <span className="hidden items-center gap-2 rounded-xl border border-amber-300/25 bg-amber-300/10 px-3 py-2 text-sm font-semibold text-amber-100 sm:inline-flex">
                  <Crown size={15} />
                  Unlimited Access
                </span>
                <button onClick={logoutCreator} className="inline-flex h-10 items-center gap-2 rounded-xl border border-red-300/20 bg-red-400/10 px-3 text-sm font-semibold text-red-100">
                  <LogOut size={15} />
                  Logout
                </button>
              </div>
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
                  ["Actions", (row) => (
                    <div className="flex flex-wrap gap-2">
                      <button onClick={() => creatorAction("/api/creator/user/update-plan", { uid: row.id, plan: "free" }, "User moved to Free plan.")} className="rounded-lg border border-white/10 px-2 py-1 text-xs">Free</button>
                      <button onClick={() => creatorAction("/api/creator/user/update-plan", { uid: row.id, plan: "premium" }, "User moved to Premium for 30 days.")} className="rounded-lg border border-cyan-300/20 px-2 py-1 text-xs text-cyan-100">Premium</button>
                      {row.isBanned ? (
                        <button onClick={() => creatorAction("/api/creator/user/unban", { uid: row.id }, "User unbanned.")} className="rounded-lg border border-emerald-300/20 px-2 py-1 text-xs text-emerald-100">Unban</button>
                      ) : (
                        <button onClick={() => creatorAction("/api/creator/user/ban", { uid: row.id }, "User banned.")} className="rounded-lg border border-red-300/20 px-2 py-1 text-xs text-red-100">Ban</button>
                      )}
                    </div>
                  )],
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
                    ["Actions", (row) => (
                      <div className="flex flex-wrap gap-2">
                        <button onClick={() => creatorAction("/api/creator/payment/approve", { paymentId: row.id }, "Payment approved and plan activated for 30 days.")} className="rounded-lg bg-emerald-300 px-2 py-1 text-xs font-semibold text-emerald-950">Approve</button>
                        <button onClick={() => creatorAction("/api/creator/payment/reject", { paymentId: row.id, rejectedReason: "Payment proof could not be verified." }, "Payment rejected.")} className="rounded-lg bg-red-400 px-2 py-1 text-xs font-semibold text-white">Reject</button>
                      </div>
                    )],
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
              <DataTable
                title="Chat moderation"
                rows={stats?.collections.chats ?? []}
                empty="No chats yet."
                columns={[
                  ["Title", (row) => asString(row.title)],
                  ["User", (row) => asString(row.userEmail)],
                  ["Model", (row) => asString(row.modelId)],
                  ["Messages", (row) => formatNumber(row.messageCount)],
                  ["Reported", (row) => String(Boolean(row.isReported))],
                  ["Updated", (row) => formatDate(row.updatedAt)],
                ]}
              />
            ) : null}

            {activeSection === "reports" ? (
              <DataTable
                title="Reports"
                rows={stats?.collections.reports ?? []}
                empty="No reports yet."
                columns={[
                  ["User", (row) => asString(row.userEmail)],
                  ["Reason", (row) => asString(row.reason)],
                  ["Status", (row) => asString(row.status, "open")],
                  ["Details", (row) => asString(row.details, "-")],
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
