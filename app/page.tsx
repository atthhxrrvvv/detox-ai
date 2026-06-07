import Link from "next/link";
import {
  ArrowRight,
  BookOpen,
  BrainCircuit,
  Code2,
  Crown,
  Gauge,
  Layers3,
  PenLine,
  ShieldCheck,
  Sparkles,
  TerminalSquare,
  Wand2,
} from "lucide-react";
import { AppLogo } from "@/components/AppLogo";
import { AuthRedirect } from "@/components/AuthRedirect";
import { Footer } from "@/components/Footer";
import { FavoriteTools } from "@/components/FavoriteTools";
import { Hero3DBackground } from "@/components/Hero3DBackground";
import { LearningPaths } from "@/components/LearningPaths";
import { ModelCard } from "@/components/ModelCard";
import { PricingGrid } from "@/components/PricingGrid";
import { SiteNav } from "@/components/SiteNav";
import { DETOX_MODELS } from "@/lib/models";

const heroStats = [
  ["11+", "task models"],
  ["0.50-2.00", "thinking control"],
  ["Private", "AI workspace"],
] as const;

const featureBands = [
  ["Instant answers", "Flash, Nova, and fast chat modes for clean everyday help.", Gauge],
  ["Study workspace", "Scholar, Mentor, notes, summaries, MCQs, and exam prep.", BookOpen],
  ["Code builder", "Orion and Titan help plan, debug, and structure serious builds.", TerminalSquare],
  ["Writing studio", "Echo and Lyra polish emails, captions, scripts, and long-form content.", PenLine],
  ["Creative engine", "Spark and Prism generate ideas, design systems, and brand direction.", Wand2],
  ["Reliable workspace", "A clean account, chat, tools, pricing, and profile experience focused on users.", ShieldCheck],
] as const;

const workflow = [
  ["Choose", "Pick a Detox model built for the task."],
  ["Tune", "Set response temperature from calm to extreme thinking."],
  ["Create", "Chat, code, study, write, plan, and save work."],
  ["Continue", "Return to your workspace whenever you need focused help."],
] as const;

export default function Home() {
  const showcaseModels = DETOX_MODELS.slice(0, 8);

  return (
    <>
      <AuthRedirect />
      <SiteNav />
      <main>
        <section className="premium-hero relative isolate overflow-hidden px-4 sm:px-6">
          <Hero3DBackground />
          <div className="hero-grid absolute inset-0 z-[1]" />
          <div className="hero-aurora absolute inset-0 z-[2]" />
          <div className="hero-particles absolute inset-0 z-[3]" />

          <div className="relative z-10 mx-auto flex min-h-[calc(100svh-4rem)] max-w-7xl flex-col justify-center py-16 lg:py-20">
            <div className="grid gap-10 lg:grid-cols-[1fr_0.95fr] lg:items-center">
              <div className="max-w-4xl">
                <div className="inline-flex items-center gap-2 rounded-full border border-cyan-300/25 bg-cyan-300/10 px-3 py-1.5 text-sm text-cyan-50 shadow-[0_0_45px_rgba(6,182,212,0.12)] backdrop-blur-xl">
                  <Sparkles size={15} />
                  Premium AI workspace for creators, coders, and students
                </div>
                <h1 className="mt-7 max-w-5xl text-5xl font-semibold leading-[1.02] text-white sm:text-7xl lg:text-8xl">
                  Meet Detox AI
                </h1>
                <p className="mt-6 max-w-3xl text-lg leading-8 text-slate-300 sm:text-xl">
                  A futuristic AI command workspace for chatting, coding, studying, writing, building, and getting focused help in one place.
                </p>
                <div className="mt-8 flex flex-col gap-3 sm:flex-row">
                  <Link href="/login" className="inline-flex h-12 items-center justify-center gap-2 rounded-full bg-white px-6 text-sm font-semibold text-slate-950 shadow-[0_0_55px_rgba(255,255,255,0.12)] transition hover:bg-cyan-100">
                    Start Using Detox AI
                    <ArrowRight size={16} />
                  </Link>
                  <Link href="#models" className="inline-flex h-12 items-center justify-center rounded-full border border-cyan-300/20 bg-cyan-300/8 px-6 text-sm font-semibold text-cyan-50 transition hover:bg-cyan-300/12">
                    Explore Models
                  </Link>
                  <Link href="/pricing" className="inline-flex h-12 items-center justify-center gap-2 rounded-full border border-amber-300/35 bg-amber-300/10 px-6 text-sm font-semibold text-amber-100 transition hover:bg-amber-300/15">
                    <Crown size={16} />
                    Upgrade to Premium
                  </Link>
                </div>

                <div className="mt-10 grid max-w-3xl gap-3 sm:grid-cols-3">
                  {heroStats.map(([value, label]) => (
                    <div key={label} className="rounded-2xl border border-white/10 bg-white/[0.045] p-4 backdrop-blur-xl">
                      <p className="text-2xl font-semibold text-white">{value}</p>
                      <p className="mt-1 text-xs uppercase tracking-[0.18em] text-slate-500">{label}</p>
                    </div>
                  ))}
                </div>
              </div>

              <div className="relative min-h-[560px] lg:min-h-[640px]">
                <div className="absolute inset-x-10 top-0 h-72 rounded-[2rem] border border-cyan-300/10 bg-[linear-gradient(180deg,rgba(6,182,212,0.12),transparent)] blur-2xl" />
                <div className="absolute left-1/2 top-10 z-10 -translate-x-1/2">
                  <AppLogo size={250} className="rounded-[2rem] shadow-[0_0_120px_rgba(217,211,106,0.16)]" />
                </div>

                <div className="absolute inset-x-0 bottom-10 z-20 rounded-[1.75rem] border border-white/12 bg-[#091221]/88 p-5 shadow-[0_35px_120px_rgba(0,0,0,0.42)] backdrop-blur-2xl">
                  <div className="flex items-center justify-between gap-3 border-b border-white/10 pb-4">
                    <div className="flex items-center gap-3">
                      <AppLogo size={44} className="rounded-xl" />
                      <div>
                        <p className="font-semibold text-white">Detox AI Live Preview</p>
                        <p className="text-xs text-slate-400">Penton is multitasking...</p>
                      </div>
                    </div>
                    <span className="rounded-full bg-amber-300/15 px-3 py-1 text-xs font-semibold text-amber-100">Premium</span>
                  </div>

                  <div className="mt-5 grid gap-3">
                    <div className="ml-auto max-w-[84%] rounded-2xl bg-cyan-300 px-4 py-3 text-sm text-slate-950">
                      Plan a premium AI app with payments, models, and a polished user experience.
                    </div>
                    <div className="max-w-[92%] rounded-2xl border border-white/10 bg-white/8 px-4 py-3 text-sm leading-6 text-slate-200">
                      I will map the product, access checks, Firestore data, UPI flow, AI tools, and mobile-first interface.
                    </div>
                  </div>

                  <div className="mt-5 overflow-hidden rounded-2xl border border-white/10 bg-[#020713]/80">
                    <div className="flex items-center justify-between border-b border-white/10 px-4 py-2 text-xs text-slate-500">
                      <span>detox.workspace.ts</span>
                      <span className="text-cyan-200">live</span>
                    </div>
                    <pre className="overflow-x-auto p-4 text-xs leading-6 text-slate-300">
                      <code>{`model.select("Penton 4.4")
temperature.set(1.35)
workspace.build({
  chat: "premium",
  tools: "active",
  privacy: "focused"
})`}</code>
                    </pre>
                  </div>

                  <div className="mt-5 grid grid-cols-4 gap-2">
                    {["Flash", "Scholar", "Orion", "Penton"].map((model) => (
                      <div key={model} className="rounded-xl border border-white/10 bg-black/24 p-3 text-center text-xs text-slate-300">{model}</div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        <section className="px-4 py-16 sm:px-6">
          <div className="mx-auto max-w-7xl">
            <div className="grid gap-4 lg:grid-cols-4">
              {workflow.map(([title, description], index) => (
                <article key={title} className="relative overflow-hidden rounded-3xl border border-white/10 bg-[#091221]/76 p-5 shadow-[0_20px_80px_rgba(0,0,0,0.22)]">
                  <div className="absolute inset-x-8 top-0 h-px bg-gradient-to-r from-transparent via-cyan-300/70 to-transparent" />
                  <p className="text-sm font-semibold text-cyan-100">0{index + 1}</p>
                  <h2 className="mt-4 text-xl font-semibold text-white">{title}</h2>
                  <p className="mt-2 text-sm leading-6 text-slate-400">{description}</p>
                </article>
              ))}
            </div>
          </div>
        </section>

        <FavoriteTools />

        <LearningPaths />

        <section id="models" className="px-4 py-16 sm:px-6">
          <div className="mx-auto max-w-7xl">
            <div className="flex flex-col justify-between gap-4 lg:flex-row lg:items-end">
              <div className="max-w-2xl">
                <p className="text-sm font-semibold uppercase tracking-[0.25em] text-cyan-200">Model Showcase</p>
                <h2 className="mt-3 text-3xl font-semibold text-white sm:text-5xl">Custom Detox AI model lineup</h2>
              </div>
              <Link href="/chat" className="inline-flex h-11 items-center justify-center gap-2 rounded-full border border-white/10 px-5 text-sm font-semibold text-white hover:bg-white/8">
                Try models
                <ArrowRight size={15} />
              </Link>
            </div>
            <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
              {showcaseModels.map((model) => (
                <ModelCard key={model.id} model={model} />
              ))}
            </div>
          </div>
        </section>

        <section className="px-4 py-16 sm:px-6">
          <div className="mx-auto max-w-7xl">
            <div className="mb-8 max-w-2xl">
              <p className="text-sm font-semibold uppercase tracking-[0.25em] text-cyan-200">Workspace Power</p>
              <h2 className="mt-3 text-3xl font-semibold text-white sm:text-5xl">Everything feels like one clean AI control room</h2>
            </div>
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {featureBands.map(([title, description, Icon]) => (
                <article key={title} className="group relative overflow-hidden rounded-3xl border border-white/10 bg-[linear-gradient(180deg,rgba(9,18,33,0.88),rgba(3,7,18,0.78))] p-6 shadow-[0_20px_80px_rgba(0,0,0,0.20)] transition hover:-translate-y-1 hover:border-cyan-300/25">
                  <div className="absolute inset-x-8 top-0 h-px bg-gradient-to-r from-transparent via-violet-300/60 to-transparent opacity-70" />
                  <span className="grid size-12 place-items-center rounded-2xl border border-cyan-300/15 bg-cyan-300/10 text-cyan-100">
                    <Icon size={21} />
                  </span>
                  <h3 className="mt-5 text-lg font-semibold text-white">{title}</h3>
                  <p className="mt-2 text-sm leading-6 text-slate-400">{description}</p>
                </article>
              ))}
            </div>
          </div>
        </section>

        <section className="px-4 py-16 sm:px-6">
          <div className="mx-auto grid max-w-7xl gap-5 lg:grid-cols-[0.85fr_1.15fr] lg:items-stretch">
            <div className="rounded-3xl border border-white/10 bg-[#091221]/82 p-6 shadow-[0_25px_100px_rgba(0,0,0,0.24)]">
              <div className="flex items-center gap-3">
                <span className="grid size-12 place-items-center rounded-2xl border border-amber-300/20 bg-amber-300/10 text-amber-100">
                  <Crown size={21} />
                </span>
                <div>
                  <p className="text-sm uppercase tracking-[0.22em] text-amber-100">Workspace Focus</p>
                  <h2 className="text-2xl font-semibold text-white">Built for everyday AI work</h2>
                </div>
              </div>
              <p className="mt-5 text-sm leading-7 text-slate-400">
                Move between chat, tools, model selection, payment requests, profile settings, and saved local history in one user workspace.
              </p>
              <div className="mt-6 grid gap-3">
                {["Fast chat workspace", "Model access by plan", "Manual payment requests", "Profile and data controls"].map((item) => (
                  <div key={item} className="flex items-center gap-3 rounded-2xl border border-white/10 bg-white/5 p-3 text-sm text-slate-300">
                    <ShieldCheck size={16} className="text-cyan-100" />
                    {item}
                  </div>
                ))}
              </div>
            </div>

            <div className="rounded-3xl border border-cyan-300/15 bg-[linear-gradient(135deg,rgba(6,182,212,0.10),rgba(139,92,246,0.08),rgba(3,7,18,0.82))] p-6 shadow-[0_25px_100px_rgba(6,182,212,0.08)]">
              <div className="grid gap-4 sm:grid-cols-3">
                {[
                  [BrainCircuit, "Reasoning", "Plan deeper work"],
                  [Layers3, "Projects", "Structure big builds"],
                  [Code2, "Code", "Debug and ship"],
                ].map(([Icon, title, description]) => {
                  const LucideIcon = Icon as typeof BrainCircuit;
                  return (
                    <div key={title as string} className="rounded-2xl border border-white/10 bg-black/20 p-4">
                      <LucideIcon size={20} className="text-cyan-100" />
                      <p className="mt-4 font-semibold text-white">{title as string}</p>
                      <p className="mt-1 text-xs text-slate-500">{description as string}</p>
                    </div>
                  );
                })}
              </div>
              <div className="mt-5 rounded-2xl border border-white/10 bg-[#020713]/80 p-4">
                <p className="text-sm font-semibold text-white">Detox AI workspace pulse</p>
                <div className="mt-4 grid gap-3">
                  {["Model access", "Prompt enhancer", "Saved chats", "Mobile chat"].map((item, index) => (
                    <div key={item}>
                      <div className="mb-1 flex items-center justify-between text-xs text-slate-400">
                        <span>{item}</span>
                        <span>{88 + index * 3}%</span>
                      </div>
                      <div className="h-2 overflow-hidden rounded-full bg-slate-800">
                        <div className="h-full rounded-full bg-gradient-to-r from-cyan-300 via-blue-500 to-violet-400" style={{ width: `${88 + index * 3}%` }} />
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </section>

        <section className="px-4 py-16 sm:px-6">
          <div className="mx-auto max-w-7xl">
            <div className="mb-8 flex flex-col justify-between gap-4 lg:flex-row lg:items-end">
              <div>
                <p className="text-sm font-semibold uppercase tracking-[0.25em] text-cyan-200">Pricing</p>
                <h2 className="mt-3 text-3xl font-semibold text-white sm:text-5xl">Start free. Upgrade when you need power.</h2>
              </div>
              <Link href="/pricing" className="text-sm font-semibold text-cyan-100 hover:text-white">View full pricing</Link>
            </div>
            <PricingGrid />
          </div>
        </section>
      </main>
      <Footer />
    </>
  );
}
