import { describe, it, expect } from "vitest";
import { scoreFromSignals, type RiskSignals } from "@/features/admin/lib/risk-scoring";

function signals(overrides: Partial<RiskSignals> = {}): RiskSignals {
  return {
    failedPayments: 0,
    recentOrders: 0,
    cancelledOrders: 0,
    refunds: 0,
    ordersLast24h: 0,
    ...overrides,
  };
}

describe("scoreFromSignals", () => {
  it("scores a clean account as low risk", () => {
    expect(scoreFromSignals(signals())).toBe("low");
  });

  it("does not let a single signal alone reach high risk", () => {
    // By design, heavy failed payments alone land at "medium" — reaching
    // "high" requires corroborating signals, not one extreme number, so a
    // single noisy metric can't flip an account straight to the top tier.
    expect(scoreFromSignals(signals({ failedPayments: 6 }))).toBe("medium");
  });

  it("reaches high risk when multiple signals corroborate", () => {
    expect(scoreFromSignals(signals({ failedPayments: 6, refunds: 3 }))).toBe("high");
  });

  it("scores a high cancellation rate over enough orders as elevated risk", () => {
    const result = scoreFromSignals(signals({ recentOrders: 5, cancelledOrders: 4 }));
    expect(["medium", "high"]).toContain(result);
  });

  it("does not flag a single cancellation out of many orders", () => {
    expect(scoreFromSignals(signals({ recentOrders: 10, cancelledOrders: 1 }))).toBe("low");
  });

  it("scores an order-frequency burst as elevated risk", () => {
    const result = scoreFromSignals(signals({ ordersLast24h: 6 }));
    expect(["medium", "high"]).toContain(result);
  });

  it("combines multiple moderate signals into a higher score than any alone", () => {
    const oneSignal = scoreFromSignals(signals({ failedPayments: 2 }));
    const combined = scoreFromSignals(signals({ failedPayments: 2, refunds: 2, ordersLast24h: 3 }));
    const rank = { low: 0, medium: 1, high: 2 };
    expect(rank[combined]).toBeGreaterThan(rank[oneSignal]);
  });
});
