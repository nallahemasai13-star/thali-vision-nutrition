import { createFileRoute } from "@tanstack/react-router";
import { PageHeader } from "@/components/AppShell";

export const Route = createFileRoute("/")({
  head: () => ({ meta: [{ title: "Dashboard — ThaliSense AI" }, { name: "description", content: "Dashboard in ThaliSense AI." }, { property: "og:title", content: "Dashboard — ThaliSense AI" }, { property: "og:description", content: "Dashboard in ThaliSense AI." }] }),
  component: () => (<div><PageHeader title="Dashboard" /><p className="text-muted-foreground">Welcome to ThaliSense AI. Use the calculator to log a meal.</p></div>),
});
