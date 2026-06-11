import { createFileRoute } from "@tanstack/react-router";
import { useState, useEffect } from "react";
import { Calendar, Search, ChevronDown, Eye, Copy, ArrowUp, ArrowDown } from "lucide-react";
import { SectionHeader } from "@/components/common/SectionHeader";
import { ChannelIcon } from "@/components/common/ChannelBadge";
import { StatusPill } from "@/components/common/StatusPill";
import { deliveryFunnel, engagement14d, topSegmentsPerformance } from "@/data/mockData";
import { formatINR, formatNumber, formatPercent } from "@/lib/format";
import { Bar, BarChart, CartesianGrid, Cell, Line, LineChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { tooltipStyle } from "./index";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

const API = import.meta.env.VITE_API_URL || "http://localhost:3000";

export const Route = createFileRoute("/analytics")({
  head: () => ({ meta: [{ title: "Campaign Analytics — Xeno" }] }),
  component: AnalyticsPage,
});

function AnalyticsPage() {
  const [campaigns, setCampaigns] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [channelFilter, setChannelFilter] = useState<string>("all");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [campaignContext, setCampaignContext] = useState<string>("");

  useEffect(() => {
    fetch(`${API}/campaigns`)
      .then((r) => r.json())
      .then((data) => {
        setCampaigns(data);
        if (data.length > 0) setCampaignContext(data[0].id);
        setLoading(false);
      });
  }, []);

  const filtered = campaigns.filter((c) =>
    (channelFilter === "all" || c.channel === channelFilter) &&
    (statusFilter === "all" || c.status === statusFilter) &&
    c.name.toLowerCase().includes(search.toLowerCase())
  );

  // Compute summary totals from real data
  const totalSent = campaigns.reduce((s, c) => s + (c.sent || 0), 0);
  const totalDelivered = campaigns.reduce((s, c) => s + (c.delivered || 0), 0);
  const totalOpened = campaigns.reduce((s, c) => s + (c.opened || 0), 0);
  const totalClicked = campaigns.reduce((s, c) => s + (c.clicked || 0), 0);

  const summary = [
    { label: "Sent", value: totalSent, delta: 12.4, pos: true },
    { label: "Delivered", value: totalDelivered, delta: 11.8, pos: true, pct: totalSent > 0 ? formatPercent((totalDelivered / totalSent) * 100) : "—" },
    { label: "Opened", value: totalOpened, delta: 4.2, pos: true, pct: totalDelivered > 0 ? formatPercent((totalOpened / totalDelivered) * 100) : "—" },
    { label: "Clicked", value: totalClicked, delta: -2.1, pos: false, pct: totalOpened > 0 ? formatPercent((totalClicked / totalOpened) * 100) : "—" },
    { label: "Converted", value: Math.round(totalClicked * 0.3), delta: 18.7, pos: true, pct: totalClicked > 0 ? "30%" : "—" },
  ];

  const tierColor = (rate: number) => rate >= 60 ? "#22C55E" : rate >= 40 ? "#6366F1" : rate >= 30 ? "#F59E0B" : "#EF4444";

  return (
    <div className="space-y-6 p-6">
      <div className="flex items-end justify-between">
        <div>
          <nav className="text-xs text-muted-foreground">
            <span>Analytics</span> <span className="mx-1.5">/</span> <span className="text-foreground">Campaigns</span>
          </nav>
          <h1 className="mt-1 text-xl font-semibold tracking-tight text-foreground">Campaign Analytics</h1>
        </div>
        <button className="inline-flex items-center gap-2 rounded-md border border-border bg-surface px-3 py-1.5 text-xs font-medium text-foreground hover:bg-surface-elevated">
          <Calendar className="h-3.5 w-3.5 text-muted-foreground" /> All time <ChevronDown className="h-3 w-3 text-muted-foreground" />
        </button>
      </div>

      {/* Summary — real totals */}
      <div className="grid grid-cols-2 gap-4 md:grid-cols-5">
        {summary.map((s) => (
          <div key={s.label} className="rounded-xl border border-border bg-surface p-4">
            <p className="text-[11px] font-medium uppercase tracking-wider text-muted-foreground">{s.label}</p>
            <p className="mt-1.5 text-xl font-semibold text-foreground">{formatNumber(s.value)}</p>
            <div className="mt-2 flex items-center justify-between">
              {s.pct && <span className="text-xs text-muted-foreground">{s.pct}</span>}
              <span className={cn("inline-flex items-center gap-0.5 rounded-md px-1.5 py-0.5 text-[11px] font-medium",
                s.pos ? "bg-emerald-500/15 text-emerald-400" : "bg-red-500/15 text-red-400")}>
                {s.pos ? <ArrowUp className="h-2.5 w-2.5" /> : <ArrowDown className="h-2.5 w-2.5" />}{Math.abs(s.delta)}%
              </span>
            </div>
          </div>
        ))}
      </div>

      {/* Funnel — still from mockData (shape data, not campaign data) */}
      <div className="rounded-xl border border-border bg-surface p-5">
        <SectionHeader title="Delivery Funnel" subtitle="Cascading drop-off across stages" />
        <div className="mt-4 h-72">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={deliveryFunnel} layout="vertical" margin={{ top: 6, right: 60, left: 30, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#2A2A38" horizontal={false} />
              <XAxis type="number" stroke="#5A5A72" fontSize={11} tickLine={false} axisLine={false} tickFormatter={(v) => formatNumber(v)} />
              <YAxis type="category" dataKey="stage" stroke="#5A5A72" fontSize={12} tickLine={false} axisLine={false} width={80} />
              <Tooltip contentStyle={tooltipStyle} formatter={(v: any) => formatNumber(v)} />
              <Bar dataKey="value" radius={[0, 6, 6, 0]} barSize={28}>
                {deliveryFunnel.map((d, i) => (
                  <Cell key={d.stage} fill={`oklch(0.62 0.19 264 / ${1 - i * 0.14})`} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
        <div className="mt-2 grid grid-cols-5 gap-2 text-center text-xs">
          {deliveryFunnel.map((d) => (
            <div key={d.stage}>
              <p className="font-semibold text-foreground">{d.pct}%</p>
              <p className="text-muted-foreground">{d.stage}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Campaigns table — real data */}
      <div className="grid grid-cols-1 gap-4 xl:grid-cols-12">
        <div className="xl:col-span-8 rounded-xl border border-border bg-surface p-5">
          <SectionHeader title="Campaigns" subtitle={`${filtered.length} campaigns`} />
          <div className="mt-4 flex flex-wrap items-center gap-2">
            <div className="relative flex-1 min-w-[200px]">
              <Search className="pointer-events-none absolute left-2.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-muted-foreground" />
              <input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search campaigns…"
                className="h-8 w-full rounded-md border border-border bg-background pl-8 pr-3 text-xs text-foreground placeholder:text-muted-foreground focus:border-primary/50 focus:outline-none" />
            </div>
            <select value={channelFilter} onChange={(e) => setChannelFilter(e.target.value)}
              className="h-8 rounded-md border border-border bg-background px-2 text-xs text-foreground">
              <option value="all">All channels</option>
              <option value="whatsapp">WhatsApp</option>
              <option value="email">Email</option>
              <option value="sms">SMS</option>
              <option value="rcs">RCS</option>
            </select>
            <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)}
              className="h-8 rounded-md border border-border bg-background px-2 text-xs text-foreground">
              <option value="all">All status</option>
              <option value="active">Active</option>
              <option value="completed">Completed</option>
              <option value="draft">Draft</option>
            </select>
          </div>
          <div className="mt-4 overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border text-left text-[11px] font-medium uppercase tracking-wider text-muted-foreground">
                  <th className="pb-2">Name</th>
                  <th className="pb-2">Ch</th>
                  <th className="pb-2">Sent</th>
                  <th className="pb-2">Del%</th>
                  <th className="pb-2">Open%</th>
                  <th className="pb-2">CTR%</th>
                  <th className="pb-2">Status</th>
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  <tr><td colSpan={7} className="py-8 text-center text-sm text-muted-foreground">Loading...</td></tr>
                ) : filtered.map((c) => (
                  <tr key={c.id} className="border-b border-border/40 last:border-0 hover:bg-surface-elevated/40">
                    <td className="py-3 font-medium text-foreground">{c.name}</td>
                    <td className="py-3"><ChannelIcon channel={c.channel} /></td>
                    <td className="py-3 text-muted-foreground">{formatNumber(c.sent || 0)}</td>
                    <td className="py-3 text-muted-foreground">
                      {c.sent > 0 ? formatPercent((c.delivered / c.sent) * 100) : "—"}
                    </td>
                    <td className="py-3 text-muted-foreground">
                      {c.delivered > 0 ? formatPercent((c.opened / c.delivered) * 100) : "—"}
                    </td>
                    <td className="py-3 text-muted-foreground">
                      {c.opened > 0 ? formatPercent((c.clicked / c.opened) * 100) : "—"}
                    </td>
                    <td className="py-3"><StatusPill status={c.status} /></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <div className="mt-4 flex items-center justify-between text-xs text-muted-foreground">
            <span>Showing {filtered.length} of {campaigns.length}</span>
            <div className="flex gap-1">
              <Button size="sm" variant="outline" className="h-7 border-border bg-transparent text-xs">Prev</Button>
              <Button size="sm" variant="outline" className="h-7 border-border bg-transparent text-xs">Next</Button>
            </div>
          </div>
        </div>

        <div className="xl:col-span-4 rounded-xl border border-border bg-surface p-5">
          <SectionHeader title="Top Performing Segments" subtitle="By open rate" />
          <div className="mt-4 h-80">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={topSegmentsPerformance} layout="vertical" margin={{ top: 0, right: 20, left: 0, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#2A2A38" horizontal={false} />
                <XAxis type="number" stroke="#5A5A72" fontSize={10} tickLine={false} axisLine={false} />
                <YAxis type="category" dataKey="name" stroke="#9191A8" fontSize={11} tickLine={false} axisLine={false} width={120} />
                <Tooltip contentStyle={tooltipStyle} formatter={(v: any) => `${v}%`} />
                <Bar dataKey="openRate" radius={[0, 4, 4, 0]} barSize={16}>
                  {topSegmentsPerformance.map((s) => <Cell key={s.name} fill={tierColor(s.openRate)} />)}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Communication Timeline */}
      <div className="rounded-xl border border-border bg-surface p-5">
        <SectionHeader
          title="Communication Timeline"
          subtitle="Sends, deliveries and opens over time"
          action={
            <select value={campaignContext} onChange={(e) => setCampaignContext(e.target.value)}
              className="h-8 rounded-md border border-border bg-background px-2 text-xs text-foreground">
              {campaigns.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
            </select>
          }
        />
        <div className="mt-4 h-64">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={engagement14d} margin={{ top: 4, right: 10, left: -10, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#2A2A38" vertical={false} />
              <XAxis dataKey="day" stroke="#5A5A72" fontSize={11} tickLine={false} axisLine={false} />
              <YAxis stroke="#5A5A72" fontSize={11} tickLine={false} axisLine={false} />
              <Tooltip contentStyle={tooltipStyle} />
              <Line type="monotone" dataKey="delivered" stroke="#6366F1" strokeWidth={2} dot={false} />
              <Line type="monotone" dataKey="opened" stroke="#22C55E" strokeWidth={2} dot={false} />
              <Line type="monotone" dataKey="clicked" stroke="#EF4444" strokeWidth={2} dot={false} />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
}