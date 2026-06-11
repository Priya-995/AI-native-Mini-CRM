import { createFileRoute, Link } from "@tanstack/react-router";
import { Megaphone } from "lucide-react";
import { EmptyState } from "@/components/common/EmptyState";

export const Route = createFileRoute("/campaigns")({
  head: () => ({ meta: [{ title: "Campaigns — Xeno" }] }),
  component: () => (
    <div className="p-6">
      <h1 className="mb-6 text-xl font-semibold text-foreground">Campaigns</h1>
      <EmptyState
        icon={Megaphone}
        title="Campaign workspace coming soon"
        description="In the meantime, view live campaign performance under Analytics."
        cta="Open Analytics"
      />
      <div className="mt-4 text-center">
        <Link to="/analytics" className="text-xs font-medium text-primary hover:underline">Go to Analytics →</Link>
      </div>
    </div>
  ),
});
