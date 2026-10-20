import type { Meal } from "./data";

export type DayTotals = { day: string; calories_kcal: number; protein_g: number; carbs_g: number; fat_g: number; meals: number };

function dayKey(d: Date) {
  const p = (n: number) => String(n).padStart(2, "0");
  return `${d.getFullYear()}-${p(d.getMonth() + 1)}-${p(d.getDate())}`;
}

/** Totals per local day for the last `days` days (oldest first). Missing nutrient values are skipped, never invented. */
export function dailyTotals(meals: Pick<Meal, "eaten_at" | "nutrition_snapshot">[], days: number, now = new Date()): DayTotals[] {
  const out = new Map<string, DayTotals>();
  for (let i = days - 1; i >= 0; i--) {
    const d = new Date(now); d.setHours(0, 0, 0, 0); d.setDate(d.getDate() - i);
    const k = dayKey(d);
    out.set(k, { day: k, calories_kcal: 0, protein_g: 0, carbs_g: 0, fat_g: 0, meals: 0 });
  }
  for (const m of meals) {
    const t = out.get(dayKey(new Date(m.eaten_at)));
    if (!t) continue;
    t.meals += 1;
    for (const k of ["calories_kcal", "protein_g", "carbs_g", "fat_g"] as const) t[k] += Number(m.nutrition_snapshot[k] ?? 0);
  }
  return [...out.values()].map((t) => ({ ...t, calories_kcal: Math.round(t.calories_kcal), protein_g: Math.round(t.protein_g * 10) / 10, carbs_g: Math.round(t.carbs_g * 10) / 10, fat_g: Math.round(t.fat_g * 10) / 10 }));
}
