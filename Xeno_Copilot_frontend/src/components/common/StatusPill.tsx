import type { CampaignStatus } from "@/data/mockData";
import { cn } from "@/lib/utils";

const config: Record<CampaignStatus, { label: string; cls: string }> = {
  active: { label: "Active", cls: "bg-emerald-500/15 text-emerald-400" },
  completed: { label: "Completed", cls: "bg-zinc-500/15 text-zinc-400" },
  draft: { label: "Draft", cls: "bg-amber-500/15 text-amber-400" },
  paused: { label: "Paused", cls: "bg-orange-500/15 text-orange-400" },
};

export function StatusPill({ status, className }: { status: CampaignStatus; className?: string }) {
  const c = config[status];
  return (
    <span className={cn("inline-flex items-center gap-1.5 rounded-md px-2 py-0.5 text-xs font-medium", c.cls, className)}>
      <span className={cn("h-1.5 w-1.5 rounded-full", status === "active" && "bg-emerald-400 animate-pulse", status === "completed" && "bg-zinc-400", status === "draft" && "bg-amber-400", status === "paused" && "bg-orange-400")} />
      {c.label}
    </span>
  );
}
