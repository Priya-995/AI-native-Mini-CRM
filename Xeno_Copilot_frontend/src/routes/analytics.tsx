import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { Calendar, Search, ChevronDown, Eye, Copy, ArrowUp, ArrowDown } from "lucide-react";
import { SectionHeader } from "@/components/common/SectionHeader";
import { ChannelBadge, ChannelIcon } from "@/components/common/ChannelBadge";
import { StatusPill } from "@/components/common/StatusPill";
import { campaigns, deliveryFunnel, engagement14d, topSegmentsPerformance } from "@/data/mockData";
import { formatINR, formatNumber, formatPercent } from "@/lib/format";
import { Bar, BarChart, CartesianGrid, Cell, Line, LineChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { tooltipStyle } from "./index";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/analytics")({
  head: () => ({
    meta: [
      { title: "Campaign Analytics — Xeno" },
      { name: "description", content: "Deep funnel, channel and segment analytics across your campaigns." },
    ],
  }),
  component: AnalyticsPage,
});

const summary = [
  { label: "Sent", value: 120240, delta: 12.4, pos: true },
  { label: "Delivered", value: 117810, delta: 11.8, pos: true, pct: "97.9%" },
  { label: "Opened", value: 48450, delta: 4.2, pos: true, pct: "41.1%" },
  { label: "Clicked", value: 15920, delta: -2.1, pos: false, pct: "32.9%" },
  { label: "Converted", value: 4780, delta: 18.7, pos: true, pct: "30.0%" },
];

function AnalyticsPage() {
  const [search, setSearch] = useState("");
  const [channelFilter, setChannelFilter] = useState<string>("all");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [campaignContext, setCampaignContext] = useState(campaigns[0].id);

  const filtered = campaigns.filter((c) =>
    (channelFilter === "all" || c.channel === channelFilter) &&
    (statusFilter === "all" || c.status === statusFilter) &&
    c.name.toLowerCase().includes(search.toLowerCase())
  );

  const tierColor = (rate: number) => rate >= 60 ? "#22C55E" : rate >= 40 ? "#6366F1" : rate >= 30 ? "#F59E0B" : "#EF4444";

  return (
    <div className="space-y-6 p-6">
      <div className="flex items-end justify-between">
        <div>
          <nav className="text-xs text-muted-foreground"><span>Analytics</span> <span className="mx-1.5">/</span> <span className="text-foreground">Campaigns</span></nav>
          <h1 className="mt-1 text-xl font-semibold tracking-tight text-foreground">Campaign Analytics</h1>
        </div>
        <button className="inline-flex items-center gap-2 rounded-md border border-border bg-surface px-3 py-1.5 text-xs font-medium text-foreground hover:bg-surface-elevated">
          <Calendar className="h-3.5 w-3.5 text-muted-foreground" /> Last 30 days <ChevronDown className="h-3 w-3 text-muted-foreground" />
        </button>
      </div>

      {/* Summary */}
      <div className="grid grid-cols-2 gap-4 md:grid-cols-5">
        {summary.map((s) => (
          <div key={s.label} className="card-hover rounded-xl border border-border bg-surface p-4">
            <p className="text-[11px] font-medium uppercase tracking-wider text-muted-foreground">{s.label}</p>
            <p className="mt-1.5 text-xl font-semibold text-foreground">{formatNumber(s.value)}</p>
            <div className="mt-2 flex items-center justify-between">
              {s.pct && <span className="text-xs text-muted-foreground">{s.pct}</span>}
              <span className={cn("inline-flex items-center gap-0.5 rounded-md px-1.5 py-0.5 text-[11px] font-medium", s.pos ? "bg-emerald-500/15 text-emerald-400" : "bg-red-500/15 text-red-400")}>
                {s.pos ? <ArrowUp className="h-2.5 w-2.5" /> : <ArrowDown className="h-2.5 w-2.5" />}{Math.abs(s.delta)}%
              </span>
            </div>
          </div>
        ))}
      </div>

      {/* Funnel */}
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

      {/* Table + top segments */}
      <div className="grid grid-cols-1 gap-4 xl:grid-cols-12">
        <div className="xl:col-span-8 rounded-xl border border-border bg-surface p-5">
          <SectionHeader title="Campaigns" subtitle={`${filtered.length} campaigns`} />
          <div className="mt-4 flex flex-wrap items-center gap-2">
            <div className="relative flex-1 min-w-[200px]">
              <Search className="pointer-events-none absolute left-2.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-muted-foreground" />
              <input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search campaigns…" className="h-8 w-full rounded-md border border-border bg-background pl-8 pr-3 text-xs text-foreground placeholder:text-muted-foreground focus:border-primary/50 focus:outline-none" />
            </div>
            <select value={channelFilter} onChange={(e) => setChannelFilter(e.target.value)} className="h-8 rounded-md border border-border bg-background px-2 text-xs text-foreground">
              <option value="all">All channels</option>
              <option value="whatsapp">WhatsApp</option>
              <option value="email">Email</option>
              <option value="sms">SMS</option>
              <option value="rcs">RCS</option>
            </select>
            <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)} className="h-8 rounded-md border border-border bg-background px-2 text-xs text-foreground">
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
                  <th className="pb-2 font-medium">Name</th>
                  <th className="pb-2 font-medium">Ch</th>
                  <th className="pb-2 font-medium">Sent</th>
                  <th className="pb-2 font-medium">Del%</th>
                  <th className="pb-2 font-medium">Open%</th>
                  <th className="pb-2 font-medium">CTR%</th>
                  <th className="pb-2 font-medium">Conv</th>
                  <th className="pb-2 font-medium">Revenue</th>
                  <th className="pb-2 font-medium">Status</th>
                  <th className="pb-2 font-medium"></th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((c) => (
                  <tr key={c.id} className="border-b border-border/40 last:border-0 hover:bg-surface-elevated/40">
                    <td className="py-3 font-medium text-foreground">{c.name}</td>
                    <td className="py-3"><ChannelIcon channel={c.channel} /></td>
                    <td className="py-3 text-muted-foreground">{formatNumber(c.sent)}</td>
                    <td className="py-3 text-muted-foreground">{formatPercent((c.delivered / c.sent) * 100)}</td>
                    <td className="py-3 text-muted-foreground">{formatPercent((c.opened / c.delivered) * 100)}</td>
                    <td className="py-3 text-muted-foreground">{formatPercent((c.clicked / c.opened) * 100)}</td>
                    <td className="py-3 text-muted-foreground">{formatNumber(c.converted)}</td>
                    <td className="py-3 font-medium text-foreground">{formatINR(c.revenue)}</td>
                    <td className="py-3"><StatusPill status={c.status} /></td>
                    <td className="py-3">
                      <div className="flex gap-1 opacity-0 transition-opacity group-hover:opacity-100">
                        <button className="rounded p-1 text-muted-foreground hover:bg-surface-elevated hover:text-foreground"><Eye className="h-3.5 w-3.5" /></button>
                        <button className="rounded p-1 text-muted-foreground hover:bg-surface-elevated hover:text-foreground"><Copy className="h-3.5 w-3.5" /></button>
                      </div>
                    </td>
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
          subtitle="Sends, deliveries and failures over time"
          action={
            <select value={campaignContext} onChange={(e) => setCampaignContext(e.target.value)} className="h-8 rounded-md border border-border bg-background px-2 text-xs text-foreground">
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
