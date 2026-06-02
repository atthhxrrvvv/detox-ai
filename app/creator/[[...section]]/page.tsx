import { CreatorDashboard } from "@/components/CreatorDashboard";

export default async function CreatorPage({
  params,
}: {
  params: Promise<{ section?: string[] }>;
}) {
  const resolvedParams = await params;
  return <CreatorDashboard section={resolvedParams.section?.[0] ?? "overview"} />;
}
