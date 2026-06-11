import { useState } from "react";
import { ArrowUp, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { SuggestionChip } from "./SuggestionChip";
import { suggestedPrompts } from "@/data/mockData";
import { toast } from "sonner";

export function AICopilotWidget() {
  const [value, setValue] = useState("");

  return (
    <div className="rounded-xl border border-border bg-gradient-to-br from-surface to-surface/40 p-6">
      <div className="flex items-start gap-3">
        <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary/15 text-primary">
          <Sparkles className="h-4.5 w-4.5" />
        </div>
        <div className="flex-1">
          <h2 className="text-base font-semibold tracking-tight text-foreground">AI Copilot</h2>
          <p className="mt-0.5 text-sm text-muted-foreground">Ask me anything about your customers, campaigns, or next move.</p>
        </div>
      </div>

      <div className="mt-4 rounded-lg border border-border bg-background/60 p-3">
        <textarea
          value={value}
          onChange={(e) => setValue(e.target.value)}
          rows={2}
          placeholder="e.g. Who are my high-value customers who haven't purchased in 90 days?"
          className="w-full resize-none bg-transparent text-sm text-foreground placeholder:text-muted-foreground focus:outline-none"
        />
        <div className="mt-2 flex items-center justify-between">
          <div className="flex flex-wrap gap-2">
            {suggestedPrompts.map((p) => (
              <SuggestionChip key={p} text={p} onClick={() => setValue(p)} />
            ))}
          </div>
          <Button
            size="sm"
            onClick={() => { toast.success("Sent to Copilot"); setValue(""); }}
            className="h-8 w-8 shrink-0 bg-primary p-0 hover:bg-primary/90"
          >
            <ArrowUp className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {/* Inline AI response */}
      <div className="mt-4 rounded-lg border border-primary/20 bg-primary/5 p-4">
        <div className="flex items-start gap-3">
          <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-md bg-primary/20 text-primary">
            <Sparkles className="h-3.5 w-3.5" />
          </div>
          <div className="flex-1">
            <p className="text-sm leading-relaxed text-foreground">
              I found <span className="font-semibold text-primary">1,243 customers</span> who spent ₹5,000+ but haven't ordered in 90 days. Want me to create a segment and draft a WhatsApp message for them?
            </p>
            <div className="mt-3 flex gap-2">
              <Button size="sm" variant="ghost" onClick={() => toast.success("Segment created")} className="h-8 text-primary hover:bg-primary/10 hover:text-primary">
                Create Segment →
              </Button>
              <Button size="sm" variant="ghost" onClick={() => toast.success("Draft created")} className="h-8 text-primary hover:bg-primary/10 hover:text-primary">
                Draft Message →
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
