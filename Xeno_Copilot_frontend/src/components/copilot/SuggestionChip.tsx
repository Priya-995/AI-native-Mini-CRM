import { Sparkles } from "lucide-react";

export function SuggestionChip({ text, onClick }: { text: string; onClick?: () => void }) {
  return (
    <button
      onClick={onClick}
      className="inline-flex items-center gap-1.5 rounded-full border border-border bg-surface px-3 py-1.5 text-xs font-medium text-muted-foreground hover:border-primary/40 hover:bg-primary/5 hover:text-foreground"
    >
      <Sparkles className="h-3 w-3 text-primary" />
      {text}
    </button>
  );
}
