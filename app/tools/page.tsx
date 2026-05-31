import { Footer } from "@/components/Footer";
import { SiteNav } from "@/components/SiteNav";
import { ToolGrid } from "@/components/ToolGrid";

export default function ToolsPage() {
  return (
    <>
      <SiteNav />
      <main className="px-4 py-16 sm:px-6">
        <section className="mx-auto max-w-7xl">
          <p className="text-sm font-semibold uppercase tracking-[0.25em] text-cyan-200">AI Tools</p>
          <h1 className="mt-3 text-4xl font-semibold text-white sm:text-5xl">Build, write, study, debug, and plan</h1>
          <p className="mt-4 max-w-2xl text-slate-400">Pick a tool, add your details, and generate a real Detox AI output with copy and save actions.</p>
          <div className="mt-10">
            <ToolGrid />
          </div>
        </section>
      </main>
      <Footer />
    </>
  );
}
