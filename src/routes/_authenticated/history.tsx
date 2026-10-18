import { createFileRoute } from "@tanstack/react-router";
import { PageHeader } from "@/components/AppShell";

export const Route = createFileRoute("/_authenticated/history")({
  head: () => ({ meta: [{ title: "History — ThaliSense AI" }, { name: "description", content: "History in ThaliSense AI." }, { property: "og:title", content: "History — ThaliSense AI" }, { property: "og:description", content: "History in ThaliSense AI." }] }),
  component: () => (<div><PageHeader title="History" /><p className="text-muted-foreground">Coming soon.</p></div>),
});
