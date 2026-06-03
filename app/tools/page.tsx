import { Footer } from "@/components/Footer";
import { SiteNav } from "@/components/SiteNav";
import { ToolGrid } from "@/components/ToolGrid";

export default function ToolsPage() {
  return (
    <>
      <SiteNav />
      <main className="px-4 pb-28 pt-10 sm:px-6 sm:py-16">
        <section className="mx-auto max-w-7xl">
          <p className="text-xs font-semibold uppercase tracking-[0.24em] text-cyan-200 sm:text-sm">AI Tools</p>
          <h1 className="mt-3 max-w-4xl text-3xl font-semibold leading-tight text-white sm:text-5xl">
            A sharper AI tool desk for phone and desktop
          </h1>
          <p className="mt-4 max-w-2xl text-sm leading-6 text-slate-400 sm:text-base">
            Search a tool, add your details, generate with Groq, then copy or save the result without fighting the mobile layout.
          </p>
          <div className="mt-7 sm:mt-10">
            <ToolGrid />
          </div>
        </section>
      </main>
      <Footer />
    </>
  );
}
