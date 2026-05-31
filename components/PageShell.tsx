import { Footer } from "@/components/Footer";
import { SiteNav } from "@/components/SiteNav";

export function PageShell({
  eyebrow,
  title,
  description,
  children,
}: {
  eyebrow: string;
  title: string;
  description: string;
  children?: React.ReactNode;
}) {
  return (
    <>
      <SiteNav />
      <main className="px-4 py-16 sm:px-6">
        <section className="mx-auto max-w-7xl">
          <p className="text-sm font-semibold uppercase tracking-[0.25em] text-cyan-200">{eyebrow}</p>
          <h1 className="mt-3 text-4xl font-semibold text-white sm:text-5xl">{title}</h1>
          <p className="mt-4 max-w-3xl text-slate-400">{description}</p>
          <div className="mt-10">{children}</div>
        </section>
      </main>
      <Footer />
    </>
  );
}

