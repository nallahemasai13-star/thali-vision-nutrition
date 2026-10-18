import { createFileRoute } from "@tanstack/react-router";
import { PageHeader } from "@/components/AppShell";

export const Route = createFileRoute("/_authenticated/insights")({
  head: () => ({ meta: [{ title: "Insights — ThaliSense AI" }, { name: "description", content: "Insights in ThaliSense AI." }, { property: "og:title", content: "Insights — ThaliSense AI" }, { property: "og:description", content: "Insights in ThaliSense AI." }] }),
  component: () => (<div><PageHeader title="Insights" /><p className="text-muted-foreground">Coming soon.</p></div>),
});
