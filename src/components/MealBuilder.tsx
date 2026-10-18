import { useMemo, useState } from "react";
import { useQueryClient, useSuspenseQuery } from "@tanstack/react-query";
import { AlertTriangle, Check, Search } from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { catalogQuery, type CatalogFood } from "@/lib/data";
import { NUTRIENTS, calculateNutrition, validateServing, DEFAULT_MAX_SERVING_G } from "@/lib/nutrition";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";

export function FoodPicker({ value, onChange }: { value: string | null; onChange: (id: string) => void }) {
  const { data: foods } = useSuspenseQuery(catalogQuery);
  const [q, setQ] = useState("");
  const list = foods.filter((f) => f.name.toLowerCase().includes(q.toLowerCase()) || f.category.toLowerCase().includes(q.toLowerCase()));
  return (
    <div>
      <Label htmlFor="food-search">Food</Label>
      <div className="relative mt-1.5">
        <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" aria-hidden />
        <Input id="food-search" placeholder="Search idli, sambar, rice…" value={q} onChange={(e) => setQ(e.target.value)} className="pl-9" />
      </div>
      <div role="listbox" aria-label="Foods" className="mt-2 grid max-h-64 grid-cols-2 gap-1.5 overflow-auto sm:grid-cols-3">
        {list.length === 0 && <p className="col-span-full py-4 text-sm text-muted-foreground">No catalog food matches "{q}".</p>}
        {list.map((f) => (
          <button key={f.id} type="button" role="option" aria-selected={value === f.id} onClick={() => onChange(f.id)}
            className="rounded-lg border px-3 py-2 text-left text-sm transition-colors hover:bg-accent aria-selected:border-primary aria-selected:bg-accent">
            <span className="font-medium">{f.name}</span>
            <span className="block text-xs text-muted-foreground">{f.category}</span>
          </button>
        ))}
      </div>
    </div>
  );
}

export function NutritionTable({ food, servingG }: { food: CatalogFood; servingG: number }) {
  if (!food.nutrition) {
    return <p className="flex items-center gap-2 rounded-lg bg-muted p-3 text-sm"><AlertTriangle className="size-4 text-warning" /> Nutrition data is not available for {food.name} yet.</p>;
  }
  const valid = validateServing(servingG) === null;
  const est = valid ? calculateNutrition(food.nutrition, servingG) : null;
  const rows = NUTRIENTS.filter((n) => food.nutrition?.[n.key] != null);
  const missing = NUTRIENTS.length - rows.length;
  return (
    <div>
      <table className="w-full text-sm">
        <thead><tr className="border-b text-left text-muted-foreground"><th className="py-2 font-medium">Nutrient</th><th className="py-2 text-right font-medium">Per 100 g</th><th className="py-2 text-right font-medium">Your serving (est.)</th></tr></thead>
        <tbody>
          {rows.map((n) => (
            <tr key={n.key} className="border-b last:border-0">
              <td className="py-2">{n.label}</td>
              <td className="py-2 text-right text-muted-foreground">{food.nutrition![n.key]} {n.unit}</td>
              <td className="py-2 text-right font-semibold">{est ? `${est[n.key]} ${n.unit}` : "—"}</td>
            </tr>
          ))}
        </tbody>
      </table>
      {missing > 0 && <p className="mt-2 text-xs text-muted-foreground">{missing} nutrients (vitamins, minerals, sugar…) are unavailable for this dish and are not counted as zero.</p>}
      <div className="mt-4 rounded-lg bg-muted p-3 text-xs text-muted-foreground">
        <p><strong className="text-foreground">Source:</strong> {food.nutrition.source?.name} — matched as "{food.nutrition.source_food_match}". {food.nutrition.verified ? `Verified ${food.nutrition.last_verified_at}.` : "Approximate recipe estimate, not yet verified."}</p>
        <p className="mt-1">Estimates only. Photos can't reveal exact portion weight, hidden oil or ghee, or recipe variations.</p>
      </div>
    </div>
  );
}

export type ImageMeta = { predicted_class: string | null; confidence: number | null; model_version: string };

export function MealBuilder({ initialFoodId, imageMeta, onSaved }: { initialFoodId?: string | null; imageMeta?: ImageMeta; onSaved?: () => void }) {
  const { data: foods } = useSuspenseQuery(catalogQuery);
  const qc = useQueryClient();
  const [foodId, setFoodId] = useState<string | null>(initialFoodId ?? null);
  const [serving, setServing] = useState("150");
  const [eatenAt, setEatenAt] = useState(() => toLocalInput(new Date()));
  const [confirmed, setConfirmed] = useState(false);
  const [saving, setSaving] = useState(false);
  const food = useMemo(() => foods.find((f) => f.id === foodId) ?? null, [foods, foodId]);
  const servingNum = Number(serving);
  const servingErr = validateServing(servingNum, DEFAULT_MAX_SERVING_G);

  const save = async () => {
    if (!food || servingErr || !food.nutrition || !confirmed) return;
    setSaving(true);
    const { data: u } = await supabase.auth.getUser();
    if (!u.user) { setSaving(false); toast.error("Please sign in to save meals."); return; }
    const predicted = imageMeta?.predicted_class ?? null;
    const { error } = await supabase.from("meal_entries").insert({
      user_id: u.user.id, food_id: food.id, food_name: food.name,
      input_method: imageMeta ? "image_analysis" : "manual",
      predicted_class: predicted,
      corrected_class: imageMeta && predicted !== food.slug ? food.slug : null,
      confidence: imageMeta?.confidence ?? null,
      model_version: imageMeta?.model_version ?? null,
      serving_g: servingNum,
      nutrition_snapshot: calculateNutrition(food.nutrition, servingNum),
      nutrition_source: food.nutrition.source?.name ?? null,
      eaten_at: new Date(eatenAt).toISOString(),
    });
    setSaving(false);
    if (error) { toast.error("Couldn't save the meal. Check your connection and try again."); return; }
    toast.success(`${food.name} saved to your history.`);
    qc.invalidateQueries({ queryKey: ["meals"] });
    setConfirmed(false);
    onSaved?.();
  };

  return (
    <div className="space-y-6">
      <FoodPicker value={foodId} onChange={(id) => { setFoodId(id); setConfirmed(false); }} />
      {food && (
        <>
          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <Label htmlFor="serving">Serving weight (grams)</Label>
              <Input id="serving" type="number" inputMode="decimal" min={1} max={DEFAULT_MAX_SERVING_G} value={serving}
                onChange={(e) => { setServing(e.target.value); setConfirmed(false); }} aria-invalid={!!servingErr} className="mt-1.5" />
              {servingErr ? <p className="mt-1 text-xs text-destructive">{servingErr}</p> : <p className="mt-1 text-xs text-muted-foreground">Tip: 1 idli ≈ 40 g, 1 cup cooked rice ≈ 160 g.</p>}
            </div>
            <div>
              <Label htmlFor="eaten">When did you eat it?</Label>
              <Input id="eaten" type="datetime-local" value={eatenAt} onChange={(e) => setEatenAt(e.target.value)} className="mt-1.5" />
            </div>
          </div>
          <NutritionTable food={food} servingG={servingNum} />
          {food.nutrition && (
            <div className="flex flex-wrap items-center justify-between gap-4 rounded-xl border bg-card p-4">
              <label className="flex items-center gap-3 text-sm">
                <Checkbox checked={confirmed} onCheckedChange={(v) => setConfirmed(v === true)} disabled={!!servingErr} />
                I confirm this is {food.name}, {servingErr ? "…" : `${servingNum} g`}.
              </label>
              <Button onClick={save} disabled={!confirmed || !!servingErr || saving}><Check className="size-4" /> {saving ? "Saving…" : "Save meal"}</Button>
            </div>
          )}
        </>
      )}
    </div>
  );
}

function toLocalInput(d: Date) {
  const p = (n: number) => String(n).padStart(2, "0");
  return `${d.getFullYear()}-${p(d.getMonth() + 1)}-${p(d.getDate())}T${p(d.getHours())}:${p(d.getMinutes())}`;
}
