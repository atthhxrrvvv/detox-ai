import { Footer } from "@/components/Footer";
import { PricingGrid } from "@/components/PricingGrid";
import { SiteNav } from "@/components/SiteNav";

export default function PricingPage() {
  return (
    <>
      <SiteNav />
      <main className="px-4 py-16 sm:px-6">
        <section className="mx-auto max-w-7xl">
          <p className="text-sm font-semibold uppercase tracking-[0.25em] text-cyan-200">Plans</p>
          <h1 className="mt-3 text-4xl font-semibold text-white sm:text-5xl">Professional Detox AI pricing</h1>
          <p className="mt-4 max-w-2xl text-slate-400">A serious mid-range pricing ladder: Go for daily users, Pro as the highlighted best value, Premium for creators, and Ultimate for heavy users and teams.</p>
          <div className="mt-10">
            <PricingGrid />
          </div>
        </section>
      </main>
      <Footer />
    </>
  );
}
