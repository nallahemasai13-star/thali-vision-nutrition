import { queryOptions } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import type { NutritionPer100 } from "./nutrition";

export type CatalogFood = {
  id: string; slug: string; name: string; category: string; region: string; description: string | null;
  is_prepared_dish: boolean; training_images_available: boolean;
  nutrition: (NutritionPer100 & {
    source_food_match: string; data_type: string; verified: boolean; last_verified_at: string | null;
    source: { name: string; reference: string; url: string | null; notes: string | null } | null;
  }) | null;
  support: { status: string; in_label_set: boolean; evaluated: boolean } | null;
};

export const catalogQuery = queryOptions({
  queryKey: ["catalog"],
  staleTime: 5 * 60_000,
  queryFn: async (): Promise<CatalogFood[]> => {
    const { data, error } = await supabase
      .from("foods")
      .select("*, nutrition_facts(*, nutrition_sources(name,reference,url,notes)), food_model_support(status,in_label_set,evaluated)")
      .order("name");
    if (error) throw error;
    return (data ?? []).map((f) => {
      const nf = Array.isArray(f.nutrition_facts) ? f.nutrition_facts[0] : f.nutrition_facts;
      const sp = f.food_model_support?.[0] ?? null;
      return {
        ...f,
        nutrition: nf ? { ...nf, source: (nf as unknown as { nutrition_sources: unknown }).nutrition_sources ?? null } : null,
        support: sp,
      } as unknown as CatalogFood;
    });
  },
});

export type Meal = {
  id: string; food_id: string; food_name: string; input_method: string; predicted_class: string | null;
  corrected_class: string | null; confidence: number | null; model_version: string | null;
  serving_g: number; nutrition_snapshot: Record<string, number | null>; nutrition_source: string | null;
  eaten_at: string;
};

export const mealsQuery = (fromISO?: string, toISO?: string) =>
  queryOptions({
    queryKey: ["meals", fromISO ?? null, toISO ?? null],
    queryFn: async (): Promise<Meal[]> => {
      let q = supabase.from("meal_entries").select("*").order("eaten_at", { ascending: false }).limit(1000);
      if (fromISO) q = q.gte("eaten_at", fromISO);
      if (toISO) q = q.lt("eaten_at", toISO);
      const { data, error } = await q;
      if (error) throw error;
      return (data ?? []) as unknown as Meal[];
    },
  });

export const profileQuery = (uid: string) =>
  queryOptions({
    queryKey: ["profile", uid],
    queryFn: async () => {
      const { data, error } = await supabase.from("profiles").select("*").eq("id", uid).maybeSingle();
      if (error) throw error;
      return data;
    },
  });

export function startOfDay(d = new Date()) { const x = new Date(d); x.setHours(0, 0, 0, 0); return x; }
export function addDays(d: Date, n: number) { const x = new Date(d); x.setDate(x.getDate() + n); return x; }
