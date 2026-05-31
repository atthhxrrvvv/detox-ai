import Link from "next/link";
import { Crown, Menu, Sparkles, UserRound } from "lucide-react";
import { AppLogo } from "@/components/AppLogo";

const navItems = [
  { href: "/chat", label: "Chat" },
  { href: "/tools", label: "Tools" },
  { href: "/pricing", label: "Pricing" },
  { href: "/creator", label: "Creator" },
];

export function SiteNav() {
  return (
    <header className="sticky top-0 z-50 border-b border-white/10 bg-[#030712]/78 backdrop-blur-xl">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6">
        <Link href="/" className="flex items-center gap-3">
          <AppLogo size={42} className="rounded-xl" />
          <span>
            <span className="block text-base font-semibold text-white">Detox AI</span>
            <span className="hidden text-xs text-slate-400 sm:block">Clean thinking. Powerful answers.</span>
          </span>
        </Link>

        <nav className="hidden items-center gap-1 md:flex">
          {navItems.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="rounded-full px-4 py-2 text-sm text-slate-300 transition hover:bg-white/8 hover:text-white"
            >
              {item.label}
            </Link>
          ))}
        </nav>

        <div className="flex items-center gap-2">
          <Link
            href="/login"
            className="hidden rounded-full px-4 py-2 text-sm font-medium text-slate-300 transition hover:text-white sm:inline-flex"
          >
            Login
          </Link>
          <Link
            href="/login"
            className="inline-flex items-center gap-2 rounded-full bg-white px-4 py-2 text-sm font-semibold text-slate-950 transition hover:bg-cyan-100"
          >
            <Sparkles size={16} />
            Start
          </Link>
          <Link
            href="/pricing"
            className="hidden items-center gap-2 rounded-full border border-amber-300/35 bg-amber-300/10 px-4 py-2 text-sm font-semibold text-amber-100 transition hover:bg-amber-300/15 lg:inline-flex"
          >
            <Crown size={16} />
            Premium
          </Link>
          <Link
            href="/profile"
            className="grid size-10 place-items-center rounded-full border border-white/10 text-slate-200 transition hover:bg-white/8"
            aria-label="Profile"
          >
            <UserRound size={17} />
          </Link>
          <button className="grid size-10 place-items-center rounded-full border border-white/10 text-slate-200 md:hidden" aria-label="Open menu">
            <Menu size={18} />
          </button>
        </div>
      </div>
    </header>
  );
}
