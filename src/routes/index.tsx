import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { Calculator, Camera, CheckCircle2, History, Loader2, Upload, XCircle } from "lucide-react";
import { PageHeader } from "@/components/AppShell";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/hooks/useAuth";
import { catalogQuery, mealsQuery, startOfDay } from "@/lib/data";
import { sumSnapshots } from "@/lib/nutrition";

export const Route = createFileRoute("/")({
  head: () => ({ meta: [
    { title: "ThaliSense AI — Regional Indian food recognition & nutrition" },
    { name: "description", content: "Photograph South Indian dishes, confirm the match, and log estimated nutrition from your real saved meals." },
    { property: "og:title", content: "ThaliSense AI — Regional Indian food recognition & nutrition" },
    { property: "og:description", content: "Photograph South Indian dishes, confirm the match, and log estimated nutrition." },
    { property: "og:type", content: "website" }, { name: "twitter:card", content: "summary_large_image" },
  ] }),
  component: Dashboard,
});

function Dashboard() {
  const { user, loading } = useAuth();
  const catalog = useQuery(catalogQuery);
  const today = startOfDay().toISOString();
  const meals = useQuery({ ...mealsQuery(today), enabled: !!user });
  const totals = sumSnapshots((meals.data ?? []).map((m) => m.nutrition_snapshot));

  return <div className="space-y-8">
    <PageHeader title={user ? "Today's plate" : "Know your thali"} description="Recognize regional Indian dishes from a photo, confirm the match, and log estimated nutrition." />
    <div className="grid gap-3 sm:grid-cols-3">
      <Button asChild size="lg" className="h-auto py-4"><Link to="/analyze"><Upload /> Analyze food photo</Link></Button>
      <Button asChild size="lg" variant="secondary" className="h-auto py-4"><Link to="/analyze"><Camera /> Scan with camera</Link></Button>
      <Button asChild size="lg" variant="outline" className="h-auto py-4"><Link to="/calculator"><Calculator /> Log meal manually</Link></Button>
    </div>

    {loading ? null : !user ? (
      <section className="card-surface p-6">
        <h2 className="text-xl font-semibold">Getting started</h2>
        <ol className="mt-3 list-decimal space-y-1.5 pl-5 text-sm text-muted-foreground">
          <li>Sign in so your meals are saved privately to your account.</li>
          <li>Upload or capture a photo of one dish — idli, dosa, sambar and more.</li>
          <li>Check the suggested matches and correct the dish if needed.</li>
          <li>Enter the portion in grams and save. Nutrition is an estimate.</li>
        </ol>
        <Button asChild className="mt-5"><Link to="/auth">Sign in to start</Link></Button>
      </section>
    ) : (
      <section>
        <h2 className="mb-3 text-xl font-semibold">Today's estimated totals</h2>
        {meals.isLoading ? <p className="flex items-center gap-2 text-sm text-muted-foreground"><Loader2 className="size-4 motion-safe:animate-spin" /> Loading your meals…</p>
          : meals.isError ? <p role="alert" className="text-sm text-destructive">Couldn't load today's meals. Refresh to try again.</p>
          : <>
            <dl className="grid grid-cols-2 gap-3 md:grid-cols-4">
              {([["Calories", totals.calories_kcal, "kcal"], ["Protein", totals.protein_g, "g"], ["Carbs", totals.carbs_g, "g"], ["Fat", totals.fat_g, "g"]] as const).map(([l, v, u]) => (
                <div key={l} className="card-surface p-4"><dt className="text-xs text-muted-foreground">{l}</dt><dd className="mt-1 font-display text-2xl font-semibold">{v} <span className="text-sm font-normal text-muted-foreground">{u}</span></dd></div>
              ))}
            </dl>
            <h3 className="mb-2 mt-6 font-semibold">Recent meals today</h3>
            {meals.data?.length ? <ul className="divide-y border-y">
              {meals.data.slice(0, 5).map((m) => <li key={m.id} className="flex justify-between gap-4 py-3 text-sm">
                <span>{m.food_name} · {m.serving_g} g</span>
                <span className="text-muted-foreground">{new Date(m.eaten_at).toLocaleTimeString(undefined, { timeStyle: "short" })} · {m.nutrition_snapshot.calories_kcal ?? "—"} kcal</span>
              </li>)}
            </ul> : <p className="text-sm text-muted-foreground">No meals logged today yet.</p>}
            <Button asChild variant="link" className="mt-2 px-0"><Link to="/history"><History /> View full history</Link></Button>
          </>}
      </section>
    )}

    <section className="grid gap-3 sm:grid-cols-2">
      <Status ok={catalog.isSuccess} pending={catalog.isLoading} label="Food database" detail={catalog.isSuccess ? `${catalog.data.length} catalog dishes loaded` : catalog.isError ? "Couldn't connect" : "Connecting…"} />
      <Status ok pending={false} label="Recognition model" detail="General vision AI restricted to catalog labels (no custom-trained model deployed)" />
    </section>
  </div>;
}

function Status({ ok, pending, label, detail }: { ok: boolean; pending: boolean; label: string; detail: string }) {
  const Icon = pending ? Loader2 : ok ? CheckCircle2 : XCircle;
  return <div className="flex items-start gap-3 rounded-lg border p-4 text-sm">
    <Icon className={`mt-0.5 size-4 shrink-0 ${ok ? "text-primary" : pending ? "motion-safe:animate-spin" : "text-destructive"}`} aria-hidden />
    <div><p className="font-medium">{label}</p><p className="text-muted-foreground">{detail}</p></div>
  </div>;
}
