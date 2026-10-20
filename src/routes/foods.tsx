import { createFileRoute } from "@tanstack/react-router";
import { useSuspenseQuery } from "@tanstack/react-query";
import { PageHeader } from "@/components/AppShell";
import { catalogQuery } from "@/lib/data";

export const Route = createFileRoute("/foods")({
  head: () => ({ meta: [{ title: "Supported foods — ThaliSense AI" }, { name: "description", content: "Regional Indian dishes in the ThaliSense catalog, by category, with recognition and nutrition status." }, { property: "og:title", content: "Supported foods — ThaliSense AI" }, { property: "og:description", content: "Regional Indian dishes in the ThaliSense catalog." }] }),
  loader: ({ context }) => context.queryClient.ensureQueryData(catalogQuery),
  component: Foods,
});

function Foods() {
  const { data: foods } = useSuspenseQuery(catalogQuery);
  const map = new Map<string, typeof foods>();
  for (const f of foods) { const k = f.category || "Other"; map.set(k, [...(map.get(k) ?? []), f]); }
  const groups = [...map.entries()];
  return <div>
    <PageHeader title="Supported foods" description={`${foods.length} dishes. "Photo suggestions" means the vision AI may suggest this label; none have been evaluated for accuracy.`} />
    <div className="space-y-8">
      {groups.map(([cat, list]) => <section key={cat}>
        <h2 className="mb-3 text-xl font-semibold">{cat}</h2>
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {list!.map((f) => <article key={f.id} className="card-surface p-4">
            <h3 className="font-semibold">{f.name}</h3>
            <p className="text-xs text-muted-foreground">{f.region}</p>
            {f.description && <p className="mt-2 text-sm text-muted-foreground">{f.description}</p>}
            <div className="mt-3 flex flex-wrap gap-1.5 text-xs">
              <span className="rounded-full bg-accent px-2 py-0.5 text-accent-foreground">{f.support?.in_label_set ? "Photo suggestions · not evaluated" : "Nutrition catalog only"}</span>
              <span className="rounded-full bg-muted px-2 py-0.5">{f.nutrition ? (f.nutrition.verified ? "Nutrition verified" : "Nutrition estimate") : "No nutrition data"}</span>
            </div>
            {f.nutrition && <p className="mt-2 text-xs text-muted-foreground">Per 100 g: {f.nutrition.calories_kcal ?? "—"} kcal · Source: {f.nutrition.source?.name ?? "unknown"}</p>}
          </article>)}
        </div>
      </section>)}
    </div>
  </div>;
}
