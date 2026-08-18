import "server-only";
import { env } from "@/lib/env";
import { distanceKm, type GeoPoint } from "./geo-math";

export type { GeoPoint };
export { distanceKm };

export interface LocationProvider {
  geocodePincode(pincode: string): Promise<GeoPoint | null>;
}

/**
 * Deterministic mock geocoder — derives a plausible-looking coordinate from
 * the pincode itself so the same pincode always resolves the same way,
 * without calling a real maps API. A real provider (Google Maps, Mapbox,
 * OpenStreetMap/Nominatim) would implement LocationProvider the same way
 * and get selected below via env.MAPS_PROVIDER().
 */
class MockLocationProvider implements LocationProvider {
  async geocodePincode(pincode: string): Promise<GeoPoint | null> {
    const digits = pincode.replace(/\D/g, "");
    if (digits.length < 4) return null;

    // Anchor near New Delhi (where the demo store is seeded) and perturb
    // deterministically by the pincode's digits, so nearby-looking pincodes
    // land at plausible-looking nearby coordinates for demo purposes.
    const seed = Number(digits.slice(0, 6).padEnd(6, "0"));
    const latOffset = ((seed % 1000) / 1000 - 0.5) * 4; // +/- ~2 degrees
    const lngOffset = (((seed >> 3) % 1000) / 1000 - 0.5) * 4;

    return {
      latitude: 28.6139 + latOffset,
      longitude: 77.209 + lngOffset,
    };
  }
}

function getProvider(): LocationProvider {
  const provider = env.MAPS_PROVIDER();
  switch (provider) {
    case "mock":
    default:
      return new MockLocationProvider();
  }
}

export async function geocodePincode(pincode: string): Promise<GeoPoint | null> {
  return getProvider().geocodePincode(pincode);
}
