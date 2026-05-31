import { ModelCard } from "@/components/ModelCard";
import { PageShell } from "@/components/PageShell";
import { DETOX_MODELS } from "@/lib/models";

export default function CreatorModelsPage() {
  return (
    <PageShell eyebrow="Creator" title="Model manager" description="Edit Detox model names, access levels, backend mapping, max tokens, enabled state, and system prompts.">
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {DETOX_MODELS.map((model) => (
          <ModelCard key={model.id} model={model} />
        ))}
      </div>
    </PageShell>
  );
}

