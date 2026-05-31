import { Lock, Sparkles } from "lucide-react";
import type { DetoxModel } from "@/lib/models";

export function ModelCard({ model }: { model: DetoxModel }) {
  const locked = model.access !== "free";

  return (
    <article className="glass rounded-2xl p-5 transition hover:-translate-y-1 hover:border-cyan-300/35">
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-center gap-3">
          <span className="grid size-11 place-items-center rounded-xl bg-white/8 text-2xl">{model.emoji}</span>
          <div>
            <h3 className="font-semibold text-white">{model.displayName}</h3>
            <p className="text-xs uppercase tracking-[0.2em] text-cyan-200">{model.category}</p>
          </div>
        </div>
        <span className="inline-flex items-center gap-1 rounded-full border border-white/10 px-2.5 py-1 text-xs capitalize text-slate-300">
          {locked ? <Lock size={12} /> : <Sparkles size={12} />}
          {model.access}
        </span>
      </div>
      <p className="mt-4 min-h-12 text-sm leading-6 text-slate-400">{model.description}</p>
      <div className="mt-5 flex items-center justify-between text-xs text-slate-500">
        <span>Detox private engine</span>
        <span>{model.maxTokens.toLocaleString()} output tokens</span>
      </div>
    </article>
  );
}
