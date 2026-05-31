"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import {
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
  ShieldCheck,
  Sparkles,
  Video,
} from "lucide-react";
import { onAuthStateChanged, type User } from "firebase/auth";
import { CREATOR_EMAIL } from "@/lib/constants";
import { auth } from "@/lib/firebase";

type ToolState = {
  input: string;
  output: string;
  loading: boolean;
  copied: boolean;
  saved: boolean;
};

const savedToolsKey = "detox-ai-tool-outputs";

const tools = [
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

export function ToolGrid() {
  const [toolState, setToolState] = useState(createInitialState);
  const [notice, setNotice] = useState("");
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [isAuthReady, setIsAuthReady] = useState(false);
  const totalGenerated = useMemo(
    () => Object.values(toolState).filter((item) => item.output).length,
    [toolState],
  );

  useEffect(() => {
    return onAuthStateChanged(auth, (user) => {
      setCurrentUser(user);
      setIsAuthReady(true);
    });
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
      const response = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        signal: controller.signal,
        body: JSON.stringify({
          message: `${prompt}${input}`,
          modelId: "flash-1.0",
          history: [],
          temperature: 0.85,
          idToken,
          user: {
            email: currentUser.email,
            plan: currentUser.email === CREATOR_EMAIL ? "creator" : "free",
            dailyMessages: 0,
            monthlyMessages: 0,
          },
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
        <div className="fixed left-1/2 top-20 z-40 -translate-x-1/2 rounded-full border border-cyan-300/20 bg-[#091221]/95 px-4 py-2 text-sm text-cyan-100 shadow-2xl">
          {notice}
        </div>
      ) : null}

      <div className="mb-6 grid gap-3 rounded-3xl border border-cyan-300/15 bg-[radial-gradient(circle_at_20%_0%,rgba(6,182,212,0.18),transparent_34%),linear-gradient(135deg,rgba(15,23,42,0.88),rgba(2,7,19,0.92))] p-5 sm:grid-cols-3">
        <div>
          <p className="text-xs uppercase tracking-[0.22em] text-cyan-200">Tool Engine</p>
          <p className="mt-2 text-2xl font-semibold text-white">Live generation</p>
        </div>
        <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
          <p className="text-sm text-slate-400">Available tools</p>
          <p className="mt-1 text-3xl font-semibold text-white">{tools.length}</p>
        </div>
        <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
          <p className="text-sm text-slate-400">Generated now</p>
          <p className="mt-1 text-3xl font-semibold text-cyan-100">{totalGenerated}</p>
        </div>
      </div>

      {isAuthReady && !currentUser ? (
        <div className="mb-6 flex flex-col gap-3 rounded-2xl border border-cyan-300/20 bg-cyan-300/10 p-4 sm:flex-row sm:items-center sm:justify-between">
          <p className="text-sm text-cyan-50">Login first to generate with Detox AI tools.</p>
          <Link href="/login" className="inline-flex h-10 items-center justify-center rounded-xl bg-cyan-300 px-4 text-sm font-semibold text-slate-950">
            Login to Use Tools
          </Link>
        </div>
      ) : null}

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        {tools.map((tool) => {
          const Icon = tool.icon;
          const state = toolState[tool.title];
          return (
            <article
              key={tool.title}
              className="group relative overflow-hidden rounded-2xl border border-white/10 bg-[linear-gradient(180deg,rgba(9,18,33,0.92),rgba(3,7,18,0.9))] p-5 shadow-[0_20px_70px_rgba(0,0,0,0.22)]"
            >
              <div className="pointer-events-none absolute inset-x-8 top-0 h-px bg-gradient-to-r from-transparent via-cyan-300/70 to-transparent opacity-60" />
              <div className="flex items-start justify-between gap-3">
                <span className="grid size-11 place-items-center rounded-xl border border-cyan-300/15 bg-cyan-300/10 text-cyan-100 shadow-[0_0_30px_rgba(6,182,212,0.12)]">
                  <Icon size={20} />
                </span>
                <span className="rounded-full border border-white/10 bg-white/5 px-2.5 py-1 text-xs text-slate-300">
                  {tool.access}
                </span>
              </div>

              <h3 className="mt-4 font-semibold text-white">{tool.title}</h3>
              <p className="mt-2 min-h-12 text-sm leading-6 text-slate-400">{tool.description}</p>

              <textarea
                value={state.input}
                onChange={(event) => updateTool(tool.title, { input: event.target.value })}
                className="mt-5 h-24 w-full resize-none rounded-xl border border-white/10 bg-black/24 p-3 text-sm text-white outline-none transition placeholder:text-slate-600 focus:border-cyan-300/60"
                placeholder={tool.placeholder}
              />

              <div className="mt-3 flex flex-wrap gap-2">
                <button
                  onClick={() => updateTool(tool.title, { input: tool.sample })}
                  className="h-9 rounded-xl border border-white/10 px-3 text-xs font-medium text-slate-300 transition hover:border-cyan-300/30 hover:text-white"
                >
                  Try sample
                </button>
                <button
                  onClick={() => generateTool(tool.title, tool.prompt)}
                  disabled={state.loading}
                  className="ml-auto inline-flex h-9 items-center gap-2 rounded-xl bg-white px-3 text-xs font-semibold text-slate-950 transition hover:brightness-110 disabled:opacity-60"
                >
                  {state.loading ? <Loader2 size={14} className="animate-spin" /> : <Sparkles size={14} />}
                  Generate
                </button>
              </div>

              <div className="mt-4 min-h-36 rounded-xl border border-white/10 bg-[#020713]/80 p-3">
                {state.loading ? (
                  <div className="flex h-28 items-center justify-center gap-2 text-sm text-cyan-100">
                    <Loader2 size={16} className="animate-spin" />
                    Detox AI is generating...
                  </div>
                ) : state.output ? (
                  <p className="max-h-56 overflow-y-auto whitespace-pre-wrap text-sm leading-6 text-slate-200">
                    {state.output}
                  </p>
                ) : (
                  <div className="flex h-28 flex-col items-center justify-center text-center">
                    <Sparkles size={18} className="text-cyan-200" />
                    <p className="mt-2 text-sm text-slate-500">Generated output appears here.</p>
                  </div>
                )}
              </div>

              <div className="mt-3 flex gap-2">
                <button
                  onClick={() => copyOutput(tool.title)}
                  className="inline-flex h-10 flex-1 items-center justify-center gap-2 rounded-xl border border-white/10 text-sm text-slate-300 transition hover:bg-white/6 hover:text-white"
                >
                  {state.copied ? <Check size={15} /> : <Copy size={15} />}
                  {state.copied ? "Copied" : "Copy"}
                </button>
                <button
                  onClick={() => saveOutput(tool.title)}
                  className="inline-flex h-10 flex-1 items-center justify-center gap-2 rounded-xl border border-white/10 text-sm text-slate-300 transition hover:bg-white/6 hover:text-white"
                >
                  {state.saved ? <Check size={15} /> : <Save size={15} />}
                  {state.saved ? "Saved" : "Save"}
                </button>
              </div>
            </article>
          );
        })}
      </div>
    </div>
  );
}
