import { Link, useRouterState } from "@tanstack/react-router";
import { useState } from "react";
import { LayoutDashboard, Sparkles, Megaphone, BarChart3, Users, Settings, LogOut, ChevronsLeft, Zap } from "lucide-react";
import { cn } from "@/lib/utils";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";

const nav = [
  { to: "/", label: "Dashboard", icon: LayoutDashboard, exact: true },
  { to: "/copilot", label: "AI Copilot", icon: Sparkles, badge: "AI" },
  { to: "/campaigns", label: "Campaigns", icon: Megaphone },
  { to: "/analytics", label: "Analytics", icon: BarChart3 },
  { to: "/customers", label: "Customers", icon: Users },
] as const;

export function AppSidebar() {
  const [collapsed, setCollapsed] = useState(false);
  const pathname = useRouterState({ select: (s) => s.location.pathname });

  const isActive = (to: string, exact?: boolean) => (exact ? pathname === to : pathname.startsWith(to));

  return (
    <TooltipProvider delayDuration={120}>
      <aside
        className={cn(
          "flex h-screen flex-col border-r border-border bg-surface/60 backdrop-blur transition-all duration-200",
          collapsed ? "w-14" : "w-60"
        )}
      >
        {/* Brand */}
        <div className={cn("flex h-14 items-center border-b border-border px-3", collapsed ? "justify-center" : "justify-between")}>
          <Link to="/" className="flex items-center gap-2">
            <div className="flex h-7 w-7 items-center justify-center rounded-md bg-primary/15 text-primary">
              <Zap className="h-4 w-4 fill-primary" />
            </div>
            {!collapsed && (
              <>
                <span className="text-sm font-semibold tracking-tight text-foreground">Xeno</span>
                <span className="rounded-md border border-border bg-surface-elevated px-1.5 py-0.5 text-[10px] font-medium uppercase tracking-wider text-muted-foreground">Beta</span>
              </>
            )}
          </Link>
          {!collapsed && (
            <button onClick={() => setCollapsed(true)} className="rounded-md p-1 text-muted-foreground hover:bg-surface-elevated hover:text-foreground">
              <ChevronsLeft className="h-4 w-4" />
            </button>
          )}
        </div>

        {/* Nav */}
        <nav className="flex-1 space-y-0.5 p-2">
          {nav.map((item) => {
            const active = isActive(item.to, "exact" in item ? item.exact : false);
            const Icon = item.icon;
            const link = (
              <Link
                key={item.to}
                to={item.to}
                className={cn(
                  "group relative flex items-center gap-3 rounded-md px-2.5 py-2 text-sm font-medium transition-colors",
                  active ? "bg-primary/10 text-foreground" : "text-muted-foreground hover:bg-surface-elevated hover:text-foreground",
                  collapsed && "justify-center"
                )}
              >
                {active && <span className="absolute left-0 top-1/2 h-5 w-0.5 -translate-y-1/2 rounded-r-full bg-primary" />}
                <Icon className={cn("h-4 w-4 shrink-0", active && "text-primary")} />
                {!collapsed && <span className="flex-1">{item.label}</span>}
                {!collapsed && "badge" in item && item.badge && (
                  <span className="rounded-md bg-primary px-1.5 py-0.5 text-[10px] font-semibold uppercase text-primary-foreground">{item.badge}</span>
                )}
              </Link>
            );
            return collapsed ? (
              <Tooltip key={item.to}>
                <TooltipTrigger asChild>{link}</TooltipTrigger>
                <TooltipContent side="right">{item.label}</TooltipContent>
              </Tooltip>
            ) : link;
          })}
        </nav>

        {/* Settings */}
        <div className="border-t border-border p-2">
          <Link
            to="/settings"
            className={cn(
              "flex items-center gap-3 rounded-md px-2.5 py-2 text-sm font-medium text-muted-foreground hover:bg-surface-elevated hover:text-foreground",
              collapsed && "justify-center"
            )}
          >
            <Settings className="h-4 w-4" />
            {!collapsed && "Settings"}
          </Link>
        </div>

        {/* User */}
        <div className={cn("flex items-center gap-3 border-t border-border p-3", collapsed && "justify-center")}>
          <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-primary to-purple-500 text-xs font-semibold text-white">
            PM
          </div>
          {!collapsed && (
            <>
              <div className="flex-1 min-w-0">
                <p className="truncate text-xs font-medium text-foreground">Priya Mehta</p>
                <p className="truncate text-[11px] text-muted-foreground">Growth Lead</p>
              </div>
              <button className="rounded-md p-1 text-muted-foreground hover:bg-surface-elevated hover:text-foreground">
                <LogOut className="h-3.5 w-3.5" />
              </button>
            </>
          )}
        </div>

        {collapsed && (
          <button
            onClick={() => setCollapsed(false)}
            className="absolute left-14 top-3 z-10 hidden h-6 w-6 -translate-x-1/2 items-center justify-center rounded-full border border-border bg-surface text-muted-foreground hover:text-foreground"
          >
            <ChevronsLeft className="h-3 w-3 rotate-180" />
          </button>
        )}
      </aside>
    </TooltipProvider>
  );
}
