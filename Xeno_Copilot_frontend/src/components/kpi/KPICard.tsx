import type { LucideIcon } from "lucide-react";
import { ArrowDown, ArrowUp } from "lucide-react";
import { Sparkline } from "./Sparkline";
import { cn } from "@/lib/utils";

interface Props {
  icon: LucideIcon;
  label: string;
  value: string;
  delta: string;
  deltaPositive: boolean;
  sparkData: { v: number }[];
  sparkColor?: string;
  iconColor?: string;
}

export function KPICard({ icon: Icon, label, value, delta, deltaPositive, sparkData, sparkColor = "#6366F1", iconColor = "text-primary" }: Props) {
  return (
    <div className="card-hover rounded-xl border border-border bg-surface p-5">
      <div className="flex items-start justify-between">
        <div className={cn("flex h-9 w-9 items-center justify-center rounded-lg bg-primary/10", iconColor)}>
          <Icon className="h-4.5 w-4.5" />
        </div>
        <span className={cn("inline-flex items-center gap-0.5 rounded-md px-2 py-0.5 text-xs font-medium", deltaPositive ? "bg-emerald-500/15 text-emerald-400" : "bg-red-500/15 text-red-400")}>
          {deltaPositive ? <ArrowUp className="h-3 w-3" /> : <ArrowDown className="h-3 w-3" />}
          {delta}
        </span>
      </div>
      <div className="mt-4">
        <p className="text-xs font-medium uppercase tracking-wider text-muted-foreground">{label}</p>
        <p className="mt-1 text-2xl font-semibold tracking-tight text-foreground">{value}</p>
      </div>
      <div className="mt-3 -mx-1">
        <Sparkline data={sparkData} color={sparkColor} />
      </div>
    </div>
  );
}
