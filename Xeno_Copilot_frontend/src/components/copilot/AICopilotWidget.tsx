import { useState } from "react";
import { ArrowUp, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { SuggestionChip } from "./SuggestionChip";
import { suggestedPrompts } from "@/data/mockData";
import { toast } from "sonner";
import { useNavigate } from "@tanstack/react-router";

const API = import.meta.env.VITE_API_URL || "http://localhost:3000";

export function AICopilotWidget() {
  const [value, setValue] = useState("");
  const [loading, setLoading] = useState(false);
  const [response, setResponse] = useState<string | null>(null);
  const navigate = useNavigate();

  const handleSend = async () => {
    if (!value.trim()) return;
    setLoading(true);
    setResponse(null);
    try {
      let customerStats = {};
      try {
        const statsRes = await fetch(`${API}/stats`);
        customerStats = await statsRes.json();
      } catch {}

      const res = await fetch(`${API}/ai/copilot`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          messages: [{ role: "user", content: value }],
          customerStats,
        }),
      });
      const data = await res.json();
      setResponse(data.reply);
      setValue("");
    } catch (e) {
      toast.error("Copilot failed to respond");
    } finally {
      setLoading(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <div className="rounded-xl border border-border bg-surface p-4">
      {/* Header */}
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <div className="flex h-7 w-7 items-center justify-center rounded-md bg-primary/15 text-primary">
            <Sparkles className="h-3.5 w-3.5" />
          </div>
          <div>
            <h2 className="text-sm font-semibold text-foreground">AI Copilot</h2>
            <p className="text-[11px] text-muted-foreground">Ask me anything about your customers or campaigns.</p>
          </div>
        </div>
        <button
          onClick={() => navigate({ to: "/copilot" })}
          className="text-[11px] text-primary hover:underline"
        >
          Open full chat →
        </button>
      </div>

      {/* Input row */}
      <div className="flex items-center gap-2 rounded-lg border border-border bg-background/60 px-3 py-2">
        <input
          value={value}
          onChange={(e) => setValue(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="e.g. Who are my high-value customers who haven't purchased in 90 days?"
          className="flex-1 bg-transparent text-sm text-foreground placeholder:text-muted-foreground focus:outline-none"
        />
        <Button
          size="sm"
          onClick={handleSend}
          disabled={loading || !value.trim()}
          className="h-7 w-7 shrink-0 bg-primary p-0 hover:bg-primary/90 disabled:opacity-50"
        >
          <ArrowUp className="h-3.5 w-3.5" />
        </Button>
      </div>

      {/* Suggestion chips */}
      <div className="mt-2 flex flex-wrap gap-1.5">
        {suggestedPrompts.slice(0, 3).map((p) => (
          <SuggestionChip key={p} text={p} onClick={() => setValue(p)} />
        ))}
      </div>

      {/* Inline response — compact */}
      {loading && (
        <p className="mt-3 text-xs text-muted-foreground animate-pulse flex items-center gap-1.5">
          <Sparkles className="h-3 w-3 text-primary" /> Thinking...
        </p>
      )}
      {response && !loading && (
        <div className="mt-3 rounded-lg border border-primary/20 bg-primary/5 px-3 py-2.5">
          <p className="text-xs leading-relaxed text-foreground whitespace-pre-wrap line-clamp-4">{response}</p>
          <button
            onClick={() => navigate({ to: "/copilot" })}
            className="mt-1.5 text-[11px] text-primary hover:underline"
          >
            Continue in full chat →
          </button>
        </div>
      )}
    </div>
  );
}