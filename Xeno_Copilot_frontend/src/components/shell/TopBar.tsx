import { useEffect, useRef } from "react";
import { useRouterState } from "@tanstack/react-router";
import { Bell, Search } from "lucide-react";

const titleMap: Record<string, string> = {
  "/": "Dashboard",
  "/copilot": "AI Copilot",
  "/analytics": "Campaign Analytics",
  "/customers": "Customer Explorer",
  "/campaigns": "Campaigns",
  "/settings": "Settings",
};

export function TopBar() {
  const pathname = useRouterState({ select: (s) => s.location.pathname });
  const title = titleMap[pathname] ?? "Xeno Copilot";
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "k") {
        e.preventDefault();
        inputRef.current?.focus();
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  return (
    <header className="flex h-14 shrink-0 items-center justify-between border-b border-border bg-background/80 px-6 backdrop-blur">
      <h1 className="text-sm font-semibold tracking-tight text-foreground">{title}</h1>
      <div className="flex items-center gap-3">
        <div className="relative">
          <Search className="pointer-events-none absolute left-2.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-muted-foreground" />
          <input
            ref={inputRef}
            placeholder="Search…"
            className="h-8 w-64 rounded-md border border-border bg-surface pl-8 pr-14 text-xs text-foreground placeholder:text-muted-foreground focus:border-primary/50 focus:outline-none"
          />
          <kbd className="pointer-events-none absolute right-2 top-1/2 -translate-y-1/2 rounded border border-border bg-surface-elevated px-1.5 py-0.5 text-[10px] font-medium text-muted-foreground">⌘K</kbd>
        </div>
        <button className="relative rounded-md p-2 text-muted-foreground hover:bg-surface hover:text-foreground">
          <Bell className="h-4 w-4" />
          <span className="absolute right-1.5 top-1.5 h-1.5 w-1.5 rounded-full bg-red-500" />
        </button>
        <div className="flex h-7 w-7 items-center justify-center rounded-full bg-gradient-to-br from-primary to-purple-500 text-[10px] font-semibold text-white">PM</div>
      </div>
    </header>
  );
}
