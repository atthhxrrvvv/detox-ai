import Link from "next/link";
import { CREATOR_EMAIL, CREATOR_UPI_ID } from "@/lib/constants";

export function Footer() {
  return (
    <footer className="border-t border-white/10 bg-[#030712]/80">
      <div className="mx-auto grid max-w-7xl gap-8 px-4 py-10 sm:px-6 md:grid-cols-[1.2fr_0.8fr_0.8fr]">
        <div>
          <p className="text-lg font-semibold text-white">Detox AI</p>
          <p className="mt-3 max-w-md text-sm leading-6 text-slate-400">
            A creator-built AI workspace for students, coders, creators, business owners, and power users.
          </p>
          <p className="mt-4 text-sm text-slate-500">Creator: {CREATOR_EMAIL}</p>
          <p className="text-sm text-slate-500">Manual UPI: {CREATOR_UPI_ID}</p>
        </div>
        <div>
          <p className="font-semibold text-white">Product</p>
          <div className="mt-3 grid gap-2 text-sm text-slate-400">
            <Link href="/chat">Chat</Link>
            <Link href="/tools">AI Tools</Link>
            <Link href="/pricing">Pricing</Link>
            <Link href="/payment">Payment</Link>
          </div>
        </div>
        <div>
          <p className="font-semibold text-white">Legal</p>
          <div className="mt-3 grid gap-2 text-sm text-slate-400">
            <Link href="/privacy">Privacy</Link>
            <Link href="/terms">Terms</Link>
            <Link href="/refund">Refund</Link>
            <Link href="/contact">Contact</Link>
          </div>
        </div>
      </div>
    </footer>
  );
}

