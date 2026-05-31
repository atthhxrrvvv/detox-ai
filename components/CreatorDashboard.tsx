import { BarChart3, CreditCard, Crown, Database, MessageSquareWarning, Settings, ShieldCheck, Users } from "lucide-react";
import { CREATOR_EMAIL } from "@/lib/constants";
import { formatRupees } from "@/lib/utils";

const stats = [
  ["Total Users", "1,248", Users],
  ["Pro Users", "186", Crown],
  ["Premium Users", "74", ShieldCheck],
  ["Total Chats", "18,420", Database],
  ["Messages Today", "2,931", BarChart3],
  ["Revenue This Month", formatRupees(78900), CreditCard],
  ["Pending Payments", "12", CreditCard],
  ["Reported Chats", "3", MessageSquareWarning],
] as const;

const sections = ["Overview", "Users", "Revenue", "Payments", "Plans", "Models", "Chats", "Reports", "API Usage", "Announcements", "Settings", "Logs"];

export function CreatorDashboard({ title = "Creator Overview" }: { title?: string }) {
  return (
    <div className="grid gap-5 lg:grid-cols-[240px_1fr]">
      <aside className="glass rounded-2xl p-4">
        <div className="rounded-xl border border-amber-300/25 bg-amber-300/10 p-4">
          <p className="flex items-center gap-2 font-semibold text-amber-100">
            <Crown size={17} />
            Creator
          </p>
          <p className="mt-1 text-xs text-slate-400">{CREATOR_EMAIL}</p>
          <p className="mt-3 text-sm text-amber-100">Unlimited Access</p>
        </div>
        <nav className="mt-4 grid gap-1">
          {sections.map((section) => (
            <a key={section} href={`/creator${section === "Overview" ? "" : `/${section.toLowerCase().replaceAll(" ", "-")}`}`} className="rounded-xl px-3 py-2 text-sm text-slate-300 hover:bg-white/8">
              {section}
            </a>
          ))}
        </nav>
      </aside>

      <section>
        <div className="glass rounded-2xl p-5">
          <div className="flex flex-col justify-between gap-3 sm:flex-row sm:items-center">
            <div>
              <h2 className="text-2xl font-semibold text-white">{title}</h2>
              <p className="mt-1 text-sm text-slate-400">Creator-only control center with audit logging for sensitive actions.</p>
            </div>
            <button className="inline-flex h-10 items-center gap-2 rounded-xl bg-white px-4 text-sm font-semibold text-slate-950">
              <Settings size={16} />
              App Settings
            </button>
          </div>
        </div>
        <div className="mt-5 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          {stats.map(([label, value, Icon]) => (
            <article key={label} className="glass rounded-2xl p-5">
              <Icon className="text-cyan-100" size={20} />
              <p className="mt-4 text-sm text-slate-400">{label}</p>
              <p className="mt-1 text-2xl font-semibold text-white">{value}</p>
            </article>
          ))}
        </div>
        <div className="mt-5 grid gap-4 xl:grid-cols-2">
          <div className="glass rounded-2xl p-5">
            <h3 className="font-semibold text-white">Pending payment approvals</h3>
            <div className="mt-4 grid gap-3">
              {["TXN8841 - Go - ₹599", "TXN8842 - Pro - ₹1,199", "TXN8843 - Premium - ₹2,499"].map((item) => (
                <div key={item} className="flex items-center justify-between rounded-xl border border-white/10 bg-white/5 p-3 text-sm text-slate-300">
                  <span>{item}</span>
                  <button className="rounded-lg bg-emerald-300 px-3 py-1.5 font-semibold text-emerald-950">Approve</button>
                </div>
              ))}
            </div>
          </div>
          <div className="glass rounded-2xl p-5">
            <h3 className="font-semibold text-white">Privacy notice</h3>
            <p className="mt-3 text-sm leading-6 text-slate-400">
              Authorized creator/admin accounts may review chats only for moderation, safety, abuse prevention, support, legal compliance, or service improvement. Chat views should be logged in admin_logs.
            </p>
          </div>
        </div>
      </section>
    </div>
  );
}
