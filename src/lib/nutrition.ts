export const NUTRIENTS = [
  { key: "calories_kcal", label: "Calories", unit: "kcal" },
  { key: "protein_g", label: "Protein", unit: "g" },
  { key: "carbs_g", label: "Carbohydrates", unit: "g" },
  { key: "fat_g", label: "Total fat", unit: "g" },
  { key: "fiber_g", label: "Fiber", unit: "g" },
  { key: "sugar_g", label: "Sugar", unit: "g" },
  { key: "saturated_fat_g", label: "Saturated fat", unit: "g" },
  { key: "sodium_mg", label: "Sodium", unit: "mg" },
  { key: "potassium_mg", label: "Potassium", unit: "mg" },
  { key: "calcium_mg", label: "Calcium", unit: "mg" },
  { key: "iron_mg", label: "Iron", unit: "mg" },
  { key: "magnesium_mg", label: "Magnesium", unit: "mg" },
  { key: "zinc_mg", label: "Zinc", unit: "mg" },
  { key: "vitamin_c_mg", label: "Vitamin C", unit: "mg" },
] as const;

export type NutrientKey = (typeof NUTRIENTS)[number]["key"];
export type NutritionPer100 = Partial<Record<NutrientKey, number | null>>;
export type NutritionSnapshot = Record<NutrientKey, number | null>;

export const DEFAULT_MAX_SERVING_G = 1500;

/** estimated = per_100g × serving_g / 100. Missing values stay null (unavailable), never 0. */
export function calculateNutrition(per100: NutritionPer100, servingG: number): NutritionSnapshot {
  if (!Number.isFinite(servingG) || servingG <= 0) throw new Error("Serving weight must be positive");
  const out = {} as NutritionSnapshot;
  for (const n of NUTRIENTS) {
    const v = per100[n.key];
    out[n.key] = v == null ? null : Math.round(((Number(v) * servingG) / 100) * 10) / 10;
  }
  return out;
}

export function validateServing(value: number, max = DEFAULT_MAX_SERVING_G): string | null {
  if (!Number.isFinite(value)) return "Enter a serving weight in grams.";
  if (value <= 0) return "Serving weight must be greater than 0 g.";
  if (value > max) return `Serving weight must be ${max} g or less.`;
  return null;
}

export function sumSnapshots(snaps: Partial<NutritionSnapshot>[]) {
  const keys = ["calories_kcal", "protein_g", "carbs_g", "fat_g", "fiber_g"] as const;
  const t = { calories_kcal: 0, protein_g: 0, carbs_g: 0, fat_g: 0, fiber_g: 0 };
  for (const s of snaps) for (const k of keys) t[k] += Number(s?.[k] ?? 0);
  for (const k of keys) t[k] = Math.round(t[k] * 10) / 10;
  return t;
}

export const ACCEPTED_IMAGE_TYPES = ["image/jpeg", "image/png"] as const;
export const MAX_IMAGE_BYTES = 5 * 1024 * 1024;

export function validateImageFile(f: { type: string; size: number }): string | null {
  if (!ACCEPTED_IMAGE_TYPES.includes(f.type as never)) return "Only JPG, JPEG or PNG images are supported.";
  if (f.size === 0) return "This file is empty.";
  if (f.size > MAX_IMAGE_BYTES) return "Image is larger than 5 MB. Please choose a smaller photo.";
  return null;
}
