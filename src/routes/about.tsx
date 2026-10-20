import { createFileRoute } from "@tanstack/react-router";
import { PageHeader } from "@/components/AppShell";

export const Route = createFileRoute("/about")({
  head: () => ({ meta: [{ title: "Methodology — ThaliSense AI" }, { name: "description", content: "How ThaliSense recognizes dishes, calculates nutrition, and where its estimates fall short." }, { property: "og:title", content: "Methodology — ThaliSense AI" }, { property: "og:description", content: "How ThaliSense recognizes dishes and estimates nutrition." }] }),
  component: About,
});

const SECTIONS = [
  ["Image classification", "Photos are sent once to a general-purpose vision AI (served through Lovable AI) that must choose from the dish labels in our catalog. No custom-trained ThaliSense model is deployed yet. Photos are analyzed in memory and are not stored."],
  ["Confidence scores", "The percentages shown are the AI's own self-reported estimates. They are not calibrated probabilities and have not been validated against a test set. Always confirm the dish yourself."],
  ["Accuracy", "We have not measured recognition accuracy. Every dish is marked experimental and not evaluated. We make no accuracy claims."],
  ["Nutrition calculation", "Estimated nutrient = value per 100 g × serving weight (g) ÷ 100. Nutrients missing from the source are shown as unavailable and are never counted as zero."],
  ["Data sources & limitations", "Values are recipe-based approximations referencing the Indian Food Composition Tables 2017 (ICMR-NIN) and are marked unverified until checked. Home recipes vary widely in oil, ghee, coconut and portion size."],
  ["Estimates vs. lab measurements", "A laboratory analysis measures the actual food. ThaliSense only estimates from typical recipes and your entered weight, so real values can differ substantially. This app is not medical or dietary advice."],
] as const;

function About() {
  return <div className="max-w-3xl">
    <PageHeader title="Methodology" description="What ThaliSense does, how, and what it cannot tell you." />
    <div className="space-y-4">
      {SECTIONS.map(([t, b]) => <section key={t} className="card-surface p-5"><h2 className="text-lg font-semibold">{t}</h2><p className="mt-2 text-sm text-muted-foreground">{b}</p></section>)}
    </div>
  </div>;
}
