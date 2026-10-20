import { describe, expect, it } from "vitest";
import { dailyTotals } from "./meal-stats";

describe("dailyTotals", () => {
  const now = new Date(2026, 9, 20, 12);
  it("sums only saved meals on each day and keeps empty days at zero meals", () => {
    const meals = [
      { eaten_at: new Date(2026, 9, 20, 8).toISOString(), nutrition_snapshot: { calories_kcal: 200, protein_g: 6 } },
      { eaten_at: new Date(2026, 9, 20, 13).toISOString(), nutrition_snapshot: { calories_kcal: 150, protein_g: null } },
      { eaten_at: new Date(2026, 9, 10, 8).toISOString(), nutrition_snapshot: { calories_kcal: 999 } },
    ];
    const days = dailyTotals(meals, 7, now);
    expect(days).toHaveLength(7);
    expect(days[6]).toMatchObject({ calories_kcal: 350, protein_g: 6, meals: 2 });
    expect(days[0]!.meals).toBe(0);
    expect(days.reduce((s, d) => s + d.calories_kcal, 0)).toBe(350);
  });
});
