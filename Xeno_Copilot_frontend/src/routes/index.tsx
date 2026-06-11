import { createFileRoute, Link } from "@tanstack/react-router";
import { Users, Send, Mail, TrendingUp, ArrowRight } from "lucide-react";
import { KPICard } from "@/components/kpi/KPICard";
import { AICopilotWidget } from "@/components/copilot/AICopilotWidget";
import { SectionHeader } from "@/components/common/SectionHeader";
import { ChannelIcon } from "@/components/common/ChannelBadge";
import { StatusPill } from "@/components/common/StatusPill";
import { channelPerformance, engagement14d, engagement30d, engagement90d, sparklineData, sparklineDataDown } from "@/data/mockData";
import { formatINR, formatNumber, formatPercent } from "@/lib/format";
import { useState, useEffect } from "react";
import { Area, AreaChart, CartesianGrid, Cell, Pie, PieChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { cn } from "@/lib/utils";
import { fetchCampaigns, fetchStats } from "@/lib/api/api";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Dashboard — Xeno Copilot" },
    ],
  }),
  component: Dashboard,
});

export const tooltipStyle: React.CSSProperties = {
  background: "#212130",
  border: "1px solid #2A2A38",
  borderRadius: 8,
  fontSize: 12,
  color: "#F1F1F5",
};

function Dashboard() {
  const [range, setRange] = useState<"14D" | "30D" | "90D">("14D");
  const [campaigns, setCampaigns] = useState<any[]>([]);
  const [stats, setStats] = useState<any>(null);
  const data = range === "14D" ? engagement14d : range === "30D" ? engagement30d : engagement90d;

  useEffect(() => {
    fetchCampaigns().then(setCampaigns);
    fetchStats().then(setStats);
  }, []);

  return (
    <div className="space-y-6 p-6">
      {/* KPI Row */}
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-4">
        <KPICard icon={Users} label="Total Customers" value={stats ? formatNumber(stats.totalCustomers) : "..."} delta="12.4%" deltaPositive sparkData={sparklineData} sparkColor="#6366F1" iconColor="text-primary" />
        <KPICard icon={Send} label="Campaigns Sent" value={stats ? formatNumber(stats.activeCampaigns) : "..."} delta="+8 this week" deltaPositive sparkData={sparklineData} sparkColor="#22C55E" iconColor="text-emerald-400" />
        <KPICard icon={Mail} label="Avg. Open Rate" value={stats ? `${stats.avgOpenRate}%` : "..."} delta="1.2%" deltaPositive={false} sparkData={sparklineDataDown} sparkColor="#F59E0B" iconColor="text-amber-400" />
        <KPICard icon={TrendingUp} label="Revenue Attributed" value={stats ? formatINR(stats.totalRevenue) : "..."} delta="18.7%" deltaPositive sparkData={sparklineData} sparkColor="#22C55E" iconColor="text-emerald-400" />
      </div>

      {/* Copilot hero */}
      <AICopilotWidget />

      {/* Recent campaigns + Channel performance */}
      <div className="grid grid-cols-1 gap-4 xl:grid-cols-12">
        <div className="xl:col-span-7 rounded-xl border border-border bg-surface p-5">
          <SectionHeader
            title="Recent Campaigns"
            subtitle="Last 7 days"
            action={<Link to="/analytics" className="inline-flex items-center gap-1 text-xs font-medium text-primary hover:underline">View all <ArrowRight className="h-3 w-3" /></Link>}
          />
          <div className="mt-4 overflow-hidden">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border text-left text-[11px] font-medium uppercase tracking-wider text-muted-foreground">
                  <th className="pb-2 font-medium">Campaign</th>
                  <th className="pb-2 font-medium">Channel</th>
                  <th className="pb-2 font-medium">Sent</th>
                  <th className="pb-2 font-medium">Open</th>
                  <th className="pb-2 font-medium">Status</th>
                </tr>
              </thead>
              <tbody>
                {campaigns.slice(0, 5).map((c) => (
                  <tr key={c.id} className="border-b border-border/50 last:border-0 transition-colors hover:bg-surface-elevated/40">
                    <td className="py-3 font-medium text-foreground">{c.name}</td>
                    <td className="py-3"><ChannelIcon channel={c.channel} /></td>
                    <td className="py-3 text-muted-foreground">{formatNumber(c.sent)}</td>
                    <td className="py-3 text-muted-foreground">
                      {c.sent > 0 ? formatPercent((c.opened / c.sent) * 100, 1) : "0%"}
                    </td>
                    <td className="py-3"><StatusPill status={c.status} /></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        <div className="xl:col-span-5 rounded-xl border border-border bg-surface p-5">
          <SectionHeader title="Channel Performance" badge={<span className="rounded-md border border-border px-1.5 py-0.5 text-[10px] font-medium text-muted-foreground">Last 30 days</span>} />
          <div className="mt-4 flex items-center gap-6">
            <div className="h-44 w-44 shrink-0">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie data={channelPerformance} dataKey="value" innerRadius={48} outerRadius={70} strokeWidth={0} paddingAngle={2}>
                    {channelPerformance.map((c) => <Cell key={c.name} fill={c.color} />)}
                  </Pie>
                  <Tooltip contentStyle={tooltipStyle} formatter={(v: any) => `${v}%`} />
                </PieChart>
              </ResponsiveContainer>
            </div>
            <div className="flex-1 space-y-3">
              {channelPerformance.map((c) => (
                <div key={c.name} className="flex items-center gap-2.5 text-sm">
                  <span className="h-2.5 w-2.5 rounded-sm" style={{ background: c.color }} />
                  <span className="flex-1 text-muted-foreground">{c.name}</span>
                  <span className="font-medium text-foreground">{c.value}%</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Engagement over time */}
      <div className="rounded-xl border border-border bg-surface p-5">
        <SectionHeader
          title="Engagement Over Time"
          subtitle="Delivered, opened and clicked across all campaigns"
          action={
            <div className="inline-flex rounded-md border border-border bg-background p-0.5">
              {(["14D", "30D", "90D"] as const).map((r) => (
                <button key={r} onClick={() => setRange(r)}
                  className={cn("rounded px-3 py-1 text-xs font-medium transition-colors",
                    range === r ? "bg-primary text-primary-foreground" : "text-muted-foreground hover:text-foreground"
                  )}>{r}</button>
              ))}
            </div>
          }
        />
        <div className="mt-4 h-72">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={data} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
              <defs>
                <linearGradient id="g-del" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stopColor="#6366F1" stopOpacity={0.4} /><stop offset="100%" stopColor="#6366F1" stopOpacity={0} /></linearGradient>
                <linearGradient id="g-open" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stopColor="#22C55E" stopOpacity={0.3} /><stop offset="100%" stopColor="#22C55E" stopOpacity={0} /></linearGradient>
                <linearGradient id="g-click" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stopColor="#F59E0B" stopOpacity={0.3} /><stop offset="100%" stopColor="#F59E0B" stopOpacity={0} /></linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#2A2A38" vertical={false} />
              <XAxis dataKey="day" stroke="#5A5A72" fontSize={11} tickLine={false} axisLine={false} interval={range === "90D" ? 8 : range === "30D" ? 3 : 1} />
              <YAxis stroke="#5A5A72" fontSize={11} tickLine={false} axisLine={false} />
              <Tooltip contentStyle={tooltipStyle} />
              <Area type="monotone" dataKey="delivered" stroke="#6366F1" strokeWidth={2} fill="url(#g-del)" />
              <Area type="monotone" dataKey="opened" stroke="#22C55E" strokeWidth={2} fill="url(#g-open)" />
              <Area type="monotone" dataKey="clicked" stroke="#F59E0B" strokeWidth={2} fill="url(#g-click)" />
            </AreaChart>
          </ResponsiveContainer>
        </div>
        <div className="mt-3 flex flex-wrap gap-4 text-xs">
          <Legend color="#6366F1" label="Delivered" />
          <Legend color="#22C55E" label="Opened" />
          <Legend color="#F59E0B" label="Clicked" />
        </div>
      </div>
    </div>
  );
}

function Legend({ color, label }: { color: string; label: string }) {
  return (
    <span className="inline-flex items-center gap-2 text-muted-foreground">
      <span className="h-2 w-2 rounded-sm" style={{ background: color }} />
      {label}
    </span>
  );
}