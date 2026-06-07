"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { FormEvent, useEffect, useMemo, useState } from "react";
import { AlertTriangle, CreditCard, Lightbulb, Loader2, MessageSquare, Send, X } from "lucide-react";
import { onAuthStateChanged, type User } from "firebase/auth";
import { auth } from "@/lib/firebase";

type ReportType = "bug" | "feature" | "payment";

const reportOptions = [
  {
    id: "bug",
    label: "Report Bug",
    description: "Something is broken or not working.",
    icon: AlertTriangle,
  },
  {
    id: "feature",
    label: "Suggest Feature",
    description: "Request a new tool, mode, or improvement.",
    icon: Lightbulb,
  },
  {
    id: "payment",
    label: "Payment Issue",
    description: "Payment, plan, UPI, or activation problem.",
    icon: CreditCard,
  },
] as const satisfies ReadonlyArray<{
  id: ReportType;
  label: string;
  description: string;
  icon: typeof AlertTriangle;
}>;

const placeholders: Record<ReportType, { title: string; details: string }> = {
  bug: {
    title: "Chat send button is not working",
    details: "What happened? What page were you on? What did you expect instead?",
  },
  feature: {
    title: "Add a PDF study summarizer",
    details: "Describe the feature, who needs it, and how it should work.",
  },
  payment: {
    title: "My payment is pending",
    details: "Add your plan, transaction ID, payment app, and what problem you are facing.",
  },
};

export function BugReportButton() {
  const pathname = usePathname();
  const [user, setUser] = useState<User | null>(null);
  const [isAuthReady, setIsAuthReady] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const [reportType, setReportType] = useState<ReportType>("bug");
  const [title, setTitle] = useState("");
  const [details, setDetails] = useState("");
  const [status, setStatus] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const activeOption = useMemo(
    () => reportOptions.find((option) => option.id === reportType) ?? reportOptions[0],
    [reportType],
  );

  useEffect(() => {
    return onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
      setIsAuthReady(true);
    });
  }, []);

  if (pathname?.startsWith("/creator")) return null;

  function resetForm(nextType = reportType) {
    setReportType(nextType);
    setTitle("");
    setDetails("");
    setStatus("");
  }

  async function submitReport(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setStatus("");

    if (!user) {
      setStatus("Login first so the report can be linked to your account.");
      return;
    }

    setIsSubmitting(true);
    try {
      const idToken = await user.getIdToken();
      const response = await fetch("/api/reports/submit", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          idToken,
          type: reportType,
          title,
          details,
          page: typeof window === "undefined" ? pathname : window.location.href,
        }),
      });
      const data = await response.json().catch(() => ({}));

      if (!response.ok) {
        throw new Error(typeof data.error === "string" ? data.error : "Report failed.");
      }

      setStatus("Sent to creator dashboard.");
      setTitle("");
      setDetails("");
      window.setTimeout(() => {
        setIsOpen(false);
        setStatus("");
      }, 1400);
    } catch (error) {
      setStatus(error instanceof Error ? error.message : "Could not send report.");
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <>
      <button
        type="button"
        onClick={() => setIsOpen(true)}
        className="fixed bottom-4 right-4 z-50 inline-flex min-h-11 items-center gap-2 rounded-full border border-red-300/25 bg-[#091221]/95 px-4 text-sm font-semibold text-red-50 shadow-[0_18px_70px_rgba(0,0,0,0.38)] backdrop-blur-xl transition hover:border-red-200/45 hover:bg-red-400/15 sm:bottom-5 sm:right-5"
      >
        <AlertTriangle size={16} />
        Report Bug
      </button>

      {isOpen ? (
        <div className="fixed inset-0 z-[70] grid place-items-end bg-black/62 p-3 backdrop-blur-sm sm:place-items-center sm:p-5">
          <button
            type="button"
            className="absolute inset-0"
            aria-label="Close report dialog"
            onClick={() => setIsOpen(false)}
          />
          <section className="relative w-full max-w-xl overflow-hidden rounded-2xl border border-white/10 bg-[#07111f] text-white shadow-[0_30px_120px_rgba(0,0,0,0.5)]">
            <div className="flex items-start justify-between gap-4 border-b border-white/10 p-4">
              <div className="flex items-center gap-3">
                <span className="grid size-11 place-items-center rounded-xl border border-red-300/20 bg-red-400/10 text-red-100">
                  <MessageSquare size={19} />
                </span>
                <div>
                  <h2 className="text-lg font-semibold">Send feedback to creator</h2>
                  <p className="mt-1 text-sm text-slate-400">Bug reports, feature ideas, and payment issues go to the creator dashboard.</p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setIsOpen(false)}
                className="grid size-9 shrink-0 place-items-center rounded-xl border border-white/10 text-slate-300 hover:bg-white/8 hover:text-white"
                aria-label="Close report dialog"
              >
                <X size={17} />
              </button>
            </div>

            <form onSubmit={submitReport} className="p-4">
              <div className="grid gap-2 sm:grid-cols-3">
                {reportOptions.map((option) => {
                  const Icon = option.icon;
                  const active = option.id === reportType;
                  return (
                    <button
                      key={option.id}
                      type="button"
                      onClick={() => resetForm(option.id)}
                      className={`rounded-xl border p-3 text-left transition ${
                        active
                          ? "border-cyan-300/35 bg-cyan-300/12"
                          : "border-white/10 bg-white/[0.035] hover:bg-white/8"
                      }`}
                    >
                      <Icon size={17} className={active ? "text-cyan-100" : "text-slate-400"} />
                      <span className="mt-2 block text-sm font-semibold text-white">{option.label}</span>
                      <span className="mt-1 block text-xs leading-4 text-slate-500">{option.description}</span>
                    </button>
                  );
                })}
              </div>

              <div className="mt-4 grid gap-3">
                <label className="grid gap-1.5 text-sm font-medium text-slate-300">
                  Short title
                  <input
                    value={title}
                    onChange={(event) => setTitle(event.target.value)}
                    placeholder={placeholders[reportType].title}
                    className="h-11 rounded-xl border border-white/10 bg-black/25 px-3 text-white outline-none placeholder:text-slate-600 focus:border-cyan-300/50"
                    maxLength={140}
                    required
                  />
                </label>

                <label className="grid gap-1.5 text-sm font-medium text-slate-300">
                  Details
                  <textarea
                    value={details}
                    onChange={(event) => setDetails(event.target.value)}
                    placeholder={placeholders[reportType].details}
                    className="min-h-32 resize-none rounded-xl border border-white/10 bg-black/25 p-3 text-sm leading-6 text-white outline-none placeholder:text-slate-600 focus:border-cyan-300/50"
                    maxLength={3000}
                    required
                  />
                </label>
              </div>

              <div className="mt-4 flex flex-col gap-3 border-t border-white/10 pt-4 sm:flex-row sm:items-center sm:justify-between">
                <div className="min-h-5 text-sm">
                  {!isAuthReady ? (
                    <span className="text-slate-500">Checking login...</span>
                  ) : user ? (
                    <span className="text-slate-400">Sending as <span className="text-slate-200">{user.email}</span></span>
                  ) : (
                    <span className="text-amber-100">
                      Login required. <Link href="/login" className="font-semibold underline">Login</Link>
                    </span>
                  )}
                  {status ? <p className="mt-1 text-cyan-100">{status}</p> : null}
                </div>
                <button
                  type="submit"
                  disabled={isSubmitting || !user}
                  className="inline-flex min-h-11 items-center justify-center gap-2 rounded-xl bg-cyan-200 px-4 text-sm font-semibold text-slate-950 transition hover:brightness-110 disabled:cursor-not-allowed disabled:opacity-55"
                >
                  {isSubmitting ? <Loader2 size={16} className="animate-spin" /> : <Send size={16} />}
                  Send {activeOption.label}
                </button>
              </div>
            </form>
          </section>
        </div>
      ) : null}
    </>
  );
}
