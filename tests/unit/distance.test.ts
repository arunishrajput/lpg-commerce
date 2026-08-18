import { describe, it, expect } from "vitest";
import { distanceKm } from "@/services/location/geo-math";

describe("distanceKm", () => {
  it("returns 0 for identical points", () => {
    const point = { latitude: 28.6139, longitude: 77.209 };
    expect(distanceKm(point, point)).toBeCloseTo(0, 5);
  });

  it("computes a known approximate distance (Delhi to Mumbai)", () => {
    const delhi = { latitude: 28.6139, longitude: 77.209 };
    const mumbai = { latitude: 19.076, longitude: 72.8777 };
    const km = distanceKm(delhi, mumbai);
    // Real-world great-circle distance is ~1150km — allow a wide tolerance
    // since this only needs to be roughly right for zone tie-breaking.
    expect(km).toBeGreaterThan(1000);
    expect(km).toBeLessThan(1400);
  });

  it("is symmetric", () => {
    const a = { latitude: 28.6139, longitude: 77.209 };
    const b = { latitude: 19.076, longitude: 72.8777 };
    expect(distanceKm(a, b)).toBeCloseTo(distanceKm(b, a), 5);
  });
});
