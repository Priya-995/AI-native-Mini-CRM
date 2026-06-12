import { createFileRoute } from "@tanstack/react-router";
import { useState, useEffect } from "react";
import { Plus, Sparkles, Send, CheckCircle, Clock, FileText } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { ChannelBadge } from "@/components/common/ChannelBadge";
import { StatusPill } from "@/components/common/StatusPill";
import { formatNumber } from "@/lib/format";
import { toast } from "sonner";

export const Route = createFileRoute("/campaigns")({
  head: () => ({ meta: [{ title: "Campaigns — Xeno" }] }),
  component: CampaignsPage,
});

const API = import.meta.env.VITE_API_URL || "http://localhost:3000";

const SEGMENTS = ["all", "vip", "loyal", "at-risk", "new", "lapsed"];
const CHANNELS = ["whatsapp", "sms", "email", "rcs"];

function CampaignsPage() {
  const [campaigns, setCampaigns] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [selectedCampaign, setSelectedCampaign] = useState<any>(null);
  const [stats, setStats] = useState<any>(null);

  const fetchCampaigns = async () => {
    try {
      const res = await fetch(`${API}/campaigns`);
      const data = await res.json();
      setCampaigns(data);
    } catch (e) {
      toast.error("Failed to load campaigns");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchCampaigns(); }, []);

  // Poll stats every 3 seconds when viewing a campaign
  useEffect(() => {
    if (!selectedCampaign) return;
    const interval = setInterval(async () => {
      const res = await fetch(`${API}/campaigns/${selectedCampaign.id}/stats`);
      const data = await res.json();
      setStats(data);
      // Also refresh campaign list
      fetchCampaigns();
    }, 3000);
    return () => clearInterval(interval);
  }, [selectedCampaign]);

  const openStats = async (campaign: any) => {
    setSelectedCampaign(campaign);
    const res = await fetch(`${API}/campaigns/${campaign.id}/stats`);
    const data = await res.json();
    setStats(data);
  };

  return (
    <div className="space-y-5 p-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-semibold text-foreground">Campaigns</h1>
          <p className="mt-0.5 text-sm text-muted-foreground">{campaigns.length} campaigns total</p>
        </div>
        <Button onClick={() => setDrawerOpen(true)} className="bg-primary hover:bg-primary/90 text-primary-foreground">
          <Plus className="h-4 w-4" /> New Campaign
        </Button>
      </div>

      {/* Campaign list */}
      <div className="rounded-xl border border-border bg-surface">
        {loading ? (
          <div className="p-8 text-center text-sm text-muted-foreground">Loading campaigns...</div>
        ) : campaigns.length === 0 ? (
          <div className="p-8 text-center text-sm text-muted-foreground">No campaigns yet. Create your first one!</div>
        ) : (
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border text-left text-[11px] font-medium uppercase tracking-wider text-muted-foreground">
                <th className="px-4 py-3">Name</th>
                <th className="px-4 py-3">Channel</th>
                <th className="px-4 py-3">Segment</th>
                <th className="px-4 py-3">Sent</th>
                <th className="px-4 py-3">Delivered</th>
                <th className="px-4 py-3">Read</th>
                <th className="px-4 py-3">Clicked</th>
                <th className="px-4 py-3">Status</th>
                <th className="px-4 py-3"></th>
              </tr>
            </thead>
            <tbody>
              {campaigns.map((c) => (
                <tr key={c.id} className="border-b border-border/40 last:border-0 hover:bg-surface-elevated/50 transition-colors">
                  <td className="px-4 py-3 font-medium text-foreground">{c.name}</td>
                  <td className="px-4 py-3"><ChannelBadge channel={c.channel} showLabel={false} /></td>
                  <td className="px-4 py-3 text-muted-foreground capitalize">{c.segment_filter || "all"}</td>
                  <td className="px-4 py-3 text-muted-foreground">{formatNumber(c.sent || 0)}</td>
                  <td className="px-4 py-3 text-muted-foreground">{formatNumber(c.delivered || 0)}</td>
                  <td className="px-4 py-3 text-muted-foreground">{formatNumber(c.opened || 0)}</td>
                  <td className="px-4 py-3 text-muted-foreground">{formatNumber(c.clicked || 0)}</td>
                  <td className="px-4 py-3"><StatusPill status={c.status} /></td>
                  <td className="px-4 py-3">
                    <Button size="sm" variant="outline" onClick={() => openStats(c)}
                      className="h-7 border-border bg-transparent text-xs hover:bg-surface-elevated">
                      View Stats
                    </Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {/* New Campaign Drawer */}
      <Sheet open={drawerOpen} onOpenChange={setDrawerOpen}>
        <SheetContent className="w-[460px] border-border bg-surface sm:max-w-none overflow-y-auto">
          <SheetHeader>
            <SheetTitle className="flex items-center gap-2 text-foreground">
              <Sparkles className="h-4 w-4 text-primary" /> New Campaign
            </SheetTitle>
          </SheetHeader>
          <NewCampaignForm
            onSuccess={() => { setDrawerOpen(false); fetchCampaigns(); }}
          />
        </SheetContent>
      </Sheet>

      {/* Stats Modal */}
      {selectedCampaign && stats && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm">
          <div className="w-[600px] rounded-xl border border-border bg-surface p-6 shadow-2xl">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold text-foreground">{selectedCampaign.name}</h2>
              <button onClick={() => { setSelectedCampaign(null); setStats(null); }}
                className="text-muted-foreground hover:text-foreground text-xl">×</button>
            </div>

            {/* Live stat cards */}
            <div className="grid grid-cols-4 gap-3 mb-6">
              {[
                { label: "Sent", value: stats.campaign?.sent || 0, icon: Send, color: "text-blue-400" },
                { label: "Delivered", value: stats.campaign?.delivered || 0, icon: CheckCircle, color: "text-green-400" },
                { label: "Read", value: stats.campaign?.opened || 0, icon: Clock, color: "text-amber-400" },
                { label: "Clicked", value: stats.campaign?.clicked || 0, icon: FileText, color: "text-purple-400" },
              ].map((s) => (
                <div key={s.label} className="rounded-lg border border-border bg-background p-3 text-center">
                  <s.icon className={`h-4 w-4 mx-auto mb-1 ${s.color}`} />
                  <p className="text-lg font-semibold text-foreground">{formatNumber(s.value)}</p>
                  <p className="text-[10px] text-muted-foreground uppercase">{s.label}</p>
                </div>
              ))}
            </div>
             <AIInsightBox campaign={stats.campaign} />
            {/* Communications table */}
            <div className="rounded-lg border border-border overflow-hidden">
              <div className="border-b border-border px-3 py-2 text-xs font-medium text-muted-foreground uppercase">
                Live Communication Status
              </div>
              <div className="max-h-64 overflow-y-auto">
                <table className="w-full text-xs">
                  <thead>
                    <tr className="border-b border-border bg-background/50">
                      <th className="px-3 py-2 text-left text-muted-foreground">Customer</th>
                      <th className="px-3 py-2 text-left text-muted-foreground">Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {(stats.communications || []).slice(0, 20).map((c: any) => (
                      <tr key={c.id} className="border-b border-border/40 last:border-0">
                        <td className="px-3 py-2 text-foreground font-mono">{c.customer_id}</td>
                        <td className="px-3 py-2">
                          <StatusDot status={c.status} />
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
            <p className="mt-2 text-[11px] text-muted-foreground text-center">
              Auto-refreshing every 3 seconds...
            </p>
          </div>
        </div>
      )}
    </div>
  );
}

function StatusDot({ status }: { status: string }) {
  const colors: Record<string, string> = {
    sent: "bg-blue-400",
    delivered: "bg-green-400",
    read: "bg-amber-400",
    clicked: "bg-purple-400",
    failed: "bg-red-400",
  };
  return (
    <span className="inline-flex items-center gap-1.5">
      <span className={`h-2 w-2 rounded-full ${colors[status] || "bg-gray-400"}`} />
      <span className="text-muted-foreground capitalize">{status}</span>
    </span>
  );
}

function NewCampaignForm({ onSuccess }: { onSuccess: () => void }) {
  const [name, setName] = useState("");
  const [channel, setChannel] = useState("whatsapp");
  const [segment, setSegment] = useState("all");
  const [message, setMessage] = useState("");
  const [generating, setGenerating] = useState(false);
  const [launching, setLaunching] = useState(false);

  const generateMessage = async () => {
    if (!segment || !channel) return;
    setGenerating(true);
    try {
      const res = await fetch(`${API}/ai/generate-message`, {
  method: "POST",
  headers: { "Content-Type": "application/json" },
  body: JSON.stringify({ segment, channel }),
});
const data = await res.json();
setMessage(data.message);
      toast.success("Message generated!");
    } catch (e) {
      toast.error("Failed to generate message");
    } finally {
      setGenerating(false);
    }
  };

  const launch = async () => {
    if (!name || !message) return toast.error("Fill in name and message");
    setLaunching(true);
    try {
      // Create campaign
      const createRes = await fetch(`${API}/campaigns`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, message, channel, segment_filter: segment }),
      });
      const campaign = await createRes.json();

      // Launch it
      await fetch(`${API}/campaigns/${campaign.id}/launch`, { method: "POST" });

      toast.success(`Campaign launched to ${segment} customers!`);
      onSuccess();
    } catch (e) {
      toast.error("Failed to launch campaign");
    } finally {
      setLaunching(false);
    }
  };

  return (
    <div className="mt-4 space-y-4">
      <div>
        <label className="text-xs font-medium text-muted-foreground">Campaign Name</label>
        <input value={name} onChange={(e) => setName(e.target.value)}
          placeholder="e.g. Monsoon Sale Blast"
          className="mt-1 w-full rounded-lg border border-border bg-background px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground focus:border-primary/50 focus:outline-none" />
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="text-xs font-medium text-muted-foreground">Channel</label>
          <select value={channel} onChange={(e) => setChannel(e.target.value)}
            className="mt-1 w-full rounded-lg border border-border bg-background px-3 py-2 text-sm text-foreground focus:outline-none">
            {CHANNELS.map(c => <option key={c} value={c} className="bg-surface capitalize">{c.toUpperCase()}</option>)}
          </select>
        </div>
        <div>
          <label className="text-xs font-medium text-muted-foreground">Target Segment</label>
          <select value={segment} onChange={(e) => setSegment(e.target.value)}
            className="mt-1 w-full rounded-lg border border-border bg-background px-3 py-2 text-sm text-foreground focus:outline-none">
            {SEGMENTS.map(s => <option key={s} value={s} className="bg-surface capitalize">{s === "all" ? "All Customers" : s}</option>)}
          </select>
        </div>
      </div>

      <div>
        <div className="flex items-center justify-between mb-1">
          <label className="text-xs font-medium text-muted-foreground">Message</label>
          <button onClick={generateMessage} disabled={generating}
            className="inline-flex items-center gap-1 text-xs text-primary hover:underline disabled:opacity-50">
            <Sparkles className="h-3 w-3" />
            {generating ? "Generating..." : "Generate with AI"}
          </button>
        </div>
        <textarea value={message} onChange={(e) => setMessage(e.target.value)}
          rows={4} placeholder="Write your message or click Generate with AI..."
          className="w-full resize-none rounded-lg border border-border bg-background px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground focus:border-primary/50 focus:outline-none" />
        <p className="mt-1 text-right text-[11px] text-muted-foreground">{message.length} chars</p>
      </div>

      <Button onClick={launch} disabled={launching} className="w-full bg-primary hover:bg-primary/90 text-primary-foreground">
        <Send className="h-4 w-4" />
        {launching ? "Launching..." : "Launch Campaign"}
      </Button>
    </div>
  );
}
function AIInsightBox({ campaign }: { campaign: any }) {
  const [insight, setInsight] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const generate = async () => {
    setLoading(true);
    try {
      const res = await fetch(`${API}/ai/campaign-insight`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ campaign }),
      });
      const data = await res.json();
      setInsight(data.insight);
    } catch {
      toast.error('Failed to generate insight');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="mt-4 rounded-lg border border-primary/20 bg-primary/5 p-4">
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center gap-2">
          <Sparkles className="h-4 w-4 text-primary" />
          <p className="text-sm font-medium text-foreground">AI Insight</p>
        </div>
        {!insight && (
          <button onClick={generate} disabled={loading}
            className="text-xs text-primary hover:underline disabled:opacity-50">
            {loading ? 'Generating...' : 'Generate →'}
          </button>
        )}
      </div>
      {insight ? (
        <p className="text-sm text-muted-foreground leading-relaxed">{insight}</p>
      ) : (
        <p className="text-xs text-muted-foreground">Click Generate to get an AI summary of this campaign.</p>
      )}
    </div>
  );
}