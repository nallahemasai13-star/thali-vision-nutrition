import { createFileRoute } from "@tanstack/react-router";
import { PageHeader } from "@/components/AppShell";
import { MealBuilder } from "@/components/MealBuilder";
export const Route = createFileRoute("/_authenticated/calculator")({
  head: () => ({ meta: [{ title: "Nutrition calculator — ThaliSense AI" }, { name: "description", content: "Nutrition calculator in ThaliSense AI." }, { property: "og:title", content: "Nutrition calculator — ThaliSense AI" }, { property: "og:description", content: "Nutrition calculator in ThaliSense AI." }] }),
  component: () => (<div><PageHeader title="Nutrition calculator" /><MealBuilder /></div>),
});
