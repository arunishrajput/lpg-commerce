import { describe, it, expect } from "vitest";
import { computeTotals, findCartIssues, type CartLineItem } from "@/features/cart/lib/totals";

function makeItem(overrides: Partial<CartLineItem> = {}): CartLineItem {
  return {
    id: "item-1",
    productId: "prod-1",
    slug: "product-1",
    name: "Test Product",
    brand: "Brand",
    imageUrl: null,
    unitPrice: 100,
    discountPercent: 0,
    quantity: 1,
    savedForLater: false,
    availableStock: 10,
    eligibility: "STANDARD",
    isActive: true,
    ...overrides,
  };
}

describe("computeTotals", () => {
  it("sums subtotal across quantity", () => {
    const items = [makeItem({ unitPrice: 100, quantity: 2 }), makeItem({ id: "item-2", unitPrice: 50, quantity: 3 })];
    const totals = computeTotals(items);
    expect(totals.subtotal).toBe(2 * 100 + 3 * 50);
  });

  it("applies per-item discount before totaling", () => {
    const items = [makeItem({ unitPrice: 200, discountPercent: 25, quantity: 1 })];
    const totals = computeTotals(items);
    expect(totals.subtotal).toBe(150);
  });

  it("applies coupon discount as a percentage of subtotal", () => {
    const items = [makeItem({ unitPrice: 100, quantity: 1 })];
    const totals = computeTotals(items, 10);
    expect(totals.discount).toBe(10);
    expect(totals.total).toBe(90);
  });

  it("adds the delivery fee passed in, without inventing one", () => {
    const items = [makeItem({ unitPrice: 100, quantity: 1 })];
    const totals = computeTotals(items, 0, 40);
    expect(totals.deliveryFee).toBe(40);
    expect(totals.total).toBe(140);
  });

  it("returns zero totals for an empty cart", () => {
    const totals = computeTotals([]);
    expect(totals).toEqual({ subtotal: 0, discount: 0, deliveryFee: 0, total: 0 });
  });
});

describe("findCartIssues", () => {
  it("flags an inactive product as unavailable", () => {
    const issues = findCartIssues([makeItem({ isActive: false })]);
    expect(issues).toHaveLength(1);
    expect(issues[0].reason).toBe("unavailable");
  });

  it("flags zero stock as out of stock", () => {
    const issues = findCartIssues([makeItem({ availableStock: 0 })]);
    expect(issues[0].reason).toBe("out_of_stock");
  });

  it("flags quantity exceeding available stock", () => {
    const issues = findCartIssues([makeItem({ quantity: 5, availableStock: 2 })]);
    expect(issues[0].reason).toBe("insufficient_stock");
    expect(issues[0].availableStock).toBe(2);
  });

  it("ignores saved-for-later items entirely", () => {
    const issues = findCartIssues([makeItem({ savedForLater: true, availableStock: 0 })]);
    expect(issues).toHaveLength(0);
  });

  it("returns no issues for a healthy cart", () => {
    const issues = findCartIssues([makeItem()]);
    expect(issues).toHaveLength(0);
  });
});
