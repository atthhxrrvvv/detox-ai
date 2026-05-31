import { BarChart3, History, MessageSquare, Sparkles } from "lucide-react";
import { PageShell } from "@/components/PageShell";

const cards = [
  ["Current Plan", "Free", Sparkles],
  ["Daily Messages", "0 / 30", MessageSquare],
  ["Monthly Messages", "0 / 600", BarChart3],
  ["Saved Chats", "0", History],
] as const;

export default function DashboardPage() {
  return (
    <PageShell eyebrow="Dashboard" title="Your Detox AI control room" description="Track plan access, usage, saved chats, files, and upgrades from one responsive dashboard.">
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {cards.map(([label, value, Icon]) => (
          <article key={label} className="glass rounded-2xl p-5">
            <Icon className="text-cyan-100" size={20} />
            <p className="mt-4 text-sm text-slate-400">{label}</p>
            <p className="mt-1 text-2xl font-semibold text-white">{value}</p>
          </article>
        ))}
      </div>
    </PageShell>
  );
}

