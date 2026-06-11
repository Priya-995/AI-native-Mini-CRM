import type { ReactNode } from "react";

export function SectionHeader({ title, subtitle, action, badge }: { title: string; subtitle?: string; action?: ReactNode; badge?: ReactNode }) {
  return (
    <div className="flex items-start justify-between gap-4">
      <div>
        <div className="flex items-center gap-2">
          <h2 className="text-base font-semibold text-foreground">{title}</h2>
          {badge}
        </div>
        {subtitle && <p className="mt-0.5 text-sm text-muted-foreground">{subtitle}</p>}
      </div>
      {action}
    </div>
  );
}
