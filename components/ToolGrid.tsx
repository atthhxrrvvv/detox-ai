"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import {
  ArrowRight,
  Bot,
  Braces,
  Briefcase,
  Check,
  Code2,
  Copy,
  FileText,
  GraduationCap,
  Lightbulb,
  Loader2,
  Palette,
  PenLine,
  Save,
  Search,
  ShieldCheck,
  Sparkles,
  Star,
  Video,
  X,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";
import { onAuthStateChanged, type User } from "firebase/auth";
import { auth } from "@/lib/firebase";

type ToolState = {
  input: string;
  output: string;
  loading: boolean;
  copied: boolean;
  saved: boolean;
};

const savedToolsKey = "detox-ai-tool-outputs";
const favoriteToolsKey = "detox-ai-favorite-tools";

type ToolDefinition = {
  title: string;
  description: string;
  icon: LucideIcon;
  access: string;
  placeholder: string;
  sample: string;
  prompt: string;
};

const tools: readonly ToolDefinition[] = [
  {
    title: "AI Code Debugger",
    description: "Find bugs, explain fixes, and improve full-stack code.",
    icon: Code2,
    access: "Pro",
    placeholder: "Paste code and describe the bug...",
    sample: "My Next.js button click is not updating state. Explain likely causes and fixes.",
    prompt:
      "Act as Detox AI Code Debugger. Debug this carefully, explain the issue, provide fixed code, and add a small testing checklist:\n\n",
  },
  {
    title: "AI Website Planner",
    description: "Turn an idea into pages, sections, copy, and stack.",
    icon: Lightbulb,
    access: "Lite",
    placeholder: "Describe your website idea...",
    sample: "A premium portfolio website for a mobile app developer.",
    prompt:
      "Act as Detox AI Website Planner. Create a practical website plan with pages, sections, copy ideas, UX notes, and launch steps:\n\n",
  },
  {
    title: "AI App Builder",
    description: "Plan app flows, data models, routes, and launch steps.",
    icon: Bot,
    access: "Premium",
    placeholder: "Describe the app you want to build...",
    sample: "A study planner app with AI notes, reminders, and progress tracking.",
    prompt:
      "Act as Detox AI App Builder. Build a full app blueprint with features, screens, database structure, API routes, auth, and MVP roadmap:\n\n",
  },
  {
    title: "AI Study Notes Maker",
    description: "Generate summaries, notes, MCQs, and revision plans.",
    icon: GraduationCap,
    access: "Go",
    placeholder: "Paste the topic or chapter...",
    sample: "Photosynthesis for class 10 biology.",
    prompt:
      "Act as Detox AI Study Notes Maker. Create clean notes, key definitions, examples, MCQs with answers, and a revision plan:\n\n",
  },
  {
    title: "AI Resume Writer",
    description: "Create polished resumes, profiles, and cover letters.",
    icon: FileText,
    access: "Pro",
    placeholder: "Paste your skills, role, and experience...",
    sample: "Frontend developer, React, Next.js, Firebase, 3 projects, fresher.",
    prompt:
      "Act as Detox AI Resume Writer. Create a professional resume summary, bullet points, skills section, and cover letter draft:\n\n",
  },
  {
    title: "AI Email Writer",
    description: "Draft clear emails in your target tone.",
    icon: PenLine,
    access: "Lite",
    placeholder: "What email do you need?",
    sample: "Write a polite email asking a client for payment confirmation.",
    prompt:
      "Act as Detox AI Email Writer. Write a polished email with subject line, clear body, and optional shorter version:\n\n",
  },
  {
    title: "AI YouTube Script Writer",
    description: "Create hooks, scenes, voiceover, and CTAs.",
    icon: Video,
    access: "Pro",
    placeholder: "Enter video topic, audience, and length...",
    sample: "A 5 minute video explaining how AI tools help students.",
    prompt:
      "Act as Detox AI YouTube Script Writer. Create a strong hook, intro, scene-by-scene script, voiceover, and CTA:\n\n",
  },
  {
    title: "AI JSON Formatter",
    description: "Format, validate, explain, and repair JSON.",
    icon: Braces,
    access: "Lite",
    placeholder: "Paste JSON or broken JSON...",
    sample: "{ name: 'Detox AI', plan: 'Pro', features: ['chat','tools'] }",
    prompt:
      "Act as Detox AI JSON Formatter. Repair and format this JSON if needed, explain changes, and return valid JSON in a code block:\n\n",
  },
  {
    title: "AI UI/UX Planner",
    description: "Design layouts, flows, color systems, and components.",
    icon: Palette,
    access: "Premium",
    placeholder: "Describe the product screen or workflow...",
    sample: "A futuristic AI dashboard for students and coders.",
    prompt:
      "Act as Detox AI UI/UX Planner. Create a practical UI/UX plan with layout, components, states, responsive behavior, and polish details:\n\n",
  },
  {
    title: "AI Firebase Rules Helper",
    description: "Draft safer Firestore and Storage rules.",
    icon: ShieldCheck,
    access: "Premium",
    placeholder: "Describe your collections and roles...",
    sample: "Users can read own chats. Creator can approve payments and manage plans.",
    prompt:
      "Act as Detox AI Firebase Rules Helper. Draft secure Firestore/Storage rules, explain the logic, and list security warnings:\n\n",
  },
  {
    title: "AI Startup Blueprint",
    description: "Shape product, audience, revenue, and roadmap.",
    icon: Briefcase,
    access: "Ultimate",
    placeholder: "Describe your startup idea...",
    sample: "An AI workspace for Indian students, coders, and creators.",
    prompt:
      "Act as Detox AI Startup Blueprint. Create a founder-ready blueprint with audience, features, pricing, GTM, risks, and 30-day roadmap:\n\n",
  },
] as const;

function getRequestedToolTitle() {
  if (typeof window === "undefined") return tools[0].title;
  const requestedTool = new URLSearchParams(window.location.search).get("tool")?.toLowerCase();
  if (!requestedTool) return tools[0].title;
  return (
    tools.find((tool) =>
      [tool.title, tool.title.replace(/^AI\s+/i, "")].some((value) => value.toLowerCase() === requestedTool),
    )?.title ?? tools[0].title
  );
}

function createInitialState() {
  return tools.reduce<Record<string, ToolState>>((state, tool) => {
    state[tool.title] = {
      input: "",
      output: "",
      loading: false,
      copied: false,
      saved: false,
    };
    return state;
  }, {});
}

function loadFavoriteToolTitles() {
  if (typeof window === "undefined") return [] as string[];

  try {
    const stored = JSON.parse(window.localStorage.getItem(favoriteToolsKey) ?? "[]") as unknown[];
    return stored.filter((title): title is string => typeof title === "string");
  } catch {
    return [];
  }
}

export function ToolGrid() {
  const [toolState, setToolState] = useState(createInitialState);
  const [favoriteTools, setFavoriteTools] = useState<string[]>(loadFavoriteToolTitles);
  const [notice, setNotice] = useState("");
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [isAuthReady, setIsAuthReady] = useState(false);
  const [activeToolTitle, setActiveToolTitle] = useState<string>(getRequestedToolTitle);
  const [toolQuery, setToolQuery] = useState("");
  const totalGenerated = useMemo(
    () => Object.values(toolState).filter((item) => item.output).length,
    [toolState],
  );
  const visibleTools = useMemo(() => {
    const search = toolQuery.trim().toLowerCase();
    if (!search) return tools;
    return tools.filter((tool) =>
      [tool.title, tool.description, tool.access].some((value) => value.toLowerCase().includes(search)),
    );
  }, [toolQuery]);
  const activeTool = visibleTools.find((tool) => tool.title === activeToolTitle) ?? visibleTools[0] ?? tools[0];
  const activeState = toolState[activeTool.title];
  const isGeneratingAny = Object.values(toolState).some((item) => item.loading);

  useEffect(() => {
    return onAuthStateChanged(auth, (user) => {
      setCurrentUser(user);
      setIsAuthReady(true);
    });
  }, []);

  useEffect(() => {
    if (new URLSearchParams(window.location.search).has("tool")) {
      window.setTimeout(() => document.getElementById("tool-workspace")?.scrollIntoView({ behavior: "smooth", block: "start" }), 100);
    }
  }, []);

  function updateTool(title: string, patch: Partial<ToolState>) {
    setToolState((current) => ({
      ...current,
      [title]: {
        ...current[title],
        ...patch,
      },
    }));
  }

  function flashNotice(message: string) {
    setNotice(message);
    window.setTimeout(() => setNotice(""), 2200);
  }

  function selectTool(title: string) {
    setActiveToolTitle(title);
    const element = document.getElementById("tool-workspace");
    element?.scrollIntoView({ behavior: "smooth", block: "start" });
  }

  function toggleFavoriteTool(title: string) {
    setFavoriteTools((current) => {
      const next = current.includes(title)
        ? current.filter((item) => item !== title)
        : [title, ...current];
      window.localStorage.setItem(favoriteToolsKey, JSON.stringify(next));
      flashNotice(next.includes(title) ? "Added to favorites." : "Removed from favorites.");
      return next;
    });
  }

  async function generateTool(title: string, prompt: string) {
    const state = toolState[title];
    const input = state.input.trim();
    if (!input || state.loading) {
      flashNotice("Add details first, then generate.");
      return;
    }

    if (!currentUser) {
      flashNotice("Login first to use Detox AI tools.");
      return;
    }

    updateTool(title, { loading: true, output: "", saved: false });

    try {
      const idToken = await currentUser.getIdToken();
      const controller = new AbortController();
      const timeout = window.setTimeout(() => controller.abort(), 45000);
      const response = await fetch("/api/tools/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        signal: controller.signal,
        body: JSON.stringify({
          title,
          prompt,
          input,
          idToken,
        }),
      });
      window.clearTimeout(timeout);
      const data = await response.json();
      updateTool(title, {
        output: data.reply ?? data.error ?? "Detox AI could not generate this tool output.",
        loading: false,
      });
    } catch {
      updateTool(title, {
        output: "Detox AI tools could not finish that request. Try a shorter input or generate again.",
        loading: false,
      });
    }
  }

  async function copyOutput(title: string) {
    const output = toolState[title].output;
    if (!output) {
      flashNotice("Generate an output first.");
      return;
    }

    await navigator.clipboard.writeText(output);
    updateTool(title, { copied: true });
    window.setTimeout(() => updateTool(title, { copied: false }), 1200);
  }

  function saveOutput(title: string) {
    const state = toolState[title];
    if (!state.output) {
      flashNotice("Generate an output first.");
      return;
    }

    const saved = JSON.parse(window.localStorage.getItem(savedToolsKey) ?? "[]") as unknown[];
    window.localStorage.setItem(
      savedToolsKey,
      JSON.stringify([
        {
          title,
          input: state.input,
          output: state.output,
          createdAt: new Date().toISOString(),
        },
        ...saved,
      ]),
    );
    updateTool(title, { saved: true });
    flashNotice("Saved to this browser.");
  }

  return (
    <div className="relative">
      {notice ? (
        <div className="fixed inset-x-4 bottom-5 z-40 rounded-2xl border border-cyan-300/20 bg-[#091221]/95 px-4 py-3 text-center text-sm text-cyan-100 shadow-2xl sm:inset-x-auto sm:left-1/2 sm:top-20 sm:bottom-auto sm:-translate-x-1/2 sm:rounded-full sm:py-2">
          {notice}
        </div>
      ) : null}

      <div className="mb-5 overflow-hidden rounded-2xl border border-cyan-300/15 bg-[radial-gradient(circle_at_18%_0%,rgba(6,182,212,0.18),transparent_34%),linear-gradient(135deg,rgba(15,23,42,0.9),rgba(2,7,19,0.94))] shadow-[0_24px_90px_rgba(0,0,0,0.24)] sm:rounded-3xl">
        <div className="grid gap-4 p-4 sm:grid-cols-[1.1fr_0.9fr] sm:p-5 lg:grid-cols-[1.15fr_0.85fr_0.85fr]">
          <div>
            <p className="text-xs uppercase tracking-[0.22em] text-cyan-200">AI Tool Engine</p>
            <p className="mt-2 text-2xl font-semibold text-white sm:text-3xl">Mobile AI workspace</p>
            <p className="mt-2 max-w-xl text-sm leading-6 text-slate-400">
              Pick one tool, add context, generate, copy, and save from a phone-friendly workspace.
            </p>
          </div>
          <div className="grid grid-cols-2 gap-3 lg:contents">
            <div className="rounded-xl border border-white/10 bg-white/[0.045] p-3 sm:rounded-2xl sm:p-4">
              <p className="text-xs text-slate-400 sm:text-sm">Available tools</p>
              <p className="mt-1 text-2xl font-semibold text-white sm:text-3xl">{tools.length}</p>
            </div>
            <div className="rounded-xl border border-white/10 bg-white/[0.045] p-3 sm:rounded-2xl sm:p-4">
              <p className="text-xs text-slate-400 sm:text-sm">Generated now</p>
              <p className="mt-1 text-2xl font-semibold text-cyan-100 sm:text-3xl">{totalGenerated}</p>
            </div>
          </div>
        </div>

        <div className="border-t border-white/10 p-3 sm:p-4">
          <div className="flex h-11 items-center gap-2 rounded-xl border border-white/10 bg-black/24 px-3 text-slate-400">
            <Search size={16} />
            <input
              value={toolQuery}
              onChange={(event) => setToolQuery(event.target.value)}
              placeholder="Search tools, writing, code, study..."
              className="min-w-0 flex-1 bg-transparent text-sm text-white outline-none placeholder:text-slate-600"
            />
            {toolQuery ? (
              <button type="button" onClick={() => setToolQuery("")} className="grid size-7 place-items-center rounded-lg text-slate-400 hover:bg-white/8 hover:text-white" aria-label="Clear tool search">
                <X size={14} />
              </button>
            ) : null}
          </div>
        </div>
      </div>

      {isAuthReady && !currentUser ? (
        <div className="mb-5 flex flex-col gap-3 rounded-2xl border border-cyan-300/20 bg-cyan-300/10 p-4 sm:flex-row sm:items-center sm:justify-between">
          <p className="text-sm text-cyan-50">Login first to generate with Detox AI tools.</p>
          <Link href="/login" className="inline-flex h-10 items-center justify-center rounded-xl bg-cyan-300 px-4 text-sm font-semibold text-slate-950">
            Login to Use Tools
          </Link>
        </div>
      ) : null}

      <div className="sticky top-[72px] z-20 -mx-4 mb-5 border-y border-white/10 bg-[#020713]/88 px-4 py-3 backdrop-blur-xl sm:static sm:mx-0 sm:border-0 sm:bg-transparent sm:p-0">
        <div className="flex gap-2 overflow-x-auto pb-1 detox-scrollbar" aria-label="Tool selector">
          {visibleTools.map((tool) => {
            const Icon = tool.icon;
            const selected = activeTool.title === tool.title;
            return (
              <button
                key={tool.title}
                type="button"
                onClick={() => selectTool(tool.title)}
                className={`inline-flex min-h-10 shrink-0 items-center gap-2 rounded-full border px-3 text-xs font-semibold transition ${
                  selected
                    ? "border-cyan-300 bg-cyan-300 text-slate-950"
                    : "border-white/10 bg-white/[0.035] text-slate-300 hover:bg-white/8 hover:text-white"
                }`}
              >
                <Icon size={14} />
                {tool.title.replace("AI ", "")}
              </button>
            );
          })}
        </div>
      </div>

      {!visibleTools.length ? (
        <div className="rounded-2xl border border-white/10 bg-[#091221]/88 p-6 text-center text-sm text-slate-400">
          No tools match that search.
        </div>
      ) : null}

      <div id="tool-workspace" className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        {visibleTools.map((tool) => {
            const Icon = tool.icon;
            const state = toolState[tool.title];
            const isActiveOnPhone = activeTool.title === tool.title;
            const isFavorite = favoriteTools.includes(tool.title);
            return (
            <article
              key={tool.title}
              className={`group relative overflow-hidden rounded-2xl border border-white/10 bg-[linear-gradient(180deg,rgba(9,18,33,0.94),rgba(3,7,18,0.92))] p-4 shadow-[0_20px_70px_rgba(0,0,0,0.22)] sm:p-5 ${
                isActiveOnPhone ? "block" : "hidden md:block"
              }`}
            >
              <div className="pointer-events-none absolute inset-x-8 top-0 h-px bg-gradient-to-r from-transparent via-cyan-300/70 to-transparent opacity-60" />
              <div className="flex items-start justify-between gap-3">
                <span className="grid size-11 place-items-center rounded-xl border border-cyan-300/15 bg-cyan-300/10 text-cyan-100 shadow-[0_0_30px_rgba(6,182,212,0.12)]">
                  <Icon size={20} />
                </span>
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => toggleFavoriteTool(tool.title)}
                    className={`grid size-9 place-items-center rounded-xl border transition ${
                      isFavorite
                        ? "border-amber-300/35 bg-amber-300/15 text-amber-100"
                        : "border-white/10 bg-white/5 text-slate-400 hover:text-white"
                    }`}
                    aria-label={isFavorite ? `Remove ${tool.title} from favorites` : `Add ${tool.title} to favorites`}
                    title={isFavorite ? "Remove favorite" : "Add favorite"}
                  >
                    <Star size={16} fill={isFavorite ? "currentColor" : "none"} />
                  </button>
                  <span className="rounded-full border border-white/10 bg-white/5 px-2.5 py-1 text-xs text-slate-300">
                    {tool.access}
                  </span>
                </div>
              </div>

              <h3 className="mt-4 text-lg font-semibold text-white">{tool.title}</h3>
              <p className="mt-2 min-h-12 text-sm leading-6 text-slate-400">{tool.description}</p>

              <div className="mt-5 rounded-xl border border-white/10 bg-black/24 p-3 focus-within:border-cyan-300/60">
                <textarea
                  value={state.input}
                  onChange={(event) => updateTool(tool.title, { input: event.target.value })}
                  className="min-h-32 w-full resize-none bg-transparent text-base leading-6 text-white outline-none placeholder:text-slate-600 sm:min-h-28 sm:text-sm"
                  placeholder={tool.placeholder}
                />
                <div className="mt-2 flex items-center justify-between gap-3 border-t border-white/10 pt-2 text-xs text-slate-500">
                  <span>{formatInputLength(state.input)} typed</span>
                  {state.input ? (
                    <button type="button" onClick={() => updateTool(tool.title, { input: "" })} className="font-semibold text-slate-400 hover:text-white">
                      Clear
                    </button>
                  ) : null}
                </div>
              </div>

              <div className="mt-3 grid grid-cols-2 gap-2 sm:flex sm:flex-wrap">
                <button
                  type="button"
                  onClick={() => updateTool(tool.title, { input: tool.sample })}
                  className="inline-flex min-h-10 items-center justify-center rounded-xl border border-white/10 px-3 text-xs font-semibold text-slate-300 transition hover:border-cyan-300/30 hover:text-white"
                >
                  Try sample
                </button>
                <button
                  type="button"
                  onClick={() => generateTool(tool.title, tool.prompt)}
                  disabled={state.loading}
                  className="inline-flex min-h-10 items-center justify-center gap-2 rounded-xl bg-white px-3 text-xs font-semibold text-slate-950 transition hover:brightness-110 disabled:cursor-not-allowed disabled:opacity-60 sm:ml-auto"
                >
                  {state.loading ? <Loader2 size={14} className="animate-spin" /> : <Sparkles size={14} />}
                  Generate
                </button>
              </div>

              <div className="mt-4 min-h-44 rounded-xl border border-white/10 bg-[#020713]/80 p-3 sm:min-h-36">
                {state.loading ? (
                  <div className="flex h-36 items-center justify-center gap-2 text-sm text-cyan-100 sm:h-28">
                    <Loader2 size={16} className="animate-spin" />
                    Detox AI is generating...
                  </div>
                ) : state.output ? (
                  <p className="max-h-80 overflow-y-auto whitespace-pre-wrap text-sm leading-6 text-slate-200 detox-scrollbar sm:max-h-56">
                    {state.output}
                  </p>
                ) : (
                  <div className="flex h-36 flex-col items-center justify-center text-center sm:h-28">
                    <Sparkles size={18} className="text-cyan-200" />
                    <p className="mt-2 text-sm text-slate-500">Generated output appears here.</p>
                  </div>
                )}
              </div>

              <div className="mt-3 grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() => copyOutput(tool.title)}
                  disabled={!state.output}
                  className="inline-flex min-h-11 items-center justify-center gap-2 rounded-xl border border-white/10 text-sm font-semibold text-slate-300 transition hover:bg-white/6 hover:text-white disabled:cursor-not-allowed disabled:opacity-45"
                >
                  {state.copied ? <Check size={15} /> : <Copy size={15} />}
                  {state.copied ? "Copied" : "Copy"}
                </button>
                <button
                  type="button"
                  onClick={() => saveOutput(tool.title)}
                  disabled={!state.output}
                  className="inline-flex min-h-11 items-center justify-center gap-2 rounded-xl border border-white/10 text-sm font-semibold text-slate-300 transition hover:bg-white/6 hover:text-white disabled:cursor-not-allowed disabled:opacity-45"
                >
                  {state.saved ? <Check size={15} /> : <Save size={15} />}
                  {state.saved ? "Saved" : "Save"}
                </button>
              </div>
            </article>
          );
        })}
      </div>

      <div className="fixed inset-x-3 bottom-3 z-30 rounded-2xl border border-white/10 bg-[#091221]/95 p-3 shadow-[0_20px_80px_rgba(0,0,0,0.45)] backdrop-blur-xl md:hidden">
        <div className="flex items-center justify-between gap-3">
          <div className="min-w-0">
            <p className="truncate text-sm font-semibold text-white">{activeTool.title}</p>
            <p className="text-xs text-slate-500">{activeState.output ? "Output ready" : activeState.input ? "Ready to generate" : "Add details first"}</p>
          </div>
          <button
            type="button"
            onClick={() => generateTool(activeTool.title, activeTool.prompt)}
            disabled={!activeState.input.trim() || activeState.loading || isGeneratingAny}
            className="inline-flex min-h-11 shrink-0 items-center gap-2 rounded-xl bg-cyan-300 px-4 text-sm font-semibold text-slate-950 disabled:cursor-not-allowed disabled:opacity-50"
          >
            {activeState.loading ? <Loader2 size={16} className="animate-spin" /> : <ArrowRight size={16} />}
            Generate
          </button>
        </div>
      </div>
    </div>
  );
}

function formatInputLength(input: string) {
  const length = input.trim().length;
  return new Intl.NumberFormat("en-IN").format(length);
}
