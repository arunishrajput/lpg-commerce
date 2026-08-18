"use client";

import { useState, useTransition } from "react";
import { toggleWishlistAction } from "@/features/cart/actions/wishlist";

export function WishlistButton({
  productId,
  initialWishlisted,
}: {
  productId: string;
  initialWishlisted: boolean;
}) {
  const [wishlisted, setWishlisted] = useState(initialWishlisted);
  const [pending, startTransition] = useTransition();

  return (
    <button
      type="button"
      aria-label={wishlisted ? "Remove from wishlist" : "Add to wishlist"}
      aria-pressed={wishlisted}
      disabled={pending}
      onClick={() =>
        startTransition(async () => {
          const result = await toggleWishlistAction(productId);
          setWishlisted(result.wishlisted);
        })
      }
      className={`inline-flex h-9 w-9 items-center justify-center rounded-full border transition-colors ${
        wishlisted
          ? "border-flame bg-flame-soft text-flame"
          : "border-line bg-surface text-ink-soft hover:text-ink"
      }`}
    >
      <span aria-hidden>{wishlisted ? "♥" : "♡"}</span>
    </button>
  );
}
