"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import {
  ArrowRight,
  Bot,
  Braces,
  CheckCircle2,
  Code2,
  Flame,
  Layers3,
  MessageSquare,
  PanelTop,
  Smartphone,
  Sparkles,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";

const learningProgressKey = "detox-ai-learning-progress";
const pendingChatPromptKey = "detox-ai-pending-chat-prompt";

type LearningLesson = {
  title: string;
  goal: string;
};

type LearningPath = {
  title: string;
  description: string;
  icon: LucideIcon;
  accent: string;
  lessons: LearningLesson[];
};

const learningPaths: LearningPath[] = [
  {
    title: "Learn HTML",
    description: "Build the structure of real web pages.",
    icon: Braces,
    accent: "text-rose-100 border-rose-300/20 bg-rose-300/10",
    lessons: [
      { title: "HTML page structure", goal: "Understand doctype, html, head, body, titles, and metadata." },
      { title: "Text, links, and lists", goal: "Use headings, paragraphs, anchors, ordered lists, and unordered lists." },
      { title: "Images and media", goal: "Add images, alt text, audio, video, and responsive media basics." },
      { title: "Forms and inputs", goal: "Create labels, inputs, textareas, buttons, and basic form layouts." },
      { title: "Semantic HTML", goal: "Use header, nav, main, section, article, aside, and footer correctly." },
      { title: "Mini portfolio page", goal: "Build a simple personal portfolio page using only HTML." },
    ],
  },
  {
    title: "Learn CSS",
    description: "Style layouts that work on phone and desktop.",
    icon: PanelTop,
    accent: "text-cyan-100 border-cyan-300/20 bg-cyan-300/10",
    lessons: [
      { title: "Selectors and cascade", goal: "Learn selectors, specificity, inheritance, and CSS organization." },
      { title: "Box model", goal: "Use margin, padding, borders, width, height, and box sizing confidently." },
      { title: "Flexbox layouts", goal: "Build rows, columns, navigation bars, and centered content with flexbox." },
      { title: "CSS grid", goal: "Create responsive grids for cards, dashboards, and galleries." },
      { title: "Responsive design", goal: "Use media queries, fluid widths, and mobile-first thinking." },
      { title: "Polished landing section", goal: "Design a clean hero, buttons, cards, and responsive spacing." },
    ],
  },
  {
    title: "Learn JavaScript",
    description: "Make pages interactive with logic and events.",
    icon: Code2,
    accent: "text-yellow-100 border-yellow-300/20 bg-yellow-300/10",
    lessons: [
      { title: "Variables and types", goal: "Use strings, numbers, booleans, arrays, objects, let, and const." },
      { title: "Functions and scope", goal: "Write reusable functions and understand parameters, returns, and scope." },
      { title: "Conditions and loops", goal: "Control code with if statements, loops, map, filter, and reduce." },
      { title: "DOM events", goal: "Select elements, handle clicks, update text, and react to user input." },
      { title: "Async JavaScript", goal: "Use promises, async/await, fetch, and API response handling." },
      { title: "Mini task app", goal: "Build a small task list with add, delete, and completed states." },
    ],
  },
  {
    title: "Learn React",
    description: "Build component-based web apps.",
    icon: Layers3,
    accent: "text-sky-100 border-sky-300/20 bg-sky-300/10",
    lessons: [
      { title: "Components and JSX", goal: "Create components, pass props, and write JSX clearly." },
      { title: "State with useState", goal: "Track UI data and update components from user actions." },
      { title: "Lists and forms", goal: "Render lists, handle forms, and keep controlled inputs clean." },
      { title: "Effects and data", goal: "Use useEffect for loading data and syncing side effects." },
      { title: "Reusable components", goal: "Split UI into useful components without overcomplicating it." },
      { title: "Mini dashboard", goal: "Build a responsive dashboard with cards, filters, and state." },
    ],
  },
  {
    title: "Learn Firebase",
    description: "Add auth, database, and hosting to apps.",
    icon: Flame,
    accent: "text-orange-100 border-orange-300/20 bg-orange-300/10",
    lessons: [
      { title: "Firebase project setup", goal: "Create a Firebase project and connect it to a web app." },
      { title: "Authentication", goal: "Add sign up, login, logout, and protected user states." },
      { title: "Firestore basics", goal: "Create collections, documents, reads, writes, and realtime updates." },
      { title: "Security rules", goal: "Protect user data with owner-based Firestore rules." },
      { title: "Storage and files", goal: "Upload files and connect file URLs to user data." },
      { title: "Deploy an app", goal: "Prepare environment variables and deploy a Firebase-backed app." },
    ],
  },
  {
    title: "Learn React Native",
    description: "Create mobile app screens and flows.",
    icon: Smartphone,
    accent: "text-emerald-100 border-emerald-300/20 bg-emerald-300/10",
    lessons: [
      { title: "React Native setup", goal: "Understand Expo, project structure, and mobile preview workflow." },
      { title: "Core components", goal: "Use View, Text, Image, ScrollView, TextInput, and Pressable." },
      { title: "Styling mobile UI", goal: "Style screens with Flexbox, spacing, typography, and themes." },
      { title: "Navigation", goal: "Create stack and tab navigation for app screens." },
      { title: "Device features", goal: "Use storage, camera, notifications, or permissions safely." },
      { title: "Mini habit app", goal: "Build a habit tracker screen with local state and clean mobile UI." },
    ],
  },
  {
    title: "Learn AI Prompts",
    description: "Get better answers from any AI model.",
    icon: Bot,
    accent: "text-fuchsia-100 border-fuchsia-300/20 bg-fuchsia-300/10",
    lessons: [
      { title: "Prompt basics", goal: "Write clear tasks with context, goal, audience, and output format." },
      { title: "Role and constraints", goal: "Use roles, boundaries, examples, and quality rules." },
      { title: "Study prompts", goal: "Create prompts for notes, quizzes, flashcards, and revision plans." },
      { title: "Coding prompts", goal: "Ask AI for debugging, architecture, tests, and implementation help." },
      { title: "Business prompts", goal: "Generate plans, offers, emails, research, and launch checklists." },
      { title: "Prompt library", goal: "Build a reusable personal prompt library for everyday work." },
    ],
  },
];

function loadProgress() {
  if (typeof window === "undefined") return [] as string[];

  try {
    const stored = JSON.parse(window.localStorage.getItem(learningProgressKey) ?? "[]") as unknown[];
    return stored.filter((item): item is string => typeof item === "string");
  } catch {
    return [];
  }
}

function lessonKey(pathTitle: string, lessonTitle: string) {
  return `${pathTitle}:${lessonTitle}`;
}

function buildLessonPrompt(path: LearningPath, lesson: LearningLesson) {
  return `Act as Detox AI Learning Coach. Teach me this free learning path lesson in a beginner-friendly way.

Learning path: ${path.title}
Lesson: ${lesson.title}
Goal: ${lesson.goal}

Give me:
1. A simple explanation
2. Key points
3. One practical example
4. A tiny practice task
5. A quick quiz with answers`;
}

export function LearningPaths() {
  const [activePathTitle, setActivePathTitle] = useState(learningPaths[0].title);
  const [completedLessons, setCompletedLessons] = useState<string[]>(() => (typeof window === "undefined" ? [] : loadProgress()));

  const activePath = useMemo(
    () => learningPaths.find((path) => path.title === activePathTitle) ?? learningPaths[0],
    [activePathTitle],
  );
  const ActivePathIcon = activePath.icon;
  const totalLessons = learningPaths.reduce((total, path) => total + path.lessons.length, 0);
  const completedInActivePath = activePath.lessons.filter((lesson) =>
    completedLessons.includes(lessonKey(activePath.title, lesson.title)),
  ).length;

  useEffect(() => {
    window.localStorage.setItem(learningProgressKey, JSON.stringify(completedLessons));
  }, [completedLessons]);

  function toggleLesson(path: LearningPath, lesson: LearningLesson) {
    const key = lessonKey(path.title, lesson.title);
    setCompletedLessons((current) =>
      current.includes(key) ? current.filter((item) => item !== key) : [...current, key],
    );
  }

  function prepareAiHelp(path: LearningPath, lesson: LearningLesson) {
    window.localStorage.setItem(pendingChatPromptKey, buildLessonPrompt(path, lesson));
  }

  return (
    <section id="learning-paths" className="px-4 py-16 sm:px-6">
      <div className="mx-auto max-w-7xl">
        <div className="mb-8 flex flex-col justify-between gap-4 lg:flex-row lg:items-end">
          <div className="max-w-2xl">
            <p className="text-sm font-semibold uppercase tracking-[0.25em] text-emerald-100">Free Learning Paths</p>
            <h2 className="mt-3 text-3xl font-semibold text-white sm:text-5xl">Learn tech skills with AI beside you</h2>
            <p className="mt-4 text-sm leading-6 text-slate-400 sm:text-base">
              Choose a path, finish short lessons, and send any lesson to Detox AI for explanations, examples, practice tasks, and quizzes.
            </p>
          </div>
          <div className="inline-flex w-fit items-center gap-2 rounded-full border border-emerald-300/20 bg-emerald-300/10 px-4 py-2 text-sm font-semibold text-emerald-50">
            <Sparkles size={16} />
            Free for everyone
          </div>
        </div>

        <div className="grid gap-5 lg:grid-cols-[0.95fr_1.05fr]">
          <div className="grid gap-3 sm:grid-cols-2">
            {learningPaths.map((path) => {
              const Icon = path.icon;
              const completedCount = path.lessons.filter((lesson) =>
                completedLessons.includes(lessonKey(path.title, lesson.title)),
              ).length;
              const isActive = path.title === activePath.title;

              return (
                <button
                  key={path.title}
                  type="button"
                  onClick={() => setActivePathTitle(path.title)}
                  className={`group rounded-2xl border p-4 text-left transition ${
                    isActive
                      ? "border-emerald-300/35 bg-emerald-300/10"
                      : "border-white/10 bg-[#091221]/78 hover:border-cyan-300/25 hover:bg-white/[0.055]"
                  }`}
                >
                  <div className="flex items-start justify-between gap-3">
                    <span className={`grid size-11 place-items-center rounded-xl border ${path.accent}`}>
                      <Icon size={20} />
                    </span>
                    <span className="rounded-full border border-white/10 bg-black/20 px-2 py-1 text-xs font-semibold text-slate-300">
                      Free
                    </span>
                  </div>
                  <h3 className="mt-4 font-semibold text-white">{path.title}</h3>
                  <p className="mt-2 text-sm leading-6 text-slate-400">{path.description}</p>
                  <div className="mt-4 h-1.5 overflow-hidden rounded-full bg-slate-800">
                    <div
                      className="h-full rounded-full bg-emerald-300"
                      style={{ width: `${(completedCount / path.lessons.length) * 100}%` }}
                    />
                  </div>
                  <p className="mt-2 text-xs text-slate-500">
                    {completedCount}/{path.lessons.length} lessons done
                  </p>
                </button>
              );
            })}
          </div>

          <div className="rounded-2xl border border-white/10 bg-[#091221]/88 p-4 shadow-[0_24px_90px_rgba(0,0,0,0.24)]">
            <div className="flex flex-col gap-4 border-b border-white/10 pb-4 sm:flex-row sm:items-center sm:justify-between">
              <div className="flex items-center gap-3">
                <span className={`grid size-12 place-items-center rounded-xl border ${activePath.accent}`}>
                  <ActivePathIcon size={21} />
                </span>
                <div>
                  <h3 className="text-xl font-semibold text-white">{activePath.title}</h3>
                  <p className="mt-1 text-sm text-slate-400">
                    {completedInActivePath}/{activePath.lessons.length} complete
                  </p>
                </div>
              </div>
              <span className="rounded-full border border-white/10 bg-black/20 px-3 py-1.5 text-xs font-semibold text-slate-300">
                {totalLessons} total lessons
              </span>
            </div>

            <div className="mt-4 grid gap-3">
              {activePath.lessons.map((lesson, index) => {
                const key = lessonKey(activePath.title, lesson.title);
                const done = completedLessons.includes(key);

                return (
                  <article key={lesson.title} className="rounded-xl border border-white/10 bg-black/18 p-3">
                    <div className="flex items-start gap-3">
                      <button
                        type="button"
                        onClick={() => toggleLesson(activePath, lesson)}
                        className={`mt-0.5 grid size-8 shrink-0 place-items-center rounded-lg border transition ${
                          done
                            ? "border-emerald-300/35 bg-emerald-300/15 text-emerald-100"
                            : "border-white/10 bg-white/5 text-slate-500 hover:text-white"
                        }`}
                        aria-label={done ? "Mark lesson incomplete" : "Mark lesson complete"}
                      >
                        {done ? <CheckCircle2 size={17} /> : <span className="text-xs font-semibold">{index + 1}</span>}
                      </button>
                      <div className="min-w-0 flex-1">
                        <h4 className="font-semibold text-white">{lesson.title}</h4>
                        <p className="mt-1 text-sm leading-6 text-slate-400">{lesson.goal}</p>
                      </div>
                    </div>
                    <div className="mt-3 flex flex-wrap gap-2 pl-11">
                      <Link
                        href="/chat"
                        onClick={() => prepareAiHelp(activePath, lesson)}
                        className="inline-flex min-h-9 items-center justify-center gap-2 rounded-lg bg-cyan-200 px-3 text-xs font-semibold text-slate-950 transition hover:brightness-110"
                      >
                        <MessageSquare size={14} />
                        AI Help
                      </Link>
                      <button
                        type="button"
                        onClick={() => toggleLesson(activePath, lesson)}
                        className="inline-flex min-h-9 items-center justify-center gap-2 rounded-lg border border-white/10 px-3 text-xs font-semibold text-slate-300 transition hover:bg-white/8 hover:text-white"
                      >
                        <CheckCircle2 size={14} />
                        {done ? "Done" : "Mark done"}
                      </button>
                    </div>
                  </article>
                );
              })}
            </div>

            <Link
              href="/chat"
              onClick={() =>
                window.localStorage.setItem(
                  pendingChatPromptKey,
                  `Act as Detox AI Learning Coach. Help me choose the best free learning path from HTML, CSS, JavaScript, React, Firebase, React Native, and AI Prompts. Ask about my current level, goal, and available time, then recommend a path and weekly plan.`,
                )
              }
              className="mt-4 inline-flex min-h-11 w-full items-center justify-center gap-2 rounded-xl border border-emerald-300/25 bg-emerald-300/10 px-4 text-sm font-semibold text-emerald-50 transition hover:bg-emerald-300/15"
            >
              Help me choose a path
              <ArrowRight size={16} />
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}
