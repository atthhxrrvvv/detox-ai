import { PageShell } from "@/components/PageShell";

export default function CreatorChatsPage() {
  return (
    <PageShell eyebrow="Creator" title="Chat moderation and support" description="Authorized chat review is for moderation, support, abuse prevention, safety, legal compliance, and service improvement only. Every view should be logged.">
      <div className="glass rounded-2xl p-6">
        <input className="h-11 w-full rounded-xl border border-white/10 bg-black/20 px-3 outline-none focus:border-cyan-300/60" placeholder="Search by user email or reported chat" />
        <div className="mt-5 rounded-xl border border-white/10 bg-white/5 p-4 text-sm text-slate-400">No reported chats in this demo state.</div>
      </div>
    </PageShell>
  );
}

