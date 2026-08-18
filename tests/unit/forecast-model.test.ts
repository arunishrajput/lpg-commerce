import { describe, it, expect } from "vitest";
import { MovingAverageModel, type SalesPoint } from "@/features/admin/lib/forecast-model";

function daysOf(quantities: number[]): SalesPoint[] {
  return quantities.map((quantity, i) => ({
    date: `2026-01-${String(i + 1).padStart(2, "0")}`,
    quantity,
  }));
}

describe("MovingAverageModel", () => {
  const model = new MovingAverageModel();

  it("returns 0 for no history", () => {
    expect(model.predict([])).toBe(0);
  });

  it("averages a steady 4-week history to the same weekly rate", () => {
    // 7 units/day for 28 days = 49 units/week
    const history = daysOf(new Array(28).fill(7));
    expect(model.predict(history)).toBe(49);
  });

  it("only considers the most recent 28 days", () => {
    const oldNoise = daysOf(new Array(60).fill(100)); // ancient spike, should be ignored
    const recentSteady = daysOf(new Array(28).fill(1));
    const history = [...oldNoise, ...recentSteady];
    expect(model.predict(history)).toBe(7); // 1/day * 7
  });

  it("does not extrapolate wildly from a partial week", () => {
    const history = daysOf([2, 2, 2]); // 3 days, 6 units total
    // The model clamps the divisor to at least 1 "week" for short
    // histories, so a partial week reads as its raw total rather than
    // being scaled up as if it were a full week's rate.
    expect(model.predict(history)).toBe(6);
  });
});
