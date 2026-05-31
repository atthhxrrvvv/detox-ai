import { PageShell } from "@/components/PageShell";
import { PLAN_LIMITS } from "@/lib/limits";

export default function CreatorLimitsPage() {
  return (
    <PageShell eyebrow="Creator" title="Plan limits manager" description="Edit daily limits, monthly limits, input character limits, allowed models, and upload caps.">
      <div className="grid gap-4 md:grid-cols-3">
        {Object.entries(PLAN_LIMITS).map(([plan, limits]) => (
          <article key={plan} className="glass rounded-2xl p-5">
            <h2 className="text-xl font-semibold capitalize text-white">{plan}</h2>
            <p className="mt-4 text-sm text-slate-400">Daily: {String(limits.dailyMessages)}</p>
            <p className="mt-2 text-sm text-slate-400">Monthly: {String(limits.monthlyMessages)}</p>
            <p className="mt-2 text-sm text-slate-400">Input chars: {String(limits.maxInputChars)}</p>
            <p className="mt-2 text-sm text-slate-400">Uploads: {String(limits.fileUploadsPerMonth)}</p>
          </article>
        ))}
      </div>
    </PageShell>
  );
}

