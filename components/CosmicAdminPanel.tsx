"use client";

import { FormEvent, useState } from "react";
import {
  BarChart3,
  CreditCard,
  Database,
  Eye,
  KeyRound,
  Lock,
  LogOut,
  ShieldCheck,
  Sparkles,
  Users,
} from "lucide-react";

type AdminDashboardData = {
  admin: string;
  expiresAt: number;
  overviewStats: Array<[string, string]>;
  users: Array<{
    uid: string;
    name: string;
    email: string;
    plan: string;
    role: string;
    totalMessages: number;
    chatCount: number;
    isBanned: boolean;
    blockedPermanently: boolean;
    joinedDate: string;
    lastActive: string;
  }>;
  payments: Array<{
    paymentId: string;
    userEmail: string;
    plan: string;
    billingCycle: string;
    amount: number;
    transactionId: string;
    screenshotUrl: string;
    status: string;
    createdAt: string;
  }>;
  maintenance: {
    maintenanceMode: boolean;
    maintenanceMessage: string;
  };
  sections: Array<{
    title: string;
    items: string[];
  }>;
  notices: string[];
};

export function CosmicAdminPanel() {
  const [unlockClicks, setUnlockClicks] = useState(0);
  const [isUnlocked, setIsUnlocked] = useState(false);
  const [stage, setStage] = useState<"credentials" | "secret" | "dashboard">("credentials");
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [secretKey, setSecretKey] = useState("");
  const [pendingToken, setPendingToken] = useState("");
  const [adminToken, setAdminToken] = useState("");
  const [dashboard, setDashboard] = useState<AdminDashboardData | null>(null);
  const [maintenanceMessage, setMaintenanceMessage] = useState("Detox AI is in maintenance mode.");
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  function handleDotClick() {
    const next = unlockClicks + 1;
    setUnlockClicks(next);
    if (next >= 5) {
      setIsUnlocked(true);
    }
  }

  async function handleCredentialSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");
    setIsLoading(true);

    try {
      const response = await fetch("/api/cosmic-admin/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username, password }),
      });
      const data = await response.json();

      if (!response.ok) {
        const lockMessage = data.lockedUntil
          ? ` Locked until ${new Date(data.lockedUntil).toLocaleString("en-IN")}.`
          : data.attemptsLeft !== undefined
            ? ` Attempts left: ${data.attemptsLeft}.`
            : "";
        setError(`${data.error ?? "Admin login failed."}${lockMessage}`);
        return;
      }

      setPendingToken(data.pendingToken);
      setStage("secret");
    } catch {
      setError("Admin login API is not reachable.");
    } finally {
      setIsLoading(false);
    }
  }

  async function handleSecretSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");
    setIsLoading(true);

    try {
      const response = await fetch("/api/cosmic-admin/verify-secret", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ pendingToken, secretKey }),
      });
      const data = await response.json();

      if (!response.ok) {
        setError(data.error ?? "Invalid secret key.");
        return;
      }

      setAdminToken(data.adminToken);
      await loadDashboard(data.adminToken);
      setStage("dashboard");
    } catch {
      setError("Secret verification API is not reachable.");
    } finally {
      setIsLoading(false);
    }
  }

  async function loadDashboard(token = adminToken) {
    const response = await fetch("/api/cosmic-admin/dashboard", {
      headers: { Authorization: `Bearer ${token}` },
      cache: "no-store",
    });
    const data = await response.json();

    if (!response.ok) {
      setError(data.error ?? "Admin session expired.");
      setStage("credentials");
      setAdminToken("");
      setPendingToken("");
      return;
    }

    setDashboard(data);
    setMaintenanceMessage(data.maintenance?.maintenanceMessage ?? "Detox AI is in maintenance mode.");
  }

  async function updateMaintenance(maintenanceMode: boolean) {
    setError("");
    setIsLoading(true);

    try {
      const response = await fetch("/api/cosmic-admin/maintenance", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${adminToken}`,
        },
        body: JSON.stringify({ maintenanceMode, maintenanceMessage }),
      });
      const data = await response.json();
      if (!response.ok) {
        setError(data.error ?? "Maintenance update failed.");
        return;
      }
      await loadDashboard();
    } catch {
      setError("Maintenance API is not reachable.");
    } finally {
      setIsLoading(false);
    }
  }

  async function runUserAction(uid: string, action: "ban" | "unban" | "block") {
    setError("");
    setIsLoading(true);

    try {
      const response = await fetch("/api/cosmic-admin/user-action", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${adminToken}`,
        },
        body: JSON.stringify({ uid, action }),
      });
      const data = await response.json();
      if (!response.ok) {
        setError(data.error ?? "User action failed.");
        return;
      }
      await loadDashboard();
    } catch {
      setError("User action API is not reachable.");
    } finally {
      setIsLoading(false);
    }
  }

  async function runPaymentAction(paymentId: string, action: "approve" | "reject") {
    setError("");
    setIsLoading(true);

    try {
      const rejectedReason =
        action === "reject"
          ? window.prompt("Reason for rejecting this payment request:", "Payment could not be verified.") ?? ""
          : "";
      if (action === "reject" && !rejectedReason.trim()) {
        setIsLoading(false);
        return;
      }

      const response = await fetch("/api/cosmic-admin/payment-action", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${adminToken}`,
        },
        body: JSON.stringify({ paymentId, action, rejectedReason }),
      });
      const data = await response.json();
      if (!response.ok) {
        setError(data.error ?? "Payment action failed.");
        return;
      }
      await loadDashboard();
    } catch {
      setError("Payment action API is not reachable.");
    } finally {
      setIsLoading(false);
    }
  }

  async function logout() {
    if (adminToken) {
      await fetch("/api/cosmic-admin/logout", {
        method: "POST",
        headers: { Authorization: `Bearer ${adminToken}` },
      });
    }
    setAdminToken("");
    setPendingToken("");
    setSecretKey("");
    setPassword("");
    setDashboard(null);
    setStage("credentials");
  }

  if (!isUnlocked) {
    return (
      <main className="grid min-h-screen place-items-center overflow-hidden bg-[#f7f8fb] px-4 text-slate-950">
        <div className="relative max-w-lg text-center">
          <div className="relative inline-flex items-center text-[clamp(5.5rem,18vw,11rem)] font-semibold leading-none tracking-tight text-slate-900">
            <span>40</span>
            <span className="relative">
              4
              <button
                aria-label="please check your internet connection and try again later"
                onClick={handleDotClick}
                className="absolute bottom-[21%] right-[22%] size-1.5 rounded-full bg-slate-300/70 shadow-[0_0_8px_rgba(148,163,184,0.55)] transition hover:bg-slate-400"
              />
            </span>
          </div>
          <h1 className="mt-4 text-2xl font-semibold tracking-tight text-slate-950">Page Not Found</h1>
          <p className="mx-auto mt-3 max-w-sm text-xs leading-5 text-slate-500">
            please check your internet connection and try again later
          </p>
          <div className="mx-auto mt-8 h-px w-36 bg-slate-200" />
        </div>
      </main>
    );
  }

  if (stage !== "dashboard") {
    return (
      <main className="grid min-h-screen place-items-center overflow-hidden bg-[#020713] px-4 py-8 text-white">
        <div className="pointer-events-none fixed inset-0 -z-0 bg-[radial-gradient(circle_at_20%_10%,rgba(6,182,212,0.22),transparent_32%),radial-gradient(circle_at_80%_0%,rgba(139,92,246,0.20),transparent_30%),linear-gradient(180deg,#020713,#050b18_50%,#020713)]" />
        <div className="pointer-events-none fixed inset-0 -z-0 bg-[linear-gradient(rgba(148,163,184,0.045)_1px,transparent_1px),linear-gradient(90deg,rgba(148,163,184,0.045)_1px,transparent_1px)] bg-[size:42px_42px]" />

        <section className="w-full max-w-md">
          <div className="mb-5 rounded-3xl border border-cyan-300/20 bg-[#091221]/90 p-5 shadow-[0_30px_120px_rgba(6,182,212,0.12)] backdrop-blur-xl">
            <div className="flex items-center gap-3">
              <span className="grid size-12 place-items-center rounded-2xl border border-cyan-300/25 bg-cyan-300/10 text-cyan-100 shadow-[0_0_45px_rgba(6,182,212,0.18)]">
                <ShieldCheck size={22} />
              </span>
              <div>
                <p className="text-xs uppercase tracking-[0.24em] text-cyan-200">Secure Gateway</p>
                <h1 className="text-2xl font-semibold tracking-tight">Admin Access</h1>
              </div>
            </div>
          </div>

          <div className="relative overflow-hidden rounded-3xl border border-cyan-300/15 bg-[#091221]/95 p-6 shadow-[0_30px_120px_rgba(6,182,212,0.10)]">
            <div className="pointer-events-none absolute inset-x-8 top-0 h-px bg-gradient-to-r from-transparent via-cyan-300 to-transparent" />
            <div className="flex items-center gap-3">
              <span className="grid size-11 place-items-center rounded-xl bg-cyan-300/10 text-cyan-100">
                {stage === "credentials" ? <Lock size={20} /> : <KeyRound size={20} />}
              </span>
              <div>
                <h2 className="text-xl font-semibold">{stage === "credentials" ? "Admin Login" : "Admin PIN"}</h2>
                <p className="text-sm text-slate-400">
                  {stage === "credentials" ? "Enter the admin username and password first." : "Enter the PIN to open the admin panel."}
                </p>
              </div>
            </div>

            {stage === "credentials" ? (
              <form onSubmit={handleCredentialSubmit} className="mt-6 space-y-4">
                <label className="block text-sm text-slate-300">
                  Username
                  <input
                    value={username}
                    onChange={(event) => setUsername(event.target.value)}
                    className="mt-2 h-11 w-full rounded-xl border border-white/10 bg-black/20 px-3 outline-none focus:border-cyan-300/60"
                    autoComplete="username"
                    required
                  />
                </label>
                <label className="block text-sm text-slate-300">
                  Password
                  <input
                    value={password}
                    onChange={(event) => setPassword(event.target.value)}
                    className="mt-2 h-11 w-full rounded-xl border border-white/10 bg-black/20 px-3 outline-none focus:border-cyan-300/60"
                    type="password"
                    autoComplete="current-password"
                    required
                  />
                </label>
                <button disabled={isLoading} className="h-11 w-full rounded-xl bg-cyan-300 font-semibold text-slate-950 shadow-[0_0_35px_rgba(6,182,212,0.22)] disabled:opacity-60">
                  {isLoading ? "Checking..." : "Continue to PIN"}
                </button>
              </form>
            ) : (
              <form onSubmit={handleSecretSubmit} className="mt-6 space-y-4">
                <label className="block text-sm text-slate-300">
                  PIN
                  <input
                    value={secretKey}
                    onChange={(event) => setSecretKey(event.target.value)}
                    className="mt-2 h-11 w-full rounded-xl border border-white/10 bg-black/20 px-3 text-center text-lg tracking-[0.35em] outline-none focus:border-cyan-300/60"
                    type="password"
                    inputMode="numeric"
                    autoComplete="one-time-code"
                    required
                  />
                </label>
                <button disabled={isLoading} className="h-11 w-full rounded-xl bg-cyan-300 font-semibold text-slate-950 shadow-[0_0_35px_rgba(6,182,212,0.22)] disabled:opacity-60">
                  {isLoading ? "Verifying..." : "Open Admin Panel"}
                </button>
              </form>
            )}

            {error ? (
              <p className="mt-4 rounded-xl border border-red-400/25 bg-red-400/10 px-3 py-2 text-sm text-red-100">
                {error}
              </p>
            ) : null}

            <p className="mt-5 text-xs leading-5 text-slate-500">
              Session token stays in memory only. Refreshing this page signs the admin out.
            </p>
          </div>
        </section>
      </main>
    );
  }

  return (
    <main className="min-h-screen overflow-hidden bg-[#020713] px-4 py-8 text-white sm:px-6">
      <div className="pointer-events-none fixed inset-0 -z-0 bg-[radial-gradient(circle_at_18%_8%,rgba(6,182,212,0.20),transparent_28%),radial-gradient(circle_at_82%_12%,rgba(139,92,246,0.18),transparent_30%),linear-gradient(180deg,#020713,#050b18_45%,#020713)]" />
      <div className="pointer-events-none fixed inset-0 -z-0 bg-[linear-gradient(rgba(148,163,184,0.04)_1px,transparent_1px),linear-gradient(90deg,rgba(148,163,184,0.04)_1px,transparent_1px)] bg-[size:44px_44px]" />
      <section className="mx-auto max-w-7xl">
        <div className="relative mb-6 overflow-hidden rounded-3xl border border-cyan-300/20 bg-[linear-gradient(135deg,rgba(9,18,33,0.96),rgba(3,7,18,0.82))] p-5 shadow-[0_30px_120px_rgba(6,182,212,0.10)]">
          <div className="pointer-events-none absolute inset-x-10 top-0 h-px bg-gradient-to-r from-transparent via-cyan-200 to-transparent" />
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex items-center gap-3">
              <span className="grid size-12 place-items-center rounded-2xl border border-cyan-300/25 bg-cyan-300/10 text-cyan-100 shadow-[0_0_45px_rgba(6,182,212,0.18)]">
                <ShieldCheck size={22} />
              </span>
              <div>
                <p className="text-sm uppercase tracking-[0.24em] text-cyan-200">Cosmic Admin</p>
                <h1 className="text-3xl font-semibold tracking-tight">Detox AI Command Nexus</h1>
                <p className="mt-1 text-sm text-slate-400">Live control for users, plans, maintenance, safety, and revenue.</p>
              </div>
            </div>
            {stage === "dashboard" ? (
              <button onClick={logout} className="inline-flex h-10 items-center gap-2 rounded-xl border border-white/10 bg-white/5 px-4 text-sm text-slate-200 hover:bg-white/10">
                <LogOut size={16} />
                End Session
              </button>
            ) : null}
          </div>
        </div>

        {error ? (
          <div className="mb-5 rounded-2xl border border-red-400/25 bg-red-400/10 px-4 py-3 text-sm text-red-100">
            {error}
          </div>
        ) : null}

        {dashboard ? (
          <div className="grid gap-5 lg:grid-cols-[280px_1fr]">
            <aside className="sticky top-6 h-fit rounded-3xl border border-white/10 bg-[#091221]/88 p-4 shadow-[0_24px_90px_rgba(0,0,0,0.25)] backdrop-blur-xl">
              <div className="rounded-2xl border border-amber-300/25 bg-[linear-gradient(135deg,rgba(250,204,21,0.14),rgba(6,182,212,0.08))] p-4">
                <p className="font-semibold text-amber-100">Creator Admin</p>
                <p className="mt-1 text-xs text-slate-400">{dashboard.admin}</p>
                <p className="mt-3 text-xs text-amber-100">Session expires on refresh or timeout.</p>
              </div>
              <nav className="mt-4 grid gap-1 text-sm text-slate-300">
                {["Overview", "Users", "Maintenance", "Payments", "Revenue", "Plans & Limits", "Models", "AI Tools", "Chats", "Reports", "API Usage", "Announcements", "Support", "Security", "Audit Logs", "App Settings"].map((item) => (
                  <a key={item} href={`#${item.toLowerCase().replaceAll(" ", "-").replaceAll("&", "and")}`} className="rounded-xl border border-transparent px-3 py-2 hover:border-cyan-300/15 hover:bg-cyan-300/8 hover:text-cyan-50">
                    {item}
                  </a>
                ))}
              </nav>
            </aside>

            <section className="min-w-0">
              <div id="overview" className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
                {dashboard.overviewStats.map(([label, value], index) => {
                  const icons = [Users, BarChart3, CreditCard, Database, Eye, Sparkles];
                  const Icon = icons[index % icons.length];
                  return (
                    <article key={label} className="relative overflow-hidden rounded-2xl border border-white/10 bg-[linear-gradient(180deg,rgba(9,18,33,0.95),rgba(3,7,18,0.88))] p-4 shadow-[0_20px_70px_rgba(0,0,0,0.24)]">
                      <div className="pointer-events-none absolute inset-x-6 top-0 h-px bg-gradient-to-r from-transparent via-cyan-300/70 to-transparent" />
                      <Icon size={18} className="text-cyan-100" />
                      <p className="mt-3 text-sm text-slate-400">{label}</p>
                      <p className="mt-1 text-2xl font-semibold text-white">{value}</p>
                    </article>
                  );
                })}
              </div>

              <div className="mt-5 grid gap-4 xl:grid-cols-3">
                {dashboard.notices.map((notice) => (
                  <div key={notice} className="rounded-2xl border border-cyan-300/15 bg-cyan-300/8 p-4 text-sm leading-6 text-cyan-50 shadow-[0_16px_60px_rgba(6,182,212,0.08)]">
                    {notice}
                  </div>
                ))}
              </div>

              <article id="users" className="mt-5 overflow-hidden rounded-3xl border border-white/10 bg-[#091221]/92 p-5 shadow-[0_26px_100px_rgba(0,0,0,0.25)]">
                <div className="pointer-events-none -mx-5 -mt-5 mb-5 h-1 bg-gradient-to-r from-cyan-300 via-blue-500 to-violet-400" />
                <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                  <div>
                    <h3 className="text-lg font-semibold text-white">Users</h3>
                    <p className="mt-1 text-sm text-slate-400">View real users from Firestore and control account access.</p>
                  </div>
                  <button onClick={() => loadDashboard()} className="h-10 rounded-xl border border-cyan-300/20 bg-cyan-300/8 px-4 text-sm text-cyan-100 hover:bg-cyan-300/12">
                    Refresh
                  </button>
                </div>

                <div className="mt-5 overflow-x-auto">
                  <table className="w-full min-w-[850px] text-left text-sm">
                    <thead className="text-xs uppercase tracking-[0.14em] text-slate-500">
                      <tr>
                        <th className="py-3 pr-4">Name</th>
                        <th className="py-3 pr-4">Email</th>
                        <th className="py-3 pr-4">Plan</th>
                        <th className="py-3 pr-4">Role</th>
                        <th className="py-3 pr-4">Chats</th>
                        <th className="py-3 pr-4">Messages</th>
                        <th className="py-3 pr-4">Status</th>
                        <th className="py-3 pr-4">Last Active</th>
                        <th className="py-3 pr-4">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-white/10">
                      {dashboard.users.length ? (
                        dashboard.users.map((user) => (
                          <tr key={user.uid} className="text-slate-300">
                            <td className="py-3 pr-4 font-medium text-white">{user.name}</td>
                            <td className="py-3 pr-4">{user.email}</td>
                            <td className="py-3 pr-4 capitalize">{user.plan}</td>
                            <td className="py-3 pr-4 capitalize">{user.role}</td>
                            <td className="py-3 pr-4">{user.chatCount}</td>
                            <td className="py-3 pr-4">{user.totalMessages}</td>
                            <td className="py-3 pr-4">
                              <span className={`rounded-full px-2.5 py-1 text-xs ${user.blockedPermanently || user.isBanned ? "bg-red-400/10 text-red-100" : "bg-emerald-300/10 text-emerald-100"}`}>
                                {user.blockedPermanently ? "Blocked" : user.isBanned ? "Banned" : "Active"}
                              </span>
                            </td>
                            <td className="py-3 pr-4">{user.lastActive}</td>
                            <td className="py-3 pr-4">
                              <div className="flex flex-wrap gap-2">
                                <button onClick={() => runUserAction(user.uid, "ban")} disabled={isLoading} className="rounded-lg border border-amber-300/20 px-2 py-1 text-xs text-amber-100 hover:bg-amber-300/10">
                                  Ban
                                </button>
                                <button onClick={() => runUserAction(user.uid, "unban")} disabled={isLoading} className="rounded-lg border border-emerald-300/20 px-2 py-1 text-xs text-emerald-100 hover:bg-emerald-300/10">
                                  Unban
                                </button>
                                <button onClick={() => runUserAction(user.uid, "block")} disabled={isLoading} className="rounded-lg border border-red-300/20 px-2 py-1 text-xs text-red-100 hover:bg-red-300/10">
                                  Permanent Block
                                </button>
                              </div>
                            </td>
                          </tr>
                        ))
                      ) : (
                        <tr>
                          <td colSpan={9} className="py-8 text-center text-slate-500">
                            No real users found yet. Users appear here after they sign in.
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </article>

              <article id="maintenance" className="mt-5 overflow-hidden rounded-3xl border border-white/10 bg-[linear-gradient(135deg,rgba(9,18,33,0.95),rgba(3,7,18,0.88))] p-5 shadow-[0_26px_100px_rgba(0,0,0,0.25)]">
                <div className="pointer-events-none -mx-5 -mt-5 mb-5 h-1 bg-gradient-to-r from-amber-200 via-cyan-300 to-emerald-300" />
                <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
                  <div>
                    <h3 className="text-lg font-semibold text-white">Maintenance Mode</h3>
                    <p className="mt-1 text-sm text-slate-400">
                      When enabled, normal users cannot use AI models. Creator access still works.
                    </p>
                    <p className={`mt-3 inline-flex rounded-full px-3 py-1 text-xs font-semibold ${dashboard.maintenance.maintenanceMode ? "bg-amber-300/15 text-amber-100" : "bg-emerald-300/10 text-emerald-100"}`}>
                      {dashboard.maintenance.maintenanceMode ? "Maintenance is ON" : "Maintenance is OFF"}
                    </p>
                  </div>
                  <div className="w-full max-w-xl">
                    <textarea
                      value={maintenanceMessage}
                      onChange={(event) => setMaintenanceMessage(event.target.value)}
                      className="h-20 w-full resize-none rounded-xl border border-white/10 bg-black/20 p-3 text-sm text-white outline-none focus:border-cyan-300/60"
                    />
                    <div className="mt-3 flex gap-2">
                      <button onClick={() => updateMaintenance(true)} disabled={isLoading} className="h-10 flex-1 rounded-xl bg-amber-200 text-sm font-semibold text-amber-950 disabled:opacity-60">
                        Turn On
                      </button>
                      <button onClick={() => updateMaintenance(false)} disabled={isLoading} className="h-10 flex-1 rounded-xl bg-emerald-300 text-sm font-semibold text-emerald-950 disabled:opacity-60">
                        Turn Off
                      </button>
                    </div>
                  </div>
                </div>
              </article>

              <article id="payments" className="mt-5 overflow-hidden rounded-3xl border border-white/10 bg-[#091221]/92 p-5 shadow-[0_26px_100px_rgba(0,0,0,0.25)]">
                <div className="pointer-events-none -mx-5 -mt-5 mb-5 h-1 bg-gradient-to-r from-violet-300 via-cyan-300 to-emerald-300" />
                <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                  <div>
                    <h3 className="text-lg font-semibold text-white">Payment Requests</h3>
                    <p className="mt-1 text-sm text-slate-400">Review screenshots, approve real payments, or reject unclear requests.</p>
                  </div>
                  <button onClick={() => loadDashboard()} className="h-10 rounded-xl border border-cyan-300/20 bg-cyan-300/8 px-4 text-sm text-cyan-100 hover:bg-cyan-300/12">
                    Refresh
                  </button>
                </div>

                <div className="mt-5 overflow-x-auto">
                  <table className="w-full min-w-[900px] text-left text-sm">
                    <thead className="text-xs uppercase tracking-[0.14em] text-slate-500">
                      <tr>
                        <th className="py-3 pr-4">User</th>
                        <th className="py-3 pr-4">Plan</th>
                        <th className="py-3 pr-4">Amount</th>
                        <th className="py-3 pr-4">Transaction ID</th>
                        <th className="py-3 pr-4">Screenshot</th>
                        <th className="py-3 pr-4">Submitted</th>
                        <th className="py-3 pr-4">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-white/10">
                      {dashboard.payments.length ? (
                        dashboard.payments.map((payment) => (
                          <tr key={payment.paymentId} className="text-slate-300">
                            <td className="py-3 pr-4">{payment.userEmail}</td>
                            <td className="py-3 pr-4 capitalize">
                              {payment.plan} <span className="text-xs text-slate-500">({payment.billingCycle})</span>
                            </td>
                            <td className="py-3 pr-4">₹{payment.amount.toLocaleString("en-IN")}</td>
                            <td className="py-3 pr-4 font-mono text-xs">{payment.transactionId}</td>
                            <td className="py-3 pr-4">
                              {payment.screenshotUrl ? (
                                <a href={payment.screenshotUrl} target="_blank" rel="noreferrer" className="rounded-lg border border-cyan-300/20 px-2 py-1 text-xs text-cyan-100 hover:bg-cyan-300/10">
                                  Open screenshot
                                </a>
                              ) : (
                                <span className="text-slate-500">No screenshot</span>
                              )}
                            </td>
                            <td className="py-3 pr-4">{payment.createdAt}</td>
                            <td className="py-3 pr-4">
                              <div className="flex flex-wrap gap-2">
                                <button onClick={() => runPaymentAction(payment.paymentId, "approve")} disabled={isLoading} className="rounded-lg bg-emerald-300 px-2 py-1 text-xs font-semibold text-emerald-950 disabled:opacity-60">
                                  Approve
                                </button>
                                <button onClick={() => runPaymentAction(payment.paymentId, "reject")} disabled={isLoading} className="rounded-lg border border-red-300/20 px-2 py-1 text-xs text-red-100 hover:bg-red-300/10 disabled:opacity-60">
                                  Reject
                                </button>
                              </div>
                            </td>
                          </tr>
                        ))
                      ) : (
                        <tr>
                          <td colSpan={7} className="py-8 text-center text-slate-500">
                            No pending payment requests yet. Requests appear here after users upload screenshots.
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </article>

              <div className="mt-5 grid gap-4 xl:grid-cols-2">
                {dashboard.sections.map((section) => (
                  <article key={section.title} id={section.title.toLowerCase().replaceAll(" ", "-").replaceAll("&", "and")} className="relative overflow-hidden rounded-3xl border border-white/10 bg-[#091221]/88 p-5 shadow-[0_20px_80px_rgba(0,0,0,0.18)]">
                    <div className="pointer-events-none absolute inset-x-8 top-0 h-px bg-gradient-to-r from-transparent via-violet-300/60 to-transparent" />
                    <h3 className="text-lg font-semibold text-white">{section.title}</h3>
                    <div className="mt-4 flex flex-wrap gap-2">
                      {section.items.map((item) => (
                        <span key={item} className="rounded-full border border-white/10 bg-white/5 px-3 py-1.5 text-xs text-slate-300">
                          {item}
                        </span>
                      ))}
                    </div>
                    <div className="mt-5 rounded-xl border border-white/10 bg-black/20 p-3 text-sm text-slate-400">
                      Server route protection is required before any real mutation in this module.
                    </div>
                  </article>
                ))}
              </div>
            </section>
          </div>
        ) : null}
      </section>
    </main>
  );
}
