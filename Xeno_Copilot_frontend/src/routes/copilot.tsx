import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useRef, useState } from "react";
import { ArrowUp, Paperclip, Plus, Smile, Sparkles, Users, Send as SendIcon, BarChart3 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ChannelBadge } from "@/components/common/ChannelBadge";
import { conversations, type AIMessage, type Conversation } from "@/data/mockData";
import { relativeTime, formatINR, formatNumber } from "@/lib/format";
import { cn } from "@/lib/utils";
import { Bar, BarChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { tooltipStyle } from "./index";
import { toast } from "sonner";
import ReactMarkdown from "react-markdown";
import { generateCopilotResponse } from "@/lib/aiService";

export const Route = createFileRoute("/copilot")({
  head: () => ({
    meta: [
      { title: "AI Copilot — Xeno" },
      { name: "description", content: "Chat with your marketing copilot. Build segments, draft campaigns, analyze performance." },
    ],
  }),
  component: CopilotPage,
});

function CopilotPage() {
  const [activeId, setActiveId] = useState<string>(conversations[0].id);
  const [convoList, setConvoList] = useState<Conversation[]>(conversations);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const inputRef = useRef<HTMLTextAreaElement>(null);
  const feedRef = useRef<HTMLDivElement>(null);

  const active = convoList.find((c) => c.id === activeId)!;

  useEffect(() => { inputRef.current?.focus(); }, [activeId]);
  useEffect(() => { feedRef.current?.scrollTo({ top: feedRef.current.scrollHeight, behavior: "smooth" }); }, [active.messages.length]);

  const send = async () => {
    if (!input.trim() || isLoading) return;
    
    const userMessage: AIMessage = { id: `u-${Date.now()}`, role: "user", text: input.trim() };
    
    // Add user message immediately
    setConvoList((list) => list.map((c) => 
      c.id === activeId 
        ? { ...c, messages: [...c.messages, userMessage], preview: input.trim() } 
        : c
    ));
    
    setInput("");
    setIsLoading(true);

    try {
      // Prepare context for AI (now including the user message we just added)
      const context = [...active.messages, userMessage].map(m => ({
        role: m.role,
        content: m.text
      }));

      const aiText = await generateCopilotResponse(input.trim(), context);
      
      const aiMessage: AIMessage = { 
        id: `a-${Date.now()}`, 
        role: "assistant", 
        text: aiText 
      };

      setConvoList((list) => list.map((c) => 
        c.id === activeId 
          ? { ...c, messages: [...c.messages, aiMessage] } 
          : c
      ));
    } catch (error) {
      console.error("Error generating AI response:", error);
      const errorMessage: AIMessage = { 
        id: `a-${Date.now()}`, 
        role: "assistant", 
        text: "Sorry, I encountered an error. Please try again." 
      };
      setConvoList((list) => list.map((c) => 
        c.id === activeId 
          ? { ...c, messages: [...c.messages, errorMessage] } 
          : c
      ));
      toast.error("Failed to get AI response");
    } finally {
      setIsLoading(false);
    }
  };

  const newChat = () => {
    const id = `c-${Date.now()}`;
    setConvoList((list) => [{ id, title: "New chat", updatedAt: new Date().toISOString(), preview: "Start a new conversation", messages: [] }, ...list]);
    setActiveId(id);
    toast.success("New conversation started");
  };

  return (
    <div className="flex h-[calc(100vh-3.5rem)]">
      {/* History */}
      <aside className="w-80 shrink-0 border-r border-border bg-surface/40 p-3">
        <Button onClick={newChat} className="w-full bg-primary hover:bg-primary/90 text-primary-foreground">
          <Plus className="h-4 w-4" /> New Chat
        </Button>
        <div className="mt-4 space-y-1">
          <p className="px-2 py-1 text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">Conversations</p>
          {convoList.map((c) => (
            <button
              key={c.id}
              onClick={() => setActiveId(c.id)}
              className={cn(
                "relative w-full rounded-md px-3 py-2.5 text-left transition-colors",
                c.id === activeId ? "bg-primary/10" : "hover:bg-surface-elevated"
              )}
            >
              {c.id === activeId && <span className="absolute left-0 top-1/2 h-6 w-0.5 -translate-y-1/2 rounded-r-full bg-primary" />}
              <div className="flex items-center justify-between gap-2">
                <p className="truncate text-sm font-medium text-foreground">{c.title}</p>
                <span className="shrink-0 text-[10px] text-muted-foreground">{relativeTime(c.updatedAt)}</span>
              </div>
              <p className="mt-0.5 truncate text-xs text-muted-foreground">{c.preview}</p>
            </button>
          ))}
        </div>
      </aside>

      {/* Chat */}
      <div className="flex flex-1 flex-col">
        <div ref={feedRef} className="flex-1 overflow-y-auto px-8 py-6">
          <div className="mx-auto max-w-3xl space-y-5">
            {active.messages.length === 0 ? (
              <div className="flex h-full flex-col items-center justify-center py-20 text-center">
                <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary/15 text-primary">
                  <Sparkles className="h-6 w-6" />
                </div>
                <h2 className="mt-4 text-lg font-semibold text-foreground">How can I help you today?</h2>
                <p className="mt-1 text-sm text-muted-foreground">Ask about customers, segments, or draft a campaign.</p>
              </div>
            ) : active.messages.map((m) => <MessageBubble key={m.id} m={m} />)}
            {isLoading && (
              <div className="flex gap-3">
                <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-md bg-primary/15 text-primary">
                  <Sparkles className="h-3.5 w-3.5 animate-pulse" />
                </div>
                <div className="flex items-center space-x-2">
                  <div className="w-2 h-2 bg-primary rounded-full animate-bounce" style={{ animationDelay: "0ms" }} />
                  <div className="w-2 h-2 bg-primary rounded-full animate-bounce" style={{ animationDelay: "150ms" }} />
                  <div className="w-2 h-2 bg-primary rounded-full animate-bounce" style={{ animationDelay: "300ms" }} />
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Composer */}
        <div className="border-t border-border bg-background/80 p-4 backdrop-blur">
          <div className="mx-auto max-w-3xl">
            <div className="mb-2 flex flex-wrap gap-2">
              {["Compare last 2 campaigns", "Show top spenders this month", "Draft a follow-up SMS"].map((p) => (
                <button key={p} onClick={() => setInput(p)} className="rounded-full border border-border bg-surface px-3 py-1 text-xs text-muted-foreground hover:border-primary/40 hover:text-foreground">
                  {p}
                </button>
              ))}
            </div>
            <div className="rounded-xl border border-border bg-surface p-3">
              <textarea
                ref={inputRef}
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => { if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); send(); } }}
                rows={1}
                placeholder="Ask Copilot anything…"
                disabled={isLoading}
                className="w-full resize-none bg-transparent text-sm text-foreground placeholder:text-muted-foreground focus:outline-none disabled:opacity-50"
              />
              <div className="mt-2 flex items-center justify-between">
                <div className="flex gap-1">
                  <button className="rounded-md p-1.5 text-muted-foreground hover:bg-surface-elevated hover:text-foreground disabled:opacity-50" disabled={isLoading}><Paperclip className="h-4 w-4" /></button>
                  <button className="rounded-md p-1.5 text-muted-foreground hover:bg-surface-elevated hover:text-foreground disabled:opacity-50" disabled={isLoading}><Smile className="h-4 w-4" /></button>
                </div>
                <Button size="sm" onClick={send} className="h-8 w-8 bg-primary p-0 hover:bg-primary/90" disabled={isLoading}>
                  {isLoading ? (
                    <div className="w-4 h-4 border-2 border-primary-foreground border-t-transparent rounded-full animate-spin" />
                  ) : (
                    <ArrowUp className="h-4 w-4" />
                  )}
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function MessageBubble({ m }: { m: AIMessage }) {
  if (m.role === "user") {
    return (
      <div className="flex justify-end">
        <div className="max-w-[80%] rounded-2xl rounded-tr-sm bg-primary px-4 py-2.5 text-sm text-primary-foreground">{m.text}</div>
      </div>
    );
  }
  return (
    <div className="flex gap-3">
      <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-md bg-primary/15 text-primary">
        <Sparkles className="h-3.5 w-3.5" />
      </div>
      <div className="flex-1 space-y-3">
        <div className="text-sm leading-relaxed text-foreground prose prose-invert max-w-none">
          <ReactMarkdown>{m.text}</ReactMarkdown>
        </div>
        {m.type === "segment" && <SegmentPreviewCard data={m.data} />}
        {m.type === "campaign" && <CampaignDraftCard data={m.data} />}
        {m.type === "chart" && <AnalyticsInsightCard data={m.data} />}
      </div>
    </div>
  );
}

function SegmentPreviewCard({ data }: { data: any }) {
  return (
    <div className="rounded-xl border border-border bg-surface p-4">
      <div className="flex items-center gap-2">
        <Users className="h-4 w-4 text-primary" />
        <p className="text-sm font-semibold text-foreground">Segment Preview</p>
      </div>
      <div className="mt-3 grid grid-cols-3 gap-3">
        <Stat label="Customers" value={formatNumber(data.count)} />
        <Stat label="Avg. Spend" value={formatINR(data.avgSpend)} />
        <Stat label="Top City" value={data.topCity} />
      </div>
      <div className="mt-3 flex flex-wrap gap-1.5">
        {data.filters.map((f: string) => (
          <span key={f} className="rounded-md border border-border bg-background px-2 py-0.5 text-[11px] text-muted-foreground">{f}</span>
        ))}
      </div>
      <div className="mt-3 flex gap-2">
        <Button size="sm" onClick={() => toast.success("Segment saved")} className="h-8 bg-primary hover:bg-primary/90 text-primary-foreground">Create Segment</Button>
        <Button size="sm" variant="outline" onClick={() => toast.success("Launching campaign…")} className="h-8 border-border bg-transparent hover:bg-surface-elevated">Launch Campaign</Button>
      </div>
    </div>
  );
}

function CampaignDraftCard({ data }: { data: any }) {
  return (
    <div className="rounded-xl border border-border bg-surface p-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <SendIcon className="h-4 w-4 text-primary" />
          <p className="text-sm font-semibold text-foreground">Campaign Draft</p>
        </div>
        <ChannelBadge channel={data.channel} />
      </div>
      <div className="mt-3 rounded-lg border border-border bg-background p-3 text-sm leading-relaxed text-foreground">
        {data.body}
      </div>
      <div className="mt-3 flex gap-2">
        <Button size="sm" variant="outline" onClick={() => toast.success("Opening editor…")} className="h-8 border-border bg-transparent hover:bg-surface-elevated">Edit Draft</Button>
        <Button size="sm" onClick={() => toast.success("Campaign launched")} className="h-8 bg-primary hover:bg-primary/90 text-primary-foreground">Send Campaign</Button>
        <Button size="sm" variant="ghost" onClick={() => toast.success("A/B test created")} className="h-8 text-primary hover:bg-primary/10">A/B Test</Button>
      </div>
    </div>
  );
}

function AnalyticsInsightCard({ data }: { data: any }) {
  return (
    <div className="rounded-xl border border-border bg-surface p-4">
      <div className="flex items-center gap-2">
        <BarChart3 className="h-4 w-4 text-primary" />
        <p className="text-sm font-semibold text-foreground">Channel Open Rate</p>
      </div>
      <div className="mt-3 h-44">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={data} margin={{ top: 4, right: 4, left: -16, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#2A2A38" vertical={false} />
            <XAxis dataKey="ch" stroke="#5A5A72" fontSize={11} tickLine={false} axisLine={false} />
            <YAxis stroke="#5A5A72" fontSize={11} tickLine={false} axisLine={false} />
            <Tooltip contentStyle={tooltipStyle} formatter={(v: any) => `${v}%`} />
            <Bar dataKey="rate" fill="#6366F1" radius={[6, 6, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-lg border border-border bg-background p-2.5">
      <p className="text-[10px] font-medium uppercase tracking-wider text-muted-foreground">{label}</p>
      <p className="mt-0.5 text-sm font-semibold text-foreground">{value}</p>
    </div>
  );
}
