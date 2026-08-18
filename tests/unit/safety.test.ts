import { describe, it, expect } from "vitest";
import { isSafetyCritical } from "@/features/ai/lib/safety";

describe("isSafetyCritical", () => {
  it("flags an explicit gas leak mention", () => {
    expect(isSafetyCritical("I smell gas in my kitchen")).toBe(true);
  });

  it("flags leak/hissing language", () => {
    expect(isSafetyCritical("There's a hissing sound near the regulator")).toBe(true);
  });

  it("flags fire/explosion language", () => {
    expect(isSafetyCritical("The stove caught fire")).toBe(true);
  });

  it("is case-insensitive", () => {
    expect(isSafetyCritical("SMELL GAS near the stove")).toBe(true);
  });

  it("does not flag an ordinary product question", () => {
    expect(isSafetyCritical("What burner should I choose for a small kitchen?")).toBe(false);
  });

  it("does not flag an ordinary order question", () => {
    expect(isSafetyCritical("Where is my order?")).toBe(false);
  });
});
