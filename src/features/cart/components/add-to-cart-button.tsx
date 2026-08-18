"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { addToCartAction } from "@/features/cart/actions/cart";
import { Button } from "@/components/ui/button";

export function AddToCartButton({
  productId,
  disabled,
  disabledReason,
}: {
  productId: string;
  disabled?: boolean;
  disabledReason?: string;
}) {
  const [quantity, setQuantity] = useState(1);
  const [pending, startTransition] = useTransition();
  const [added, setAdded] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  if (disabled) {
    return (
      <Button disabled title={disabledReason}>
        Add to cart
      </Button>
    );
  }

  function handleAdd() {
    setError(null);
    startTransition(async () => {
      try {
        await addToCartAction(productId, quantity);
        setAdded(true);
        router.refresh();
        setTimeout(() => setAdded(false), 2000);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Couldn't add to cart.");
      }
    });
  }

  return (
    <div className="flex flex-col gap-2">
      <div className="flex items-center gap-3">
        <div className="flex items-center rounded-full border border-line">
          <button
            type="button"
            aria-label="Decrease quantity"
            onClick={() => setQuantity((q) => Math.max(1, q - 1))}
            className="px-3 py-2 text-ink-soft hover:text-ink"
          >
            −
          </button>
          <span className="w-6 text-center text-sm text-ink">{quantity}</span>
          <button
            type="button"
            aria-label="Increase quantity"
            onClick={() => setQuantity((q) => q + 1)}
            className="px-3 py-2 text-ink-soft hover:text-ink"
          >
            +
          </button>
        </div>
        <Button onClick={handleAdd} disabled={pending}>
          {pending ? "Adding…" : added ? "Added ✓" : "Add to cart"}
        </Button>
      </div>
      {error && <p className="text-sm text-danger">{error}</p>}
    </div>
  );
}
