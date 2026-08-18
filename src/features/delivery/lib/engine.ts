import "server-only";
import { db } from "@/lib/db";
import { geocodePincode, distanceKm } from "@/services/location";

export interface DeliveryQuote {
  available: true;
  storeId: string;
  storeName: string;
  zoneName: string;
  tier: "ZONE_A" | "ZONE_B" | "ZONE_C";
  fee: number;
  etaMinMinutes: number;
  etaMaxMinutes: number;
  distanceKm: number | null;
}

export interface DeliveryUnavailable {
  available: false;
  reason: "no_zone" | "out_of_stock" | "invalid_pincode";
}

const TIER_RANK: Record<string, number> = { ZONE_A: 0, ZONE_B: 1, ZONE_C: 2, UNAVAILABLE: 3 };

/**
 * Resolves delivery for a pincode, optionally checking that a specific set
 * of products is in stock at the chosen store. Zones are matched by the
 * longest matching pincode prefix per store (a "110" zone beats a broader
 * "11" zone for the same store), and the best zone across all active
 * stores wins — cheaper/faster tier first, distance as a tiebreaker.
 */
export async function resolveDelivery(
  pincode: string,
  productIds: string[] = []
): Promise<DeliveryQuote | DeliveryUnavailable> {
  const digits = pincode.replace(/\D/g, "");
  if (digits.length < 4) {
    return { available: false, reason: "invalid_pincode" };
  }

  const stores = await db.store.findMany({
    where: { isActive: true },
    include: { deliveryZones: true },
  });

  const destination = await geocodePincode(digits);

  type Candidate = {
    storeId: string;
    storeName: string;
    zoneName: string;
    tier: "ZONE_A" | "ZONE_B" | "ZONE_C";
    fee: number;
    etaMinMinutes: number;
    etaMaxMinutes: number;
    distanceKm: number | null;
    prefixLength: number;
  };

  let best: Candidate | null = null;

  for (const store of stores) {
    let bestZoneForStore: (typeof store.deliveryZones)[number] | null = null;

    for (const zone of store.deliveryZones) {
      if (!digits.startsWith(zone.pincodePrefix)) continue;
      if (zone.tier === "UNAVAILABLE") continue;
      if (!bestZoneForStore || zone.pincodePrefix.length > bestZoneForStore.pincodePrefix.length) {
        bestZoneForStore = zone;
      }
    }

    if (!bestZoneForStore) continue;

    // Stock check — only matters when the caller is asking on behalf of
    // specific cart/order items.
    if (productIds.length > 0) {
      const inventory = await db.inventory.findMany({
        where: { storeId: store.id, productId: { in: productIds } },
      });
      const stockByProduct = new Map<string, number>(
        inventory.map((i) => [i.productId as string, (i.stockOnHand as number) - (i.stockReserved as number)])
      );
      const allInStock = productIds.every((id) => (stockByProduct.get(id) ?? 0) > 0);
      if (!allInStock) continue;
    }

    const dist = destination
      ? distanceKm(destination, { latitude: store.latitude, longitude: store.longitude })
      : null;

    const candidate: Candidate = {
      storeId: store.id,
      storeName: store.name,
      zoneName: bestZoneForStore.name,
      tier: bestZoneForStore.tier as "ZONE_A" | "ZONE_B" | "ZONE_C",
      fee: Number(bestZoneForStore.baseFee),
      etaMinMinutes: bestZoneForStore.etaMinMinutes,
      etaMaxMinutes: bestZoneForStore.etaMaxMinutes,
      distanceKm: dist,
      prefixLength: bestZoneForStore.pincodePrefix.length,
    };

    if (
      !best ||
      TIER_RANK[candidate.tier] < TIER_RANK[best.tier] ||
      (TIER_RANK[candidate.tier] === TIER_RANK[best.tier] &&
        (candidate.distanceKm ?? Infinity) < (best.distanceKm ?? Infinity))
    ) {
      best = candidate;
    }
  }

  if (!best) {
    return {
      available: false,
      reason: productIds.length > 0 ? "out_of_stock" : "no_zone",
    };
  }

  return {
    available: true,
    storeId: best.storeId,
    storeName: best.storeName,
    zoneName: best.zoneName,
    tier: best.tier,
    fee: best.fee,
    etaMinMinutes: best.etaMinMinutes,
    etaMaxMinutes: best.etaMaxMinutes,
    distanceKm: best.distanceKm,
  };
}
