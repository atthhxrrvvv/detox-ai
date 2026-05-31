import Link from "next/link";
import { Check, Crown, Rocket, Shield, Sparkles, Zap } from "lucide-react";
import { formatRupees } from "@/lib/utils";

const plans = [
  {
    id: "lite",
    name: "Lite",
    badge: "Starter",
    monthly: 299,
    yearly: 2999,
    effective: 250,
    icon: Sparkles,
    cta: "Start Lite",
    href: "/payment?plan=lite",
    bestFor: "Basic serious users",
    features: ["70 messages/day", "1,800 messages/month", "3 files/month", "All free models", "Limited Cosmo 1.2"],
  },
  {
    id: "go",
    name: "Go",
    badge: "Popular",
    monthly: 599,
    yearly: 5999,
    effective: 500,
    icon: Zap,
    cta: "Choose Go",
    href: "/payment?plan=go",
    popular: true,
    bestFor: "Daily users",
    features: ["150 messages/day", "4,500 messages/month", "15 files/month", "Free models + Cosmo 1.2 + Gamma 2.0"],
  },
  {
    id: "pro",
    name: "Pro",
    badge: "Best Value",
    monthly: 1199,
    yearly: 11999,
    effective: 1000,
    icon: Crown,
    cta: "Upgrade to Pro",
    href: "/payment?plan=pro",
    featured: true,
    bestFor: "Students + coders",
    features: ["400 messages/day", "12,000 messages/month", "75 files/month", "Everything in Go", "Orion 2.9, Mentor 3.0, Lyra 3.2"],
  },
  {
    id: "premium",
    name: "Premium",
    badge: "Creator Choice",
    monthly: 2499,
    yearly: 24999,
    effective: 2083,
    icon: Shield,
    cta: "Go Premium",
    href: "/payment?plan=premium",
    creator: true,
    bestFor: "Creators + builders",
    features: ["900 messages/day", "30,000 messages/month", "300 files/month", "Everything in Pro", "Penton 4.4, Sentinel 2.7, Prism 3.8"],
  },
  {
    id: "ultimate",
    name: "Ultimate",
    badge: "Max Power",
    monthly: 4999,
    yearly: 49999,
    effective: 4166,
    icon: Rocket,
    cta: "Unlock Ultimate",
    href: "/payment?plan=ultimate",
    bestFor: "Heavy users + teams",
    features: ["2,000 messages/day", "75,000 messages/month", "1,000 files/month", "Everything in Premium", "Titan 5.0, Atlas 4.0, future models"],
  },
];

export function PricingGrid() {
  return (
    <div className="grid gap-4 lg:grid-cols-5">
      {plans.map((plan) => {
        const Icon = plan.icon;
        return (
          <article
            key={plan.id}
            className={`glass flex rounded-2xl p-5 transition hover:-translate-y-1 ${
              plan.featured ? "glow-border lg:scale-[1.03]" : ""
            }`}
          >
            <div className="flex w-full flex-col">
              <div className="flex items-start justify-between gap-3">
                <span className="grid size-11 place-items-center rounded-xl bg-white/8 text-cyan-100">
                  <Icon size={20} />
                </span>
                <span
                  className={`rounded-full px-3 py-1 text-xs font-semibold ${
                    plan.featured
                      ? "bg-amber-300/15 text-amber-100"
                      : plan.popular
                        ? "bg-cyan-300/10 text-cyan-100"
                        : "bg-white/8 text-slate-300"
                  }`}
                >
                  {plan.badge}
                </span>
              </div>
              <h3 className="mt-5 text-2xl font-semibold text-white">{plan.name}</h3>
              <p className="mt-1 text-sm text-slate-400">{plan.bestFor}</p>
              <p className="mt-5 text-3xl font-semibold text-white">
                {formatRupees(plan.monthly)}
                <span className="text-sm font-normal text-slate-400">/mo</span>
              </p>
              <p className="mt-2 text-xs text-slate-500">
                {formatRupees(plan.yearly)}/year, about {formatRupees(plan.effective)}/month
              </p>
              <div className="mt-5 grid gap-3">
                {plan.features.map((feature) => (
                  <p key={feature} className="flex items-start gap-2 text-sm leading-5 text-slate-300">
                    <Check className="mt-0.5 shrink-0 text-emerald-300" size={15} />
                    {feature}
                  </p>
                ))}
              </div>
              <Link
                href={plan.href}
                className={`mt-auto inline-flex h-11 w-full items-center justify-center rounded-xl text-sm font-semibold transition ${
                  plan.featured
                    ? "bg-gradient-to-r from-amber-200 to-cyan-200 text-slate-950 hover:brightness-110"
                    : "bg-white text-slate-950 hover:bg-cyan-100"
                }`}
              >
                {plan.cta}
              </Link>
            </div>
          </article>
        );
      })}
    </div>
  );
}
