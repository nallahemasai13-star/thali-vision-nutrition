import { createFileRoute } from "@tanstack/react-router";
import { PageHeader } from "@/components/AppShell";

export const Route = createFileRoute("/foods")({
  head: () => ({ meta: [{ title: "Supported foods — ThaliSense AI" }, { name: "description", content: "Supported foods in ThaliSense AI." }, { property: "og:title", content: "Supported foods — ThaliSense AI" }, { property: "og:description", content: "Supported foods in ThaliSense AI." }] }),
  component: () => (<div><PageHeader title="Supported foods" /><p className="text-muted-foreground">Coming soon.</p></div>),
});
