import { createFileRoute } from "@tanstack/react-router";
import { PageHeader } from "@/components/AppShell";

export const Route = createFileRoute("/_authenticated/profile")({
  head: () => ({ meta: [{ title: "Profile — ThaliSense AI" }, { name: "description", content: "Profile in ThaliSense AI." }, { property: "og:title", content: "Profile — ThaliSense AI" }, { property: "og:description", content: "Profile in ThaliSense AI." }] }),
  component: () => (<div><PageHeader title="Profile" /><p className="text-muted-foreground">Coming soon.</p></div>),
});
