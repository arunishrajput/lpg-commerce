"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { addToCartAction } from "@/features/cart/actions/cart";

export function QuickAddButton({ productId, disabled }: { productId: string; disabled?: boolean }) {
  const [pending, startTransition] = useTransition();
  const [added, setAdded] = useState(false);
  const router = useRouter();

  return (
    <button
      type="button"
      disabled={disabled || pending}
      onClick={(e) => {
        e.preventDefault();
        e.stopPropagation();
        startTransition(async () => {
          await addToCartAction(productId, 1);
          setAdded(true);
          router.refresh();
          setTimeout(() => setAdded(false), 1500);
        });
      }}
      className="rounded-full bg-brand px-3 py-1.5 text-xs font-medium text-white transition-colors hover:bg-brand-deep disabled:opacity-50"
    >
      {pending ? "Adding…" : added ? "Added ✓" : "Add to cart"}
    </button>
  );
}
