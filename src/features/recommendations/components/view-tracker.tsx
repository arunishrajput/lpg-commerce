"use client";

import { useEffect, useRef } from "react";
import { recordProductView } from "@/features/recommendations/actions/record-view";

/** Renders nothing — just records that the signed-in user viewed this product. */
export function ViewTracker({ productId }: { productId: string }) {
  const recorded = useRef(false);

  useEffect(() => {
    if (recorded.current) return;
    recorded.current = true;
    recordProductView(productId).catch(() => {
      // Non-critical — a missed view just means one less recommendation signal.
    });
  }, [productId]);

  return null;
}
