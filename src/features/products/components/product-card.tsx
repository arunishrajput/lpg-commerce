import Image from "next/image";
import Link from "next/link";
import { RatingStars } from "@/components/ui/rating-stars";
import type { ProductCardData } from "@/features/products/lib/queries";
import { QuickAddButton } from "@/features/cart/components/quick-add-button";

export function ProductCard({
  product,
  showAddToCart = false,
}: {
  product: ProductCardData;
  showAddToCart?: boolean;
}) {
  const discountedPrice =
    product.discountPercent > 0
      ? product.price * (1 - product.discountPercent / 100)
      : product.price;

  return (
    <div className="group flex flex-col overflow-hidden rounded-xl border border-line bg-surface transition-colors hover:border-brand">
      <Link href={`/products/${product.slug}`} className="relative aspect-square w-full bg-paper">
        {product.imageUrl ? (
          <Image
            src={product.imageUrl}
            alt={product.name}
            fill
            sizes="(min-width: 1024px) 25vw, 50vw"
            className="object-cover"
          />
        ) : (
          <div className="flex h-full items-center justify-center text-xs text-ink-soft">
            No image
          </div>
        )}
        {product.eligibility === "REGULATED" && (
          <span className="absolute left-2 top-2 rounded-full bg-flame-soft px-2 py-0.5 text-[11px] font-medium text-flame">
            Regulated
          </span>
        )}
        {product.discountPercent > 0 && (
          <span className="absolute right-2 top-2 rounded-full bg-danger px-2 py-0.5 text-[11px] font-medium text-white">
            −{product.discountPercent}%
          </span>
        )}
      </Link>

      <Link href={`/products/${product.slug}`} className="flex flex-1 flex-col gap-1.5 p-3.5">
        {product.brand && (
          <p className="text-xs uppercase tracking-wide text-ink-soft">{product.brand}</p>
        )}
        <p className="line-clamp-2 text-sm font-medium text-ink">{product.name}</p>
        <RatingStars rating={product.avgRating} count={product.reviewCount} />

        <div className="mt-auto flex items-center justify-between pt-2">
          <div className="flex items-baseline gap-1.5">
            <span className="font-mono text-sm font-medium text-ink">
              ₹{discountedPrice.toFixed(0)}
            </span>
            {product.discountPercent > 0 && (
              <span className="font-mono text-xs text-ink-soft line-through">
                ₹{product.price.toFixed(0)}
              </span>
            )}
          </div>
          <span
            className={`text-xs font-medium ${
              product.availableStock > 0 ? "text-safe" : "text-danger"
            }`}
          >
            {product.availableStock > 0 ? "In stock" : "Out of stock"}
          </span>
        </div>
      </Link>

      {showAddToCart && (
        <div className="border-t border-line p-3">
          <QuickAddButton productId={product.id} disabled={product.availableStock <= 0} />
        </div>
      )}
    </div>
  );
}
