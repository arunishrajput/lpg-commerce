import type { ProductCardData } from "@/features/products/lib/queries";
import { ProductCard } from "./product-card";

export function ProductGrid({
  products,
  showAddToCart = false,
}: {
  products: ProductCardData[];
  showAddToCart?: boolean;
}) {
  if (products.length === 0) {
    return (
      <div className="rounded-xl border border-dashed border-line p-12 text-center">
        <p className="text-sm font-medium text-ink">No products match those filters</p>
        <p className="mt-1 text-sm text-ink-soft">Try widening your search or clearing a filter.</p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
      {products.map((product) => (
        <ProductCard key={product.id} product={product} showAddToCart={showAddToCart} />
      ))}
    </div>
  );
}
