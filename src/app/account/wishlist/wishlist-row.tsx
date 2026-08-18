"use client";

import Image from "next/image";
import Link from "next/link";
import { useTransition } from "react";
import { removeFromWishlistAction } from "@/features/cart/actions/wishlist";
import { QuickAddButton } from "@/features/cart/components/quick-add-button";
import { Button } from "@/components/ui/button";

interface WishlistRowProps {
  productId: string;
  slug: string;
  name: string;
  brand: string | null;
  imageUrl: string | null;
  price: number;
  discountPercent: number;
  availableStock: number;
}

export function WishlistRow(item: WishlistRowProps) {
  const [pending, startTransition] = useTransition();
  const discountedPrice =
    item.discountPercent > 0 ? item.price * (1 - item.discountPercent / 100) : item.price;

  return (
    <div className="flex items-center gap-4 rounded-xl border border-line bg-surface p-4">
      <Link href={`/products/${item.slug}`} className="relative h-16 w-16 shrink-0 overflow-hidden rounded-lg bg-paper">
        {item.imageUrl && (
          <Image src={item.imageUrl} alt={item.name} fill sizes="64px" className="object-cover" />
        )}
      </Link>

      <div className="flex-1">
        <Link href={`/products/${item.slug}`} className="text-sm font-medium text-ink hover:underline">
          {item.name}
        </Link>
        {item.brand && <p className="text-xs text-ink-soft">{item.brand}</p>}
        <p className="mt-1 font-mono text-sm text-ink">₹{discountedPrice.toFixed(0)}</p>
      </div>

      <div className="flex items-center gap-2">
        <QuickAddButton productId={item.productId} disabled={item.availableStock <= 0} />
        <Button
          variant="ghost"
          disabled={pending}
          onClick={() => startTransition(() => removeFromWishlistAction(item.productId))}
        >
          Remove
        </Button>
      </div>
    </div>
  );
}
