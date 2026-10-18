import { describe, expect, it } from "vitest";
import { calculateNutrition, validateServing, validateImageFile } from "./nutrition";

describe("nutrition engine", () => {
  it("scales per-100g values by serving weight", () => {
    const r = calculateNutrition({ calories_kcal: 132, protein_g: 3.9 }, 250);
    expect(r.calories_kcal).toBe(330);
    expect(r.protein_g).toBe(9.8);
  });
  it("keeps missing nutrients unavailable instead of zero", () => {
    expect(calculateNutrition({ calories_kcal: 100 }, 100).iron_mg).toBeNull();
  });
  it("rejects non-positive and oversized servings", () => {
    expect(validateServing(0)).not.toBeNull();
    expect(validateServing(1501)).not.toBeNull();
    expect(validateServing(150)).toBeNull();
  });
  it("rejects images over 5 MB and non JPG/PNG types", () => {
    expect(validateImageFile({ type: "image/png", size: 6 * 1024 * 1024 })).not.toBeNull();
    expect(validateImageFile({ type: "image/gif", size: 1000 })).not.toBeNull();
    expect(validateImageFile({ type: "image/jpeg", size: 1000 })).toBeNull();
  });
});
