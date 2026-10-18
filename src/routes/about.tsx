import { createFileRoute } from "@tanstack/react-router";
import { PageHeader } from "@/components/AppShell";

export const Route = createFileRoute("/about")({
  head: () => ({ meta: [{ title: "Methodology — ThaliSense AI" }, { name: "description", content: "Methodology in ThaliSense AI." }, { property: "og:title", content: "Methodology — ThaliSense AI" }, { property: "og:description", content: "Methodology in ThaliSense AI." }] }),
  component: () => (<div><PageHeader title="Methodology" /><p className="text-muted-foreground">ThaliSense uses a general vision AI limited to its food catalog. Confidence is self-reported, not a calibrated probability. Nutrition values are approximate recipe estimates.</p></div>),
});
