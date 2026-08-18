"use server";

import {
  checkCompatibility,
  searchProductsForCompatibilityPicker,
} from "@/features/products/lib/queries";

export async function searchCompatibilityCandidates(query: string, excludeId: string) {
  if (query.trim().length < 2) return [];
  return searchProductsForCompatibilityPicker(query.trim(), excludeId);
}

export async function checkProductCompatibility(productId: string, otherProductId: string) {
  return checkCompatibility(productId, otherProductId);
}
