import type { SegmentType } from "@/data/mockData";
import { cn } from "@/lib/utils";

const config: Record<SegmentType, { label: string; cls: string }> = {
  vip: { label: "VIP", cls: "bg-amber-500/15 text-amber-400 border-amber-500/30" },
  "at-risk": { label: "At-Risk", cls: "bg-red-500/15 text-red-400 border-red-500/30" },
  new: { label: "New", cls: "bg-blue-500/15 text-blue-400 border-blue-500/30" },
  loyal: { label: "Loyal", cls: "bg-emerald-500/15 text-emerald-400 border-emerald-500/30" },
  lapsed: { label: "Lapsed", cls: "bg-zinc-500/15 text-zinc-400 border-zinc-500/30" },
};

export function SegmentPill({ type, className }: { type: SegmentType; className?: string }) {
  const c = config[type];
  return (
    <span className={cn("inline-flex items-center rounded-md border px-2 py-0.5 text-xs font-medium", c.cls, className)}>
      {c.label}
    </span>
  );
}
