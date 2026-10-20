import { useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { useSuspenseQuery } from "@tanstack/react-query";
import { BarChart3 } from "lucide-react";
import { Bar, BarChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { EmptyState, PageHeader } from "@/components/AppShell";
import { Button } from "@/components/ui/button";
import { addDays, mealsQuery, startOfDay } from "@/lib/data";
import { dailyTotals } from "@/lib/meal-stats";

const since = () => addDays(startOfDay(), -29).toISOString();

export const Route = createFileRoute("/_authenticated/insights")({
  head: () => ({ meta: [{ title: "Insights — ThaliSense AI" }, { name: "description", content: "Daily and weekly nutrition trends built from your saved meals." }, { property: "og:title", content: "Insights — ThaliSense AI" }, { property: "og:description", content: "Nutrition trends from your saved meals." }] }),
  loader: ({ context }) => context.queryClient.ensureQueryData(mealsQuery(since())),
  component: Insights,
});

function Insights() {
  const [from] = useState(since);
  const { data: meals } = useSuspenseQuery(mealsQuery(from));
  const [range, setRange] = useState<7 | 30>(7);
  const days = dailyTotals(meals, range);
  const logged = days.filter((d) => d.meals > 0);
  const avg = (k: "calories_kcal" | "protein_g") => logged.length ? Math.round(logged.reduce((s, d) => s + d[k], 0) / logged.length) : 0;

  return <div>
    <PageHeader title="Insights" description="Built only from meals you've saved. All values are estimates."
      action={<div className="flex gap-1">{([7, 30] as const).map((r) => <Button key={r} size="sm" variant={range === r ? "default" : "outline"} onClick={() => setRange(r)}>Last {r} days</Button>)}</div>} />
    {logged.length < 2 ? <EmptyState icon={BarChart3} title="Not enough data yet" body={`Log meals on at least two days in the last ${range} days to see trends. You have ${logged.length}.`} /> : <div className="space-y-6">
      <dl className="grid grid-cols-2 gap-3 md:grid-cols-3">
        <div className="card-surface p-4"><dt className="text-xs text-muted-foreground">Days logged</dt><dd className="font-display text-2xl">{logged.length}</dd></div>
        <div className="card-surface p-4"><dt className="text-xs text-muted-foreground">Avg kcal / logged day</dt><dd className="font-display text-2xl">{avg("calories_kcal")}</dd></div>
        <div className="card-surface p-4"><dt className="text-xs text-muted-foreground">Avg protein / logged day</dt><dd className="font-display text-2xl">{avg("protein_g")} g</dd></div>
      </dl>
      {([["Calories (kcal)", "calories_kcal"], ["Protein (g)", "protein_g"]] as const).map(([title, key]) => <section key={key} className="card-surface p-4">
        <h2 className="mb-3 font-semibold">{title}</h2>
        <div className="h-64"><ResponsiveContainer><BarChart data={days}>
          <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
          <XAxis dataKey="day" tickFormatter={(d: string) => d.slice(5)} fontSize={11} />
          <YAxis fontSize={11} />
          <Tooltip />
          <Bar dataKey={key} fill="var(--primary)" radius={[4, 4, 0, 0]} />
        </BarChart></ResponsiveContainer></div>
      </section>)}
    </div>}
  </div>;
}
