import { useState } from "react";
import { createFileRoute, Link } from "@tanstack/react-router";
import { useQueryClient, useSuspenseQuery } from "@tanstack/react-query";
import { Camera, History, Pencil, Search, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { PageHeader, EmptyState } from "@/components/AppShell";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import { supabase } from "@/integrations/supabase/client";
import { catalogQuery, mealsQuery, type Meal } from "@/lib/data";
import { calculateNutrition, validateServing } from "@/lib/nutrition";

export const Route = createFileRoute("/_authenticated/history")({
  head: () => ({ meta: [{ title: "Meal history — ThaliSense AI" }, { name: "description", content: "Search, edit and delete your saved meals with estimated nutrition." }, { property: "og:title", content: "Meal history — ThaliSense AI" }, { property: "og:description", content: "Your saved meals with estimated nutrition." }] }),
  loader: ({ context }) => Promise.all([context.queryClient.ensureQueryData(mealsQuery()), context.queryClient.ensureQueryData(catalogQuery)]),
  component: MealHistory,
});

function MealHistory() {
  const { data: meals } = useSuspenseQuery(mealsQuery());
  const [q, setQ] = useState(""); const [from, setFrom] = useState(""); const [to, setTo] = useState("");
  const list = meals.filter((m) => {
    const d = m.eaten_at.slice(0, 10);
    const local = new Date(m.eaten_at); const p = (n: number) => String(n).padStart(2, "0");
    const day = `${local.getFullYear()}-${p(local.getMonth() + 1)}-${p(local.getDate())}` || d;
    return m.food_name.toLowerCase().includes(q.toLowerCase()) && (!from || day >= from) && (!to || day <= to);
  });
  return <div>
    <PageHeader title="Meal history" action={<Button asChild><Link to="/analyze"><Camera /> Add meal</Link></Button>} />
    {meals.length === 0 ? <EmptyState icon={History} title="No meals yet" body="Your saved meals will appear here." /> : <>
      <div className="mb-4 grid gap-3 sm:grid-cols-[1fr_auto_auto]">
        <div className="relative"><Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" aria-hidden /><Input aria-label="Search meals" placeholder="Search dishes…" value={q} onChange={(e) => setQ(e.target.value)} className="pl-9" /></div>
        <Input type="date" aria-label="From date" value={from} onChange={(e) => setFrom(e.target.value)} />
        <Input type="date" aria-label="To date" value={to} onChange={(e) => setTo(e.target.value)} />
      </div>
      {list.length === 0 ? <p className="py-6 text-sm text-muted-foreground">No meals match these filters.</p> : <div className="divide-y border-y">{list.map((m) => <MealRow key={m.id} meal={m} />)}</div>}
    </>}
  </div>;
}

function MealRow({ meal }: { meal: Meal }) {
  const qc = useQueryClient();
  const { data: foods } = useSuspenseQuery(catalogQuery);
  const [editing, setEditing] = useState(false);
  const [g, setG] = useState(String(meal.serving_g));
  const err = validateServing(Number(g));
  const refresh = () => qc.invalidateQueries({ queryKey: ["meals"] });

  const saveEdit = async () => {
    const food = foods.find((f) => f.id === meal.food_id);
    if (err || !food?.nutrition) { toast.error("Nutrition data for this dish isn't available to recalculate."); return; }
    const n = Number(g);
    const { error } = await supabase.from("meal_entries").update({ serving_g: n, nutrition_snapshot: calculateNutrition(food.nutrition, n) }).eq("id", meal.id);
    if (error) { toast.error("Couldn't update the meal."); return; }
    toast.success("Meal updated."); setEditing(false); refresh();
  };
  const remove = async () => {
    const { error } = await supabase.from("meal_entries").delete().eq("id", meal.id);
    if (error) { toast.error("Couldn't delete the meal."); return; }
    toast.success("Meal deleted."); refresh();
  };

  return <article className="flex flex-wrap items-center justify-between gap-4 py-5">
    <div className="min-w-0">
      <h2 className="break-words text-xl font-semibold">{meal.food_name}</h2>
      <p className="mt-1 text-sm text-muted-foreground">{new Date(meal.eaten_at).toLocaleString(undefined, { dateStyle: "medium", timeStyle: "short" })} · {meal.serving_g} g</p>
      <p className="mt-1 text-xs text-muted-foreground">{meal.input_method === "image_analysis" ? "Photo analysis" : "Manual entry"}{meal.corrected_class ? " · Dish corrected" : ""} · Estimated nutrition</p>
      {editing && <div className="mt-3 flex flex-wrap items-center gap-2">
        <Input type="number" aria-label="Serving grams" value={g} onChange={(e) => setG(e.target.value)} className="w-28" />
        <Button size="sm" onClick={saveEdit} disabled={!!err}>Save</Button>
        <Button size="sm" variant="ghost" onClick={() => { setEditing(false); setG(String(meal.serving_g)); }}>Cancel</Button>
        {err && <span className="text-xs text-destructive">{err}</span>}
      </div>}
    </div>
    <div className="flex items-center gap-5">
      <dl className="grid grid-cols-3 gap-5 text-right text-sm">
        {([["Calories", "calories_kcal", "kcal"], ["Protein", "protein_g", "g"], ["Carbs", "carbs_g", "g"]] as const).map(([label, key, unit]) => <div key={key}>
          <dt className="text-xs text-muted-foreground">{label}</dt><dd className="mt-1 font-semibold">{meal.nutrition_snapshot[key] == null ? "—" : `${meal.nutrition_snapshot[key]} ${unit}`}</dd>
        </div>)}
      </dl>
      <div className="flex">
        <Button variant="ghost" size="icon" aria-label={`Edit ${meal.food_name}`} onClick={() => setEditing(true)}><Pencil /></Button>
        <AlertDialog>
          <AlertDialogTrigger asChild><Button variant="ghost" size="icon" aria-label={`Delete ${meal.food_name}`}><Trash2 /></Button></AlertDialogTrigger>
          <AlertDialogContent>
            <AlertDialogHeader><AlertDialogTitle>Delete this meal?</AlertDialogTitle><AlertDialogDescription>{meal.food_name} ({meal.serving_g} g) will be permanently removed from your history.</AlertDialogDescription></AlertDialogHeader>
            <AlertDialogFooter><AlertDialogCancel>Cancel</AlertDialogCancel><AlertDialogAction onClick={remove}>Delete</AlertDialogAction></AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </div>
    </div>
  </article>;
}
