import { createFileRoute } from "@tanstack/react-router";
import { PageHeader } from "@/components/AppShell";
import { MealBuilder } from "@/components/MealBuilder";
export const Route = createFileRoute("/_authenticated/analyze")({
  head: () => ({ meta: [{ title: "Analyze food — ThaliSense AI" }, { name: "description", content: "Analyze food in ThaliSense AI." }, { property: "og:title", content: "Analyze food — ThaliSense AI" }, { property: "og:description", content: "Analyze food in ThaliSense AI." }] }),
  component: () => (<div><PageHeader title="Analyze food" /><p className="text-muted-foreground">Photo analysis screen is not finished yet. Pick your dish manually below.</p><div className="mt-6"><MealBuilder /></div></div>),
});
