import { Sparkles } from "lucide-react";
import type { LucideIcon } from "lucide-react";
import { Button } from "@/components/ui/button";

export function EmptyState({ icon: Icon = Sparkles, title, description, cta, onCta }: { icon?: LucideIcon; title: string; description?: string; cta?: string; onCta?: () => void }) {
  return (
    <div className="flex flex-col items-center justify-center rounded-xl border border-dashed border-border bg-surface/50 px-6 py-12 text-center">
      <div className="mb-3 flex h-12 w-12 items-center justify-center rounded-xl bg-primary/10 text-primary">
        <Icon className="h-6 w-6" />
      </div>
      <h3 className="text-sm font-semibold text-foreground">{title}</h3>
      {description && <p className="mt-1 max-w-xs text-sm text-muted-foreground">{description}</p>}
      {cta && (
        <Button onClick={onCta} className="mt-4 bg-primary hover:bg-primary/90 text-primary-foreground">
          <Sparkles className="h-4 w-4" /> {cta}
        </Button>
      )}
    </div>
  );
}
