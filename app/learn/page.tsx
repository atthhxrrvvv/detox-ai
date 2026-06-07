import { Footer } from "@/components/Footer";
import { LearningPaths } from "@/components/LearningPaths";
import { SiteNav } from "@/components/SiteNav";

export default function LearnPage() {
  return (
    <>
      <SiteNav />
      <main className="pb-20 pt-6">
        <LearningPaths />
      </main>
      <Footer />
    </>
  );
}
