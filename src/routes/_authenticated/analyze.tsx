import { createFileRoute } from "@tanstack/react-router";
import { PageHeader } from "@/components/AppShell";
import { PhotoAnalyzer } from "@/components/PhotoAnalyzer";
import { catalogQuery } from "@/lib/data";
export const Route = createFileRoute("/_authenticated/analyze")({
  head: () => ({ meta: [{ title: "Analyze food — ThaliSense AI" }, { name: "description", content: "Analyze food in ThaliSense AI." }, { property: "og:title", content: "Analyze food — ThaliSense AI" }, { property: "og:description", content: "Analyze food in ThaliSense AI." }] }),
  loader: ({ context }) => context.queryClient.ensureQueryData(catalogQuery),
  component: () => (<div><PageHeader title="Analyze food" /><PhotoAnalyzer /></div>),
});
