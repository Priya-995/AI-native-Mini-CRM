import { createFileRoute } from "@tanstack/react-router";
import { Settings as SettingsIcon } from "lucide-react";
import { EmptyState } from "@/components/common/EmptyState";

export const Route = createFileRoute("/settings")({
  head: () => ({ meta: [{ title: "Settings — Xeno" }] }),
  component: () => (
    <div className="p-6">
      <h1 className="mb-6 text-xl font-semibold text-foreground">Settings</h1>
      <EmptyState icon={SettingsIcon} title="Workspace settings" description="Team, integrations, billing — all in one place." />
    </div>
  ),
});
