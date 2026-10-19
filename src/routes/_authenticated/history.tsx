import { createFileRoute, Link } from "@tanstack/react-router";
import { useSuspenseQuery } from "@tanstack/react-query";
import { Camera, History } from "lucide-react";
import { PageHeader, EmptyState } from "@/components/AppShell";
import { Button } from "@/components/ui/button";
import { mealsQuery } from "@/lib/data";

export const Route = createFileRoute("/_authenticated/history")({
  head: () => ({ meta: [{ title: "History — ThaliSense AI" }, { name: "description", content: "History in ThaliSense AI." }, { property: "og:title", content: "History — ThaliSense AI" }, { property: "og:description", content: "History in ThaliSense AI." }] }),
  loader: ({ context }) => context.queryClient.ensureQueryData(mealsQuery()),
  component: MealHistory,
});

function MealHistory() {
  const { data: meals } = useSuspenseQuery(mealsQuery());
  return <div>
    <PageHeader title="Meal history" action={<Button asChild><Link to="/analyze"><Camera /> Add meal</Link></Button>} />
    {meals.length === 0 ? <EmptyState icon={History} title="No meals yet" body="Your saved meals will appear here." /> : <div className="divide-y border-y">
      {meals.map((meal) => <article key={meal.id} className="flex flex-wrap items-center justify-between gap-4 py-5">
        <div className="min-w-0">
          <h2 className="break-words text-xl font-semibold">{meal.food_name}</h2>
          <p className="mt-1 text-sm text-muted-foreground">{new Date(meal.eaten_at).toLocaleString(undefined, { dateStyle: "medium", timeStyle: "short" })} · {meal.serving_g} g</p>
          <p className="mt-1 text-xs text-muted-foreground">{meal.input_method === "image_analysis" ? "Photo analysis" : "Manual entry"}{meal.corrected_class ? " · Dish corrected" : ""} · Estimated nutrition</p>
        </div>
        <dl className="grid grid-cols-3 gap-5 text-right text-sm">
          {([ ["Calories", "calories_kcal", "kcal"], ["Protein", "protein_g", "g"], ["Carbs", "carbs_g", "g"] ] as const).map(([label, key, unit]) => <div key={key}>
            <dt className="text-xs text-muted-foreground">{label}</dt><dd className="mt-1 font-semibold">{meal.nutrition_snapshot[key] == null ? "—" : `${meal.nutrition_snapshot[key]} ${unit}`}</dd>
          </div>)}
        </dl>
      </article>)}
    </div>}
  </div>;
}
