import { describe, it, expect } from "vitest";
import { orderDisplayId, isOrderCancellable, ORDER_LIFECYCLE } from "@/features/orders/lib/order-display";

describe("orderDisplayId", () => {
  it("uppercases the last 8 characters with a # prefix", () => {
    // "abcd1234" is exactly 8 characters, so the whole thing (uppercased) should appear.
    expect(orderDisplayId("xxxxxxxxxxxxabcd1234")).toBe("#ABCD1234");
  });

  it("is deterministic for the same id", () => {
    const id = "clx1234567890abcdef";
    expect(orderDisplayId(id)).toBe(orderDisplayId(id));
  });

  it("always starts with #", () => {
    expect(orderDisplayId("abc123")).toMatch(/^#/);
  });
});

describe("isOrderCancellable", () => {
  it("allows cancellation before dispatch", () => {
    for (const status of ["PLACED", "PAYMENT_VERIFIED", "CONFIRMED", "PROCESSING"]) {
      expect(isOrderCancellable(status)).toBe(true);
    }
  });

  it("blocks cancellation once packed or later", () => {
    for (const status of ["PACKED", "DISPATCHED", "OUT_FOR_DELIVERY", "DELIVERED", "CANCELLED"]) {
      expect(isOrderCancellable(status)).toBe(false);
    }
  });
});

describe("ORDER_LIFECYCLE", () => {
  it("does not include the terminal CANCELLED state", () => {
    expect(ORDER_LIFECYCLE).not.toContain("CANCELLED");
  });

  it("ends with DELIVERED", () => {
    expect(ORDER_LIFECYCLE[ORDER_LIFECYCLE.length - 1]).toBe("DELIVERED");
  });
});
