import { createFileRoute } from "@tanstack/react-router";
import { useState, useEffect } from "react";
import { Search, Sparkles, MessageSquare, Eye, UserPlus, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetDescription } from "@/components/ui/sheet";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Slider } from "@/components/ui/slider";
import { ChannelBadge } from "@/components/common/ChannelBadge";
import { SegmentPill } from "@/components/common/SegmentPill";
import { formatINR, formatNumber, formatPhone, relativeTime } from "@/lib/format";
import { toast } from "sonner";

const API = import.meta.env.VITE_API_URL || "http://localhost:3000";

export const Route = createFileRoute("/customers")({
  head: () => ({ meta: [{ title: "Customers — Xeno" }] }),
  component: CustomersPage,
});

const channelOpts = ["all", "whatsapp", "sms", "email", "rcs"] as const;
const segmentOpts = ["all", "vip", "loyal", "at-risk", "new", "lapsed"] as const;

function CustomersPage() {
  const [customers, setCustomers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [channel, setChannel] = useState<string>("all");
  const [segment, setSegment] = useState<string>("all");
  const [spendRange, setSpendRange] = useState<number[]>([0, 150000]);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [selected, setSelected] = useState<any | null>(null);

  useEffect(() => {
    fetch(`${API}/customers`)
      .then((r) => r.json())
      .then((data) => { setCustomers(data); setLoading(false); })
      .catch(() => { toast.error("Failed to load customers"); setLoading(false); });
  }, []);

  const filtered = customers.filter((c) =>
    (channel === "all" || c.preferred_channel === channel) &&
    (segment === "all" || c.segment === segment) &&
    c.total_spend >= spendRange[0] && c.total_spend <= spendRange[1] &&
    (c.name.toLowerCase().includes(search.toLowerCase()) ||
      (c.email || "").toLowerCase().includes(search.toLowerCase()) ||
      (c.phone || "").includes(search))
  );

  const activeCount = (channel !== "all" ? 1 : 0) + (segment !== "all" ? 1 : 0) +
    (spendRange[0] > 0 || spendRange[1] < 150000 ? 1 : 0);
  const clearAll = () => { setChannel("all"); setSegment("all"); setSpendRange([0, 150000]); setSearch(""); };

  return (
    <div className="space-y-5 p-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-xl font-semibold tracking-tight text-foreground">Customer Explorer</h1>
          <p className="mt-0.5 text-sm text-muted-foreground">{customers.length} customers loaded</p>
        </div>
        <div className="flex items-center gap-2">
          <div className="relative">
            <Search className="pointer-events-none absolute left-2.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-muted-foreground" />
            <input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search name, email, phone…"
              className="h-9 w-72 rounded-md border border-border bg-surface pl-8 pr-3 text-sm text-foreground placeholder:text-muted-foreground focus:border-primary/50 focus:outline-none" />
          </div>
          <Button onClick={() => setDrawerOpen(true)} className="h-9 bg-primary hover:bg-primary/90 text-primary-foreground">
            <Sparkles className="h-4 w-4" /> AI Segment Builder
          </Button>
        </div>
      </div>

      {/* Filter row */}
      <div className="flex flex-wrap items-center gap-2 rounded-xl border border-border bg-surface p-3">
        <FilterSelect label="Channel" value={channel} onChange={setChannel} options={channelOpts as unknown as string[]} />
        <FilterSelect label="Segment" value={segment} onChange={setSegment} options={segmentOpts as unknown as string[]} />
        <div className="flex items-center gap-3 rounded-md border border-border bg-background px-3 py-1.5">
          <span className="text-xs font-medium text-muted-foreground">Spend</span>
          <div className="w-40"><Slider value={spendRange} onValueChange={setSpendRange} min={0} max={150000} step={5000} /></div>
          <span className="text-xs font-medium text-foreground">{formatINR(spendRange[0])} – {formatINR(spendRange[1])}</span>
        </div>
        {activeCount > 0 && (
          <>
            <span className="ml-auto inline-flex items-center rounded-md bg-primary/15 px-2 py-1 text-xs font-medium text-primary">
              {activeCount} active filter{activeCount > 1 ? "s" : ""}
            </span>
            <button onClick={clearAll} className="text-xs font-medium text-muted-foreground hover:text-foreground">Clear all</button>
          </>
        )}
      </div>

      {/* Table */}
      <div className="rounded-xl border border-border bg-surface">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border text-left text-[11px] font-medium uppercase tracking-wider text-muted-foreground">
                <th className="px-4 py-3">Customer</th>
                <th className="px-4 py-3">City</th>
                <th className="px-4 py-3">Orders</th>
                <th className="px-4 py-3">Spend</th>
                <th className="px-4 py-3">Last Order</th>
                <th className="px-4 py-3">Segment</th>
                <th className="px-4 py-3">Channel</th>
                <th className="px-4 py-3"></th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr><td colSpan={8} className="px-4 py-8 text-center text-sm text-muted-foreground">Loading customers...</td></tr>
              ) : filtered.length === 0 ? (
                <tr><td colSpan={8} className="px-4 py-8 text-center text-sm text-muted-foreground">No customers match your filters.</td></tr>
              ) : filtered.map((c) => (
                <tr key={c.id} onClick={() => setSelected(c)}
                  className="group cursor-pointer border-b border-border/40 last:border-0 transition-colors hover:bg-surface-elevated/50">
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-3">
                      <Avatar name={c.name} />
                      <div className="min-w-0">
                        <p className="truncate font-medium text-foreground">{c.name}</p>
                        <p className="truncate text-xs text-muted-foreground">{c.email}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-4 py-3 text-muted-foreground">{c.city}</td>
                  <td className="px-4 py-3 text-muted-foreground">{c.total_orders}</td>
                  <td className="px-4 py-3 font-medium text-foreground">{formatINR(c.total_spend)}</td>
                  <td className="px-4 py-3 text-muted-foreground">{relativeTime(c.last_order_date)}</td>
                  <td className="px-4 py-3"><SegmentPill type={c.segment} /></td>
                  <td className="px-4 py-3"><ChannelBadge channel={c.preferred_channel} showLabel={false} /></td>
                  <td className="px-4 py-3">
                    <div className="flex gap-1 opacity-0 transition-opacity group-hover:opacity-100">
                      <IconBtn icon={Eye} title="View profile" />
                      <IconBtn icon={UserPlus} title="Add to segment" onClick={(e) => { e.stopPropagation(); toast.success("Added to segment"); }} />
                      <IconBtn icon={MessageSquare} title="Send message" onClick={(e) => { e.stopPropagation(); toast.success("Opening composer…"); }} />
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <div className="flex items-center justify-between border-t border-border px-4 py-3 text-xs text-muted-foreground">
          <span>Showing {filtered.length} of {customers.length}</span>
          <div className="flex gap-1">
            <Button size="sm" variant="outline" className="h-7 border-border bg-transparent text-xs">Prev</Button>
            <Button size="sm" variant="outline" className="h-7 border-border bg-transparent text-xs">Next</Button>
          </div>
        </div>
      </div>

      {/* AI Segment Builder Drawer */}
      <Sheet open={drawerOpen} onOpenChange={setDrawerOpen}>
        <SheetContent className="w-[420px] border-border bg-surface sm:max-w-none">
          <SheetHeader>
            <SheetTitle className="flex items-center gap-2 text-foreground">
              <Sparkles className="h-4 w-4 text-primary" /> Build a Segment with AI
            </SheetTitle>
            <SheetDescription className="text-muted-foreground">Describe who you want to reach in natural language.</SheetDescription>
          </SheetHeader>
          <SegmentBuilder onApply={(results) => { setCustomers(results); setDrawerOpen(false); }} />
        </SheetContent>
      </Sheet>

      {/* Profile modal */}
      <Dialog open={!!selected} onOpenChange={(o) => !o && setSelected(null)}>
        <DialogContent className="max-w-4xl border-border bg-surface p-0">
          {selected && <CustomerProfile c={selected} onClose={() => setSelected(null)} />}
        </DialogContent>
      </Dialog>
    </div>
  );
}

function FilterSelect({ label, value, onChange, options }: { label: string; value: string; onChange: (v: string) => void; options: string[] }) {
  return (
    <label className="inline-flex items-center gap-2 rounded-md border border-border bg-background px-2.5 py-1.5">
      <span className="text-xs font-medium text-muted-foreground">{label}</span>
      <select value={value} onChange={(e) => onChange(e.target.value)} className="bg-transparent text-xs font-medium text-foreground focus:outline-none capitalize">
        {options.map((o) => <option key={o} value={o} className="bg-surface capitalize">{o === "all" ? "All" : o}</option>)}
      </select>
    </label>
  );
}

function Avatar({ name }: { name: string }) {
  const initials = name.split(" ").map((p) => p[0]).slice(0, 2).join("");
  const hues = [220, 280, 340, 30, 160, 200];
  const h = hues[name.length % hues.length];
  return (
    <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full text-xs font-semibold text-white"
      style={{ background: `linear-gradient(135deg, hsl(${h} 70% 55%), hsl(${(h + 40) % 360} 70% 45%))` }}>
      {initials}
    </div>
  );
}

function IconBtn({ icon: Icon, title, onClick }: { icon: any; title: string; onClick?: (e: React.MouseEvent) => void }) {
  return (
    <button onClick={onClick} title={title} className="rounded-md p-1.5 text-muted-foreground hover:bg-surface-elevated hover:text-foreground">
      <Icon className="h-3.5 w-3.5" />
    </button>
  );
}

function SegmentBuilder({ onApply }: { onApply: (results: any[]) => void }) {
  const [prompt, setPrompt] = useState("");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<{ filters: any; customers: any[]; count: number } | null>(null);

  const generate = async () => {
    if (!prompt.trim()) return;
    setLoading(true);
    try {
      const res = await fetch(`${API}/ai/segment`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ query: prompt }),
      });
      const data = await res.json();
      setResult(data);
      toast.success(`Found ${data.count} matching customers`);
    } catch {
      toast.error("Segment generation failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="mt-4 space-y-4">
      <textarea value={prompt} onChange={(e) => setPrompt(e.target.value)} rows={4}
        placeholder="e.g. VIP customers in Mumbai who spent over ₹50,000"
        className="w-full resize-none rounded-lg border border-border bg-background p-3 text-sm text-foreground placeholder:text-muted-foreground focus:border-primary/50 focus:outline-none" />
      <Button onClick={generate} disabled={loading} className="w-full bg-primary hover:bg-primary/90 text-primary-foreground">
        <Sparkles className="h-4 w-4" /> {loading ? "Generating..." : "Generate Segment"}
      </Button>

      {result && (
        <div className="space-y-3 rounded-lg border border-primary/20 bg-primary/5 p-4">
          <div className="flex flex-wrap gap-1.5">
            {Object.entries(result.filters).map(([k, v]) => (
              <span key={k} className="rounded-md border border-border bg-background px-2 py-0.5 text-[11px] text-foreground capitalize">
                {k.replace(/_/g, " ")} = {String(v)}
              </span>
            ))}
          </div>
          <div className="rounded-md border border-border bg-background p-3">
            <p className="text-2xl font-semibold text-foreground">
              {result.count} <span className="text-sm font-normal text-muted-foreground">customers matched</span>
            </p>
          </div>
          <div className="flex gap-2">
            <Button size="sm" variant="outline" onClick={() => toast.success("Segment saved")}
              className="flex-1 border-border bg-transparent hover:bg-surface-elevated">Save Segment</Button>
            <Button size="sm" onClick={() => { onApply(result.customers); toast.success("Showing matched customers"); }}
              className="flex-1 bg-primary hover:bg-primary/90 text-primary-foreground">Apply Filter</Button>
          </div>
        </div>
      )}
    </div>
  );
}

function CustomerProfile({ c, onClose }: { c: any; onClose: () => void }) {
  const rfmTotal = (c.rfm_r || 0) + (c.rfm_f || 0) + (c.rfm_m || 0);
  const rfmTier = rfmTotal >= 13 ? "Champion" : rfmTotal >= 10 ? "Loyal" : rfmTotal >= 7 ? "Potential" : "At-Risk";

  return (
    <div className="grid grid-cols-12 overflow-hidden rounded-2xl">
      <div className="col-span-4 space-y-4 border-r border-border bg-surface-elevated/30 p-6">
        <div className="flex items-center justify-between">
          <Avatar name={c.name} />
          <button onClick={onClose} className="rounded-md p-1 text-muted-foreground hover:bg-surface hover:text-foreground">
            <X className="h-4 w-4" />
          </button>
        </div>
        <div>
          <h2 className="text-lg font-semibold text-foreground">{c.name}</h2>
          <p className="text-sm text-muted-foreground">{c.email}</p>
          <p className="text-sm text-muted-foreground">{formatPhone(c.phone)}</p>
          <p className="mt-1 text-xs text-muted-foreground">
            {c.city} · Joined {c.join_date ? new Date(c.join_date).toLocaleDateString("en-IN", { month: "short", year: "numeric" }) : "—"}
          </p>
        </div>
        <div className="flex flex-wrap gap-1.5">
          <SegmentPill type={c.segment} />
          <ChannelBadge channel={c.preferred_channel} />
        </div>
        <div className="rounded-lg border border-border bg-background p-3">
          <p className="text-[10px] font-medium uppercase tracking-wider text-muted-foreground">RFM Score</p>
          <p className="mt-1 text-lg font-semibold text-foreground">{rfmTier}</p>
          <div className="mt-2 grid grid-cols-3 gap-1 text-center text-[10px]">
            {(["rfm_r", "rfm_f", "rfm_m"] as const).map((k) => (
              <div key={k} className="rounded bg-surface-elevated py-1">
                <p className="text-muted-foreground uppercase">{k.replace("rfm_", "")}</p>
                <p className="font-semibold text-foreground">{c[k] || 0}/5</p>
              </div>
            ))}
          </div>
        </div>
      </div>
      <div className="col-span-8 p-6">
        <Tabs defaultValue="overview">
          <TabsList className="bg-background">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="orders">Order History</TabsTrigger>
            <TabsTrigger value="prefs">Preferences</TabsTrigger>
          </TabsList>
          <TabsContent value="overview" className="mt-4 space-y-4">
            <div className="grid grid-cols-3 gap-3">
              <BigStat label="Lifetime Spend" value={formatINR(c.total_spend)} />
              <BigStat label="Orders" value={formatNumber(c.total_orders)} />
              <BigStat label="Last Activity" value={relativeTime(c.last_order_date)} />
            </div>
            <div className="rounded-lg border border-primary/20 bg-primary/5 p-4">
              <div className="flex items-start gap-3">
                <Sparkles className="mt-0.5 h-4 w-4 shrink-0 text-primary" />
                <div>
                  <p className="text-sm font-medium text-foreground">AI Insight</p>
                  <p className="mt-1 text-sm text-muted-foreground">
                    {c.segment === "at-risk"
                      ? `This customer has a high churn risk. Consider a win-back ${c.preferred_channel} campaign with a 15% discount.`
                      : c.segment === "vip"
                      ? `VIP customer with ₹${formatNumber(c.total_spend)} lifetime spend. Great candidate for exclusive early-access campaigns.`
                      : c.segment === "lapsed"
                      ? `Last ordered ${relativeTime(c.last_order_date)} ago. A re-engagement campaign could win them back.`
                      : `Active ${c.segment} customer. Keep them engaged with personalized recommendations.`}
                  </p>
                </div>
              </div>
            </div>
          </TabsContent>
          <TabsContent value="orders" className="mt-4">
            <div className="space-y-2">
              {Array.from({ length: Math.min(c.total_orders, 5) }).map((_, i) => (
                <div key={i} className="flex items-center justify-between rounded-lg border border-border bg-background p-3">
                  <div>
                    <p className="text-sm font-medium text-foreground">Order #XN-{100432 - i * 17}</p>
                    <p className="text-xs text-muted-foreground">{3 - (i % 3) + 1} items · {new Date(Date.now() - i * 12 * 86400000).toLocaleDateString("en-IN", { day: "numeric", month: "short" })}</p>
                  </div>
                  <p className="text-sm font-semibold text-foreground">{formatINR(Math.round(c.total_spend / Math.max(c.total_orders, 1) * (1 + i * 0.1)))}</p>
                </div>
              ))}
            </div>
          </TabsContent>
          <TabsContent value="prefs" className="mt-4 space-y-2 text-sm">
            <Pref label="Preferred channel" value={c.preferred_channel?.toUpperCase() || "—"} />
            <Pref label="Marketing opt-in" value="Yes" />
            <Pref label="Language" value="English" />
            <Pref label="Segment" value={c.segment} />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}

function BigStat({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-lg border border-border bg-background p-3">
      <p className="text-[10px] font-medium uppercase tracking-wider text-muted-foreground">{label}</p>
      <p className="mt-1 text-lg font-semibold text-foreground">{value}</p>
    </div>
  );
}

function Pref({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex justify-between rounded-md border border-border bg-background px-3 py-2">
      <span className="text-muted-foreground">{label}</span>
      <span className="font-medium text-foreground capitalize">{value}</span>
    </div>
  );
}