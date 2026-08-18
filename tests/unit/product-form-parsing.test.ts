import { describe, it, expect } from "vitest";
import {
  parseSpecLines,
  parseDocumentLines,
  parseImageLines,
  slugify,
} from "@/features/admin/lib/product-form-parsing";

describe("parseSpecLines", () => {
  it("parses Label: Value lines", () => {
    const result = parseSpecLines("Burner count: 2\nMaterial: Brass");
    expect(result).toEqual([
      { label: "Burner count", value: "2" },
      { label: "Material", value: "Brass" },
    ]);
  });

  it("keeps colons that appear inside the value", () => {
    const result = parseSpecLines("Ratio: 3:1");
    expect(result).toEqual([{ label: "Ratio", value: "3:1" }]);
  });

  it("skips blank lines and lines missing a value", () => {
    const result = parseSpecLines("Label only\n\nGood: Value");
    expect(result).toEqual([{ label: "Good", value: "Value" }]);
  });
});

describe("parseDocumentLines", () => {
  it("parses Title | URL lines", () => {
    const result = parseDocumentLines("Safety manual | https://example.com/manual.pdf");
    expect(result).toEqual([{ title: "Safety manual", url: "https://example.com/manual.pdf" }]);
  });

  it("skips lines missing a URL", () => {
    const result = parseDocumentLines("No pipe here\nTitle | https://example.com");
    expect(result).toEqual([{ title: "Title", url: "https://example.com" }]);
  });
});

describe("parseImageLines", () => {
  it("splits on newlines and drops blanks", () => {
    expect(parseImageLines("a.jpg\n\nb.jpg\n")).toEqual(["a.jpg", "b.jpg"]);
  });
});

describe("slugify", () => {
  it("lowercases and hyphenates", () => {
    expect(slugify("Twin Burner Gas Stove")).toBe("twin-burner-gas-stove");
  });

  it("strips non-alphanumeric characters", () => {
    expect(slugify("Burner (2-pack)!!")).toBe("burner-2-pack");
  });

  it("trims leading/trailing hyphens", () => {
    expect(slugify("  --Edge Case--  ")).toBe("edge-case");
  });
});
