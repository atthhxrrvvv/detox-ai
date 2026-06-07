"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import {
  Braces,
  Briefcase,
  Code2,
  FileText,
  GraduationCap,
  Lightbulb,
  Palette,
  PenLine,
  ShieldCheck,
  Star,
  Video,
  Wand2,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";

const favoriteToolsKey = "detox-ai-favorite-tools";

const homeTools: Record<string, { description: string; icon: LucideIcon; href: string }> = {
  "AI Code Debugger": {
    description: "Debug code, explain fixes, and plan tests.",
    icon: Code2,
    href: "/tools?tool=Code%20Debugger",
  },
  "AI Website Planner": {
    description: "Plan pages, sections, UX, and launch steps.",
    icon: Lightbulb,
    href: "/tools?tool=Website%20Planner",
  },
  "AI App Builder": {
    description: "Shape app screens, data, routes, and roadmap.",
    icon: Wand2,
    href: "/tools?tool=App%20Builder",
  },
  "AI Study Notes Maker": {
    description: "Create notes, MCQs, summaries, and revision plans.",
    icon: GraduationCap,
    href: "/tools?tool=Study%20Notes%20Maker",
  },
  "AI Resume Writer": {
    description: "Polish resumes, profiles, and cover letters.",
    icon: FileText,
    href: "/tools?tool=Resume%20Writer",
  },
  "AI Email Writer": {
    description: "Draft clean emails in the right tone.",
    icon: PenLine,
    href: "/tools?tool=Email%20Writer",
  },
  "AI YouTube Script Writer": {
    description: "Write hooks, scenes, scripts, and CTAs.",
    icon: Video,
    href: "/tools?tool=YouTube%20Script%20Writer",
  },
  "AI JSON Formatter": {
    description: "Repair, format, validate, and explain JSON.",
    icon: Braces,
    href: "/tools?tool=JSON%20Formatter",
  },
  "AI UI/UX Planner": {
    description: "Plan layouts, flows, colors, and states.",
    icon: Palette,
    href: "/tools?tool=UI/UX%20Planner",
  },
  "AI Firebase Rules Helper": {
    description: "Draft safer Firestore and Storage rules.",
    icon: ShieldCheck,
    href: "/tools?tool=Firebase%20Rules%20Helper",
  },
  "AI Startup Blueprint": {
    description: "Shape product, audience, revenue, and roadmap.",
    icon: Briefcase,
    href: "/tools?tool=Startup%20Blueprint",
  },
};

function loadFavorites() {
  try {
    const stored = JSON.parse(window.localStorage.getItem(favoriteToolsKey) ?? "[]") as unknown[];
    return stored.filter((title): title is string => typeof title === "string");
  } catch {
    return [];
  }
}

export function FavoriteTools() {
  const [favorites, setFavorites] = useState<string[]>(() => (typeof window === "undefined" ? [] : loadFavorites()));

  useEffect(() => {
    function syncFavorites() {
      setFavorites(loadFavorites());
    }

    window.addEventListener("storage", syncFavorites);
    window.addEventListener("focus", syncFavorites);
    return () => {
      window.removeEventListener("storage", syncFavorites);
      window.removeEventListener("focus", syncFavorites);
    };
  }, []);

  const visibleFavorites = useMemo(
    () => favorites.map((title) => [title, homeTools[title]] as const).filter(([, tool]) => Boolean(tool)).slice(0, 6),
    [favorites],
  );

  return (
    <section className="px-4 py-16 sm:px-6">
      <div className="mx-auto max-w-7xl">
        <div className="mb-8 flex flex-col justify-between gap-4 lg:flex-row lg:items-end">
          <div>
            <p className="text-sm font-semibold uppercase tracking-[0.25em] text-amber-100">Favorite Tools</p>
            <h2 className="mt-3 text-3xl font-semibold text-white sm:text-5xl">Your starred AI tools</h2>
          </div>
          <Link href="/tools" className="text-sm font-semibold text-cyan-100 hover:text-white">Open tools</Link>
        </div>

        {visibleFavorites.length ? (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {visibleFavorites.map(([title, tool]) => {
              const Icon = tool.icon;
              return (
                <Link
                  key={title}
                  href={tool.href}
                  className="group relative overflow-hidden rounded-2xl border border-amber-300/15 bg-[#091221]/82 p-5 shadow-[0_20px_80px_rgba(0,0,0,0.20)] transition hover:-translate-y-1 hover:border-amber-300/35"
                >
                  <div className="flex items-start justify-between gap-3">
                    <span className="grid size-11 place-items-center rounded-xl border border-cyan-300/15 bg-cyan-300/10 text-cyan-100">
                      <Icon size={20} />
                    </span>
                    <Star size={17} className="text-amber-200" fill="currentColor" />
                  </div>
                  <h3 className="mt-4 font-semibold text-white">{title}</h3>
                  <p className="mt-2 text-sm leading-6 text-slate-400">{tool.description}</p>
                </Link>
              );
            })}
          </div>
        ) : (
          <div className="rounded-3xl border border-white/10 bg-[#091221]/76 p-6">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <p className="font-semibold text-white">No favorite tools yet.</p>
                <p className="mt-1 text-sm text-slate-400">Star tools like Code Debugger, Prompt Enhancer, and Study Notes to keep them here.</p>
              </div>
              <Link href="/tools" className="inline-flex h-10 items-center justify-center rounded-xl bg-amber-200 px-4 text-sm font-semibold text-slate-950">
                Browse Tools
              </Link>
            </div>
          </div>
        )}
      </div>
    </section>
  );
}
