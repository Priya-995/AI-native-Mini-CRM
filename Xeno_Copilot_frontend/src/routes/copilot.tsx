import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect, useRef, useState } from "react";
import {
  ArrowUp, Paperclip, Plus, Smile, Sparkles,
  Users, Send as SendIcon, BarChart3, Zap, TrendingUp
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { ChannelBadge } from "@/components/common/ChannelBadge";
import { relativeTime, formatINR, formatNumber } from "@/lib/format";
import { cn } from "@/lib/utils";
import { Bar, BarChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { tooltipStyle } from "./index";
import { toast } from "sonner";
import ReactMarkdown from "react-markdown";
import { copilotStore } from "@/components/copilot/AICopilotWidget";

const API = import.meta.env.VITE_API_URL || "http://localhost:3000";
const GROQ_KEY = import.meta.env.VITE_GROQ_API_KEY;

export const Route = createFileRoute("/copilot")({
  head: () => ({ meta: [{ title: "AI Copilot — Xeno" }] }),
  component: CopilotPage,
});

// ── Types ──────────────────────────────────────────────────────────
interface Msg {
  id: string;
  role: "user" | "assistant";
  text: string;
  card?: { type: "segment"; data: any } | { type: "campaign"; data: any } | { type: "chart"; data: any[] } | { type: "launch"; data: any };
}

interface Convo {
  id: string;
  title: string;
  preview: string;
  updatedAt: string;
  messages: Msg[];
}

const SESSION_KEY = "xeno_copilot_convos";

function loadConvos(): Convo[] {
  try {
    const saved = sessionStorage.getItem(SESSION_KEY);
    if (saved) return JSON.parse(saved);
  } catch {}
  return makeSeededConvos();
}

function saveConvos(convos: Convo[]) {
  try {
    sessionStorage.setItem(SESSION_KEY, JSON.stringify(convos));
  } catch {}
}

// ── AI call ───────────────────────────────────────────────────────
async function callGroq(messages: { role: string; content: string }[]) {
  const res = await fetch("https://api.groq.com/openai/v1/chat/completions", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${GROQ_KEY}`,
    },
    body: JSON.stringify({
      model: "llama-3.3-70b-versatile",
      messages,
      max_tokens: 800,
    }),
  });
  const data = await res.json();
  return data.choices[0].message.content.trim() as string;
}

// ── Build a rich system prompt with live data ─────────────────────
async function buildSystemPrompt() {
  let customers: any[] = [];
  let campaigns: any[] = [];
  let stats: any = {};
  try {
    [customers, campaigns, stats] = await Promise.all([
      fetch(`${API}/customers`).then((r) => r.json()),
      fetch(`${API}/campaigns`).then((r) => r.json()),
      fetch(`${API}/stats`).then((r) => r.json()),
    ]);
  } catch {}

  const segmentCounts = customers.reduce((acc: any, c: any) => {
    acc[c.segment] = (acc[c.segment] || 0) + 1;
    return acc;
  }, {});

  const channelCounts = customers.reduce((acc: any, c: any) => {
    acc[c.preferred_channel] = (acc[c.preferred_channel] || 0) + 1;
    return acc;
  }, {});

  const topSpenders = [...customers]
    .sort((a, b) => b.total_spend - a.total_spend)
    .slice(0, 5)
    .map((c) => `${c.name} (${c.city}, ₹${c.total_spend.toLocaleString()}, ${c.segment})`);

  const atRisk = customers.filter((c) => c.segment === "at-risk").length;
  const lapsed = customers.filter((c) => c.segment === "lapsed").length;

  const campaignSummary = campaigns
    .slice(0, 6)
    .map((c: any) => `"${c.name}" (${c.channel}, ${c.segment_filter}, sent:${c.sent}, opened:${c.opened}, clicked:${c.clicked}, status:${c.status})`)
    .join("; ");

  return `You are Xeno Copilot, an expert AI assistant embedded in a CRM for Indian consumer brands.
You have LIVE access to this brand's actual data RIGHT NOW. Always analyze this data before responding.

## LIVE DATA SNAPSHOT
- Total customers: ${stats.totalCustomers || customers.length}
- Total revenue attributed: ₹${(stats.totalRevenue || 0).toLocaleString()}
- Active campaigns: ${stats.activeCampaigns || 0}
- Avg open rate: ${stats.avgOpenRate || 0}%

## CUSTOMER SEGMENTS
${Object.entries(segmentCounts).map(([k, v]) => `- ${k}: ${v} customers`).join("\n")}

## PREFERRED CHANNELS
${Object.entries(channelCounts).map(([k, v]) => `- ${k}: ${v} customers`).join("\n")}

## TOP 5 SPENDERS
${topSpenders.join("\n")}

## AT-RISK & LAPSED
- At-risk customers: ${atRisk} (high churn probability)
- Lapsed customers: ${lapsed} (haven't purchased in 90+ days)

## RECENT CAMPAIGNS
${campaignSummary || "No campaigns yet"}

## INSTRUCTIONS
- Always reference the ACTUAL numbers above. NEVER make up data.
- When asked about segments, use the real segment counts above.
- When drafting campaigns, personalize based on the segment data.
- When asked about performance, analyze the real campaign metrics above.
- Give specific, actionable recommendations with ₹ figures and percentages from the real data.
- Be concise and marketing-focused. No fluff.
- If the user asks to create/launch a campaign, output EXACTLY this JSON block on a new line (after your text):
  CAMPAIGN_JSON:{"name":"...","channel":"whatsapp|sms|email|rcs","segment":"vip|loyal|at-risk|new|lapsed|all","message":"..."}
- If the user asks to find/show a segment, output EXACTLY this JSON block on a new line:
  SEGMENT_JSON:{"segment":"vip|loyal|at-risk|new|lapsed","description":"..."}`;
}

// ── Parse AI response for special cards ───────────────────────────
function parseResponse(
  text: string,
  customers: any[],
  campaigns: any[]
): { cleanText: string; card?: Msg["card"] } {
  // Campaign creation card
  const campaignMatch = text.match(/CAMPAIGN_JSON:(\{[^}]+\})/);
  if (campaignMatch) {
    try {
      const data = JSON.parse(campaignMatch[1]);
      const cleanText = text.replace(/CAMPAIGN_JSON:\{[^}]+\}/, "").trim();
      return { cleanText, card: { type: "campaign", data } };
    } catch {}
  }

  // Segment card
  const segmentMatch = text.match(/SEGMENT_JSON:(\{[^}]+\})/);
  if (segmentMatch) {
    try {
      const data = JSON.parse(segmentMatch[1]);
      const matched = customers.filter((c) =>
        data.segment === "all" ? true : c.segment === data.segment
      );
      const avgSpend = matched.reduce((s, c) => s + c.total_spend, 0) / (matched.length || 1);
      const cityCounts = matched.reduce((acc: any, c) => {
        acc[c.city] = (acc[c.city] || 0) + 1;
        return acc;
      }, {});
      const topCity = Object.entries(cityCounts).sort((a: any, b: any) => b[1] - a[1])[0]?.[0] || "—";
      const cleanText = text.replace(/SEGMENT_JSON:\{[^}]+\}/, "").trim();
      return {
        cleanText,
        card: {
          type: "segment",
          data: {
            segment: data.segment,
            count: matched.length,
            avgSpend: Math.round(avgSpend),
            topCity,
            description: data.description,
          },
        },
      };
    } catch {}
  }

  // Channel performance chart — auto-attach when channels are discussed
  if (
    text.toLowerCase().includes("channel") &&
    text.toLowerCase().includes("%") &&
    campaigns.length > 0
  ) {
    const byChannel: Record<string, { sent: number; opened: number }> = {};
    campaigns.forEach((c: any) => {
      if (!byChannel[c.channel]) byChannel[c.channel] = { sent: 0, opened: 0 };
      byChannel[c.channel].sent += c.sent || 0;
      byChannel[c.channel].opened += c.opened || 0;
    });
    const chartData = Object.entries(byChannel).map(([ch, v]) => ({
      ch: ch.charAt(0).toUpperCase() + ch.slice(1),
      rate: v.sent > 0 ? Math.round((v.opened / v.sent) * 100) : 0,
    }));
    if (chartData.length > 0) {
      return { cleanText: text, card: { type: "chart", data: chartData } };
    }
  }

  return { cleanText: text };
}

// ── Initial seeded conversations with real-looking structure ──────
function makeSeededConvos(): Convo[] {
  return [
    {
      id: "seed-1",
      title: "Win-back lapsed VIPs",
      preview: "Find customers who bought twice last quarter...",
      updatedAt: new Date(Date.now() - 1 * 24 * 3600000).toISOString(),
      messages: [
        { id: "s1-u1", role: "user", text: "Find customers who bought twice last quarter but haven't ordered in 60 days" },
        { id: "s1-a1", role: "assistant", text: "Loading live data...", card: undefined },
      ],
    },
    {
      id: "seed-2",
      title: "Diwali campaign ideas",
      preview: "Draft 3 variants targeting beauty buyers...",
      updatedAt: new Date(Date.now() - 2 * 24 * 3600000).toISOString(),
      messages: [
        { id: "s2-u1", role: "user", text: "Draft 3 campaign message variants for Diwali targeting our VIP customers" },
        { id: "s2-a1", role: "assistant", text: "Loading live data...", card: undefined },
      ],
    },
    {
      id: "seed-3",
      title: "ROI by segment this month",
      preview: "Which segment drove the most revenue per s...",
      updatedAt: new Date(Date.now() - 3 * 24 * 3600000).toISOString(),
      messages: [
        { id: "s3-u1", role: "user", text: "Which segment drove the most revenue per send in our last campaigns?" },
        { id: "s3-a1", role: "assistant", text: "Loading live data...", card: undefined },
      ],
    },
    {
      id: "seed-4",
      title: "Churn risk for VIPs",
      preview: "Identify VIPs with declining engagement",
      updatedAt: new Date(Date.now() - 5 * 24 * 3600000).toISOString(),
      messages: [
        { id: "s4-u1", role: "user", text: "Identify VIPs with declining engagement and suggest a win-back strategy" },
        { id: "s4-a1", role: "assistant", text: "Loading live data...", card: undefined },
      ],
    },
  ];
}

// ── Main component ────────────────────────────────────────────────
function CopilotPage() {
  const navigate = useNavigate();
 const [convos, setConvos] = useState<Convo[]>(() => loadConvos());
const [activeId, setActiveId] = useState<string>(() => loadConvos()[0]?.id || "");
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [liveData, setLiveData] = useState<{ customers: any[]; campaigns: any[] }>({ customers: [], campaigns: [] });
  const inputRef = useRef<HTMLTextAreaElement>(null);
  const feedRef = useRef<HTMLDivElement>(null);

  // Load live data once
  useEffect(() => {
    Promise.all([
      fetch(`${API}/customers`).then((r) => r.json()).catch(() => []),
      fetch(`${API}/campaigns`).then((r) => r.json()).catch(() => []),
    ]).then(([customers, campaigns]) => {
      setLiveData({ customers, campaigns });
      // Now hydrate seeded convos with real AI responses
      hydrateSeededConvos(customers, campaigns);
    });
  }, []);

  // Hydrate seeded conversations with real AI responses
  const hydrateSeededConvos = async (customers: any[], campaigns: any[]) => {
    const systemPrompt = await buildSystemPrompt();
    setConvos((prev) =>
      prev.map((c) => {
        if (!c.id.startsWith("seed-")) return c;
        const firstUserMsg = c.messages.find((m) => m.role === "user");
        if (!firstUserMsg) return c;
        // Trigger async hydration
        callGroq([
          { role: "system", content: systemPrompt },
          { role: "user", content: firstUserMsg.text },
        ]).then((aiText) => {
          const { cleanText, card } = parseResponse(aiText, customers, campaigns);
          setConvos((prev2) =>
            prev2.map((c2) =>
              c2.id === c.id
                ? {
                    ...c2,
                    messages: [
                      c2.messages[0],
                      { id: `${c.id}-a1-hydrated`, role: "assistant", text: cleanText, card },
                    ],
                  }
                : c2
            )
          );
        }).catch(() => {});
        return c;
      })
    );
  };
// Save to sessionStorage whenever convos change
useEffect(() => { saveConvos(convos); }, [convos]);

// Pick up conversation passed from Dashboard widget
useEffect(() => {
  const pending = copilotStore.pendingConvo;
  if (!pending) return;
  copilotStore.pendingConvo = undefined;

  const newConvo: Convo = {
    id: pending.id,
    title: pending.title,
    preview: pending.preview,
    updatedAt: pending.updatedAt,
    messages: [
      { id: `${pending.id}-u`, role: "user", text: pending.userText },
      { id: `${pending.id}-a`, role: "assistant", text: pending.aiReply },
    ],
  };
  

  setConvos((prev) => {
    const updated = [newConvo, ...prev];
    saveConvos(updated);
    return updated;
  });
  setActiveId(pending.id);
}, []);
 

  const active = convos.find((c) => c.id === activeId) || convos[0];

 
  useEffect(() => { inputRef.current?.focus(); }, [activeId]);
  useEffect(() => {
    feedRef.current?.scrollTo({ top: feedRef.current.scrollHeight, behavior: "smooth" });
  }, [active?.messages.length, isLoading]);

  const sendMessage = async (overrideText?: string) => {
    const text = (overrideText || input).trim();
    if (!text || isLoading) return;

    const userMsg: Msg = { id: `u-${Date.now()}`, role: "user", text };
    let targetId = activeId;

    // If sending on a seeded convo that has real messages, or start fresh
    const isNewOrSeeded = active.messages.length === 0 || active.id.startsWith("seed-");

    if (active.messages.length === 0) {
      // Already on blank convo
    } else if (active.id.startsWith("seed-") && active.messages.length <= 2) {
      // Append to seeded convo
    }

    setConvos((prev) =>
      prev.map((c) =>
        c.id === targetId
          ? {
              ...c,
              title: c.messages.length === 0 ? text.slice(0, 40) : c.title,
              preview: text.slice(0, 50),
              updatedAt: new Date().toISOString(),
              messages: [...c.messages, userMsg],
            }
          : c
      )
    );
    setInput("");
    setIsLoading(true);

    try {
      const systemPrompt = await buildSystemPrompt();
      const history = [
        { role: "system", content: systemPrompt },
        ...active.messages.map((m) => ({ role: m.role, content: m.text })),
        { role: "user", content: text },
      ];

      const aiText = await callGroq(history);
      const { cleanText, card } = parseResponse(aiText, liveData.customers, liveData.campaigns);

      const aiMsg: Msg = { id: `a-${Date.now()}`, role: "assistant", text: cleanText, card };
      setConvos((prev) =>
        prev.map((c) =>
          c.id === targetId
            ? { ...c, messages: [...c.messages, aiMsg] }
            : c
        )
      );
    } catch {
      toast.error("AI response failed");
    } finally {
      setIsLoading(false);
    }
  };

  const newChat = () => {
    const id = `c-${Date.now()}`;
    const blank: Convo = {
      id,
      title: "New chat",
      preview: "Start a new conversation",
      updatedAt: new Date().toISOString(),
      messages: [],
    };
    setConvos((prev) => [blank, ...prev]);
    setActiveId(id);
  };

  const launchCampaignFromCard = async (data: any) => {
    try {
      const createRes = await fetch(`${API}/campaigns`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: data.name,
          message: data.message,
          channel: data.channel,
          segment_filter: data.segment,
        }),
      });
      const campaign = await createRes.json();
      await fetch(`${API}/campaigns/${campaign.id}/launch`, { method: "POST" });
      toast.success(`✅ Campaign "${data.name}" launched!`);

      // Add confirmation message to chat
      const confirmMsg: Msg = {
        id: `a-confirm-${Date.now()}`,
        role: "assistant",
        text: `Campaign **"${data.name}"** has been launched to your **${data.segment}** customers via ${data.channel.toUpperCase()}. Go to the Campaigns page to watch delivery stats update in real time.`,
      };
      setConvos((prev) =>
        prev.map((c) =>
          c.id === activeId ? { ...c, messages: [...c.messages, confirmMsg] } : c
        )
      );
    } catch {
      toast.error("Failed to launch campaign");
    }
  };

  const quickPrompts = [
    "Which segment has the highest churn risk?",
    "Compare performance of my last 3 campaigns",
    "Draft a WhatsApp win-back for lapsed customers",
    "Show me top spenders in Delhi",
  ];

  return (
    <div className="flex h-[calc(100vh-3.5rem)]">
      {/* Sidebar */}
      <aside className="w-72 shrink-0 border-r border-border bg-surface/40 flex flex-col">
        <div className="p-3">
          <Button onClick={newChat} className="w-full bg-primary hover:bg-primary/90 text-primary-foreground">
            <Plus className="h-4 w-4" /> New Chat
          </Button>
        </div>
        <div className="flex-1 overflow-y-auto px-2 pb-3">
          <p className="px-2 py-1 text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
            Conversations
          </p>
          {convos.map((c) => (
            <button
              key={c.id}
              onClick={() => setActiveId(c.id)}
              className={cn(
                "relative w-full rounded-md px-3 py-2.5 text-left transition-colors mb-0.5",
                c.id === activeId ? "bg-primary/10" : "hover:bg-surface-elevated"
              )}
            >
              {c.id === activeId && (
                <span className="absolute left-0 top-1/2 h-6 w-0.5 -translate-y-1/2 rounded-r-full bg-primary" />
              )}
              <div className="flex items-center justify-between gap-2">
                <p className="truncate text-sm font-medium text-foreground">{c.title}</p>
                <span className="shrink-0 text-[10px] text-muted-foreground">{relativeTime(c.updatedAt)}</span>
              </div>
              <p className="mt-0.5 truncate text-xs text-muted-foreground">{c.preview}</p>
            </button>
          ))}
        </div>
      </aside>

      {/* Chat area */}
      <div className="flex flex-1 flex-col min-w-0">
        <div ref={feedRef} className="flex-1 overflow-y-auto px-8 py-6">
          <div className="mx-auto max-w-3xl space-y-6">
            {active.messages.length === 0 ? (
              <EmptyState onPrompt={(p) => { setInput(p); sendMessage(p); }} />
            ) : (
              active.messages.map((m) => (
                <MessageBubble
                  key={m.id}
                  m={m}
                  onLaunch={launchCampaignFromCard}
                  onSegmentFilter={(seg) => sendMessage(`Show me all ${seg} customers and what we should do with them`)}
                />
              ))
            )}
            {isLoading && <TypingIndicator />}
          </div>
        </div>

        {/* Composer */}
        <div className="border-t border-border bg-background/80 p-4 backdrop-blur shrink-0">
          <div className="mx-auto max-w-3xl">
            {active.messages.length === 0 && (
              <div className="mb-3 flex flex-wrap gap-2">
                {quickPrompts.map((p) => (
                  <button
                    key={p}
                    onClick={() => sendMessage(p)}
                    className="rounded-full border border-border bg-surface px-3 py-1 text-xs text-muted-foreground hover:border-primary/40 hover:text-foreground transition-colors"
                  >
                    {p}
                  </button>
                ))}
              </div>
            )}
            <div className="rounded-xl border border-border bg-surface p-3">
              <textarea
                ref={inputRef}
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); sendMessage(); }
                }}
                rows={1}
                placeholder="Ask about your customers, campaigns, or draft a message…"
                disabled={isLoading}
                className="w-full resize-none bg-transparent text-sm text-foreground placeholder:text-muted-foreground focus:outline-none disabled:opacity-50"
              />
              <div className="mt-2 flex items-center justify-between">
                <div className="flex gap-1">
                  <button className="rounded-md p-1.5 text-muted-foreground hover:bg-surface-elevated hover:text-foreground" disabled={isLoading}>
                    <Paperclip className="h-4 w-4" />
                  </button>
                  <button className="rounded-md p-1.5 text-muted-foreground hover:bg-surface-elevated hover:text-foreground" disabled={isLoading}>
                    <Smile className="h-4 w-4" />
                  </button>
                </div>
                <Button size="sm" onClick={() => sendMessage()} className="h-8 w-8 bg-primary p-0 hover:bg-primary/90" disabled={isLoading || !input.trim()}>
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

// ── Sub-components ─────────────────────────────────────────────────

function EmptyState({ onPrompt }: { onPrompt: (p: string) => void }) {
  return (
    <div className="flex flex-col items-center justify-center py-16 text-center">
      <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-primary/15 text-primary">
        <Sparkles className="h-7 w-7" />
      </div>
      <h2 className="mt-4 text-xl font-semibold text-foreground">Xeno Copilot</h2>
      <p className="mt-1 text-sm text-muted-foreground max-w-md">
        Ask anything about your customers and campaigns. I have live access to your CRM data.
      </p>
      <div className="mt-8 grid grid-cols-2 gap-3 w-full max-w-lg">
        {[
          { icon: Users, label: "Segment analysis", prompt: "Give me a breakdown of my customer segments and which one needs attention most urgently" },
          { icon: TrendingUp, label: "Campaign performance", prompt: "Analyze my campaign performance. Which campaigns worked best and why?" },
          { icon: Zap, label: "Quick win-back", prompt: "I want to win back lapsed customers. Draft a campaign message and tell me who to target" },
          { icon: BarChart3, label: "Channel insights", prompt: "Which messaging channel is performing best for my brand? Show me the data" },
        ].map(({ icon: Icon, label, prompt }) => (
          <button
            key={label}
            onClick={() => onPrompt(prompt)}
            className="flex items-center gap-3 rounded-xl border border-border bg-surface p-4 text-left hover:border-primary/30 hover:bg-surface-elevated transition-colors"
          >
            <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
              <Icon className="h-4 w-4" />
            </div>
            <span className="text-sm font-medium text-foreground">{label}</span>
          </button>
        ))}
      </div>
    </div>
  );
}

function TypingIndicator() {
  return (
    <div className="flex gap-3">
      <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-md bg-primary/15 text-primary">
        <Sparkles className="h-3.5 w-3.5 animate-pulse" />
      </div>
      <div className="flex items-center space-x-1.5 pt-1.5">
        {[0, 150, 300].map((delay) => (
          <div key={delay} className="w-2 h-2 bg-primary/60 rounded-full animate-bounce" style={{ animationDelay: `${delay}ms` }} />
        ))}
      </div>
    </div>
  );
}

function MessageBubble({
  m,
  onLaunch,
  onSegmentFilter,
}: {
  m: Msg;
  onLaunch: (data: any) => void;
  onSegmentFilter: (seg: string) => void;
}) {
  if (m.role === "user") {
    return (
      <div className="flex justify-end">
        <div className="max-w-[75%] rounded-2xl rounded-tr-sm bg-primary px-4 py-2.5 text-sm text-primary-foreground">
          {m.text}
        </div>
      </div>
    );
  }

  const isLoading = m.text === "Loading live data...";

  return (
    <div className="flex gap-3">
      <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-md bg-primary/15 text-primary mt-0.5">
        <Sparkles className="h-3.5 w-3.5" />
      </div>
      <div className="flex-1 space-y-3 min-w-0">
        {isLoading ? (
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <div className="w-3 h-3 border-2 border-primary border-t-transparent rounded-full animate-spin" />
            Analyzing your live data...
          </div>
        ) : (
          <div className="text-sm leading-relaxed text-foreground prose prose-invert prose-sm max-w-none">
            <ReactMarkdown>{m.text}</ReactMarkdown>
          </div>
        )}
        {m.card?.type === "segment" && (
          <SegmentCard data={m.card.data} onFilter={onSegmentFilter} />
        )}
        {m.card?.type === "campaign" && (
          <CampaignCard data={m.card.data} onLaunch={onLaunch} />
        )}
        {m.card?.type === "chart" && (
          <ChartCard data={m.card.data} />
        )}
      </div>
    </div>
  );
}

function SegmentCard({ data, onFilter }: { data: any; onFilter: (seg: string) => void }) {
  return (
    <div className="rounded-xl border border-border bg-surface p-4">
      <div className="flex items-center gap-2 mb-3">
        <Users className="h-4 w-4 text-primary" />
        <p className="text-sm font-semibold text-foreground capitalize">{data.segment} Segment</p>
      </div>
      <div className="grid grid-cols-3 gap-3 mb-3">
        <StatBox label="Customers" value={formatNumber(data.count)} />
        <StatBox label="Avg. Spend" value={formatINR(data.avgSpend)} />
        <StatBox label="Top City" value={data.topCity} />
      </div>
      <div className="flex gap-2">
        <Button size="sm" onClick={() => onFilter(data.segment)}
          className="h-8 bg-primary hover:bg-primary/90 text-primary-foreground text-xs">
          Explore Segment
        </Button>
      </div>
    </div>
  );
}

function CampaignCard({ data, onLaunch }: { data: any; onLaunch: (d: any) => void }) {
  const [msg, setMsg] = useState(data.message || "");
  return (
    <div className="rounded-xl border border-border bg-surface p-4">
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <SendIcon className="h-4 w-4 text-primary" />
          <p className="text-sm font-semibold text-foreground">{data.name}</p>
        </div>
        <ChannelBadge channel={data.channel} />
      </div>
      <div className="mb-2 flex gap-3 text-xs text-muted-foreground">
        <span>Target: <span className="text-foreground capitalize font-medium">{data.segment}</span></span>
      </div>
      <textarea
        value={msg}
        onChange={(e) => setMsg(e.target.value)}
        rows={3}
        className="w-full resize-none rounded-lg border border-border bg-background px-3 py-2 text-sm text-foreground focus:border-primary/50 focus:outline-none mb-3"
      />
      <div className="flex gap-2">
        <Button size="sm" onClick={() => onLaunch({ ...data, message: msg })}
          className="h-8 bg-primary hover:bg-primary/90 text-primary-foreground text-xs">
          Launch Campaign
        </Button>
        <Button size="sm" variant="outline" onClick={() => toast.success("A/B test created")}
          className="h-8 border-border bg-transparent hover:bg-surface-elevated text-xs">
          A/B Test
        </Button>
      </div>
    </div>
  );
}

function ChartCard({ data }: { data: any[] }) {
  return (
    <div className="rounded-xl border border-border bg-surface p-4">
      <div className="flex items-center gap-2 mb-3">
        <BarChart3 className="h-4 w-4 text-primary" />
        <p className="text-sm font-semibold text-foreground">Channel Open Rate</p>
      </div>
      <div className="h-44">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={data} margin={{ top: 4, right: 4, left: -16, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#2A2A38" vertical={false} />
            <XAxis dataKey="ch" stroke="#5A5A72" fontSize={11} tickLine={false} axisLine={false} />
            <YAxis stroke="#5A5A72" fontSize={11} tickLine={false} axisLine={false} tickFormatter={(v) => `${v}%`} />
            <Tooltip contentStyle={tooltipStyle} formatter={(v: any) => `${v}%`} />
            <Bar dataKey="rate" fill="#6366F1" radius={[6, 6, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}

function StatBox({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-lg border border-border bg-background p-2.5">
      <p className="text-[10px] font-medium uppercase tracking-wider text-muted-foreground">{label}</p>
      <p className="mt-0.5 text-sm font-semibold text-foreground">{value}</p>
    </div>
  );
}