"use client";

import { useTransition } from "react";
import Link from "next/link";
import Image from "next/image";
import {
  updateCartItemQuantityAction,
  removeCartItemAction,
  setSavedForLaterAction,
} from "@/features/cart/actions/cart";
import type { CartLineItem } from "@/features/cart/lib/queries";

export function CartItemRow({ item }: { item: CartLineItem }) {
  const [pending, startTransition] = useTransition();
  const unitPrice = item.unitPrice * (1 - item.discountPercent / 100);
  const overStock = item.quantity > item.availableStock;

  return (
    <div className="flex gap-4 rounded-xl border border-line bg-surface p-4">
      <Link href={`/products/${item.slug}`} className="relative h-20 w-20 shrink-0 overflow-hidden rounded-lg bg-paper">
        {item.imageUrl && (
          <Image src={item.imageUrl} alt={item.name} fill sizes="80px" className="object-cover" />
        )}
      </Link>

      <div className="flex flex-1 flex-col">
        <div className="flex items-start justify-between gap-2">
          <div>
            <Link href={`/products/${item.slug}`} className="text-sm font-medium text-ink hover:underline">
              {item.name}
            </Link>
            {item.brand && <p className="text-xs text-ink-soft">{item.brand}</p>}
          </div>
          <p className="font-mono text-sm text-ink">₹{unitPrice.toFixed(0)}</p>
        </div>

        {!item.isActive && (
          <p className="mt-1 text-xs text-danger">No longer available</p>
        )}
        {item.isActive && item.availableStock <= 0 && (
          <p className="mt-1 text-xs text-danger">Out of stock</p>
        )}
        {item.isActive && item.availableStock > 0 && overStock && (
          <p className="mt-1 text-xs text-warn">Only {item.availableStock} left — reduce quantity</p>
        )}

        <div className="mt-auto flex items-center justify-between pt-2">
          {!item.savedForLater ? (
            <div className="flex items-center rounded-full border border-line">
              <button
                type="button"
                disabled={pending}
                aria-label="Decrease quantity"
                onClick={() =>
                  startTransition(() =>
                    updateCartItemQuantityAction(item.id, Math.max(1, item.quantity - 1))
                  )
                }
                className="px-2.5 py-1 text-ink-soft hover:text-ink"
              >
                −
              </button>
              <span className="w-6 text-center text-sm text-ink">{item.quantity}</span>
              <button
                type="button"
                disabled={pending}
                aria-label="Increase quantity"
                onClick={() =>
                  startTransition(() => updateCartItemQuantityAction(item.id, item.quantity + 1))
                }
                className="px-2.5 py-1 text-ink-soft hover:text-ink"
              >
                +
              </button>
            </div>
          ) : (
            <span className="text-xs text-ink-soft">Saved for later</span>
          )}

          <div className="flex gap-3 text-xs">
            <button
              type="button"
              disabled={pending}
              onClick={() =>
                startTransition(() => setSavedForLaterAction(item.id, !item.savedForLater))
              }
              className="text-brand hover:underline"
            >
              {item.savedForLater ? "Move to cart" : "Save for later"}
            </button>
            <button
              type="button"
              disabled={pending}
              onClick={() => startTransition(() => removeCartItemAction(item.id))}
              className="text-danger hover:underline"
            >
              Remove
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
