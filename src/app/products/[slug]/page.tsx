import { notFound } from "next/navigation";
import Link from "next/link";
import { getProductBySlug } from "@/features/products/lib/queries";
import { ProductImageGallery } from "@/features/products/components/product-image-gallery";
import { CompatibilityChecker } from "@/features/products/components/compatibility-checker";
import { RatingStars } from "@/components/ui/rating-stars";
import { Button } from "@/components/ui/button";
import { getCurrentUser } from "@/features/auth/lib/session";
import { AddToCartButton } from "@/features/cart/components/add-to-cart-button";
import { BuyNowButton } from "@/features/cart/components/buy-now-button";
import { WishlistButton } from "@/features/cart/components/wishlist-button";
import { isWishlisted } from "@/features/cart/actions/wishlist";
import { ProductDeliveryCheck } from "@/features/delivery/components/product-delivery-check";
import { ViewTracker } from "@/features/recommendations/components/view-tracker";
import { getRelatedProducts } from "@/features/recommendations/lib/engine";
import { ProductGrid } from "@/features/products/components/product-grid";

export default async function ProductDetailPage({
  params,
  searchParams,
}: {
  params: Promise<{ slug: string }>;
  searchParams: Promise<{ pincode?: string }>;
}) {
  const { slug } = await params;
  const { pincode } = await searchParams;
  const data = await getProductBySlug(slug);
  if (!data) notFound();

  const { product, avgRating, reviewCount, availableStock } = data;
  const user = await getCurrentUser();
  const wishlisted = user ? await isWishlisted(user.id, product.id) : false;
  const related = await getRelatedProducts(product.id);
  const discountedPrice =
    product.discountPercent > 0
      ? Number(product.price) * (1 - product.discountPercent / 100)
      : Number(product.price);

  return (
    <div className="mx-auto max-w-6xl px-4 py-10 sm:px-6">
      <ViewTracker productId={product.id} />
      <nav className="text-sm text-ink-soft">
        <Link href="/products" className="hover:text-ink">
          Products
        </Link>{" "}
        /{" "}
        <Link href={`/products?category=${product.category.slug}`} className="hover:text-ink">
          {product.category.name}
        </Link>
      </nav>

      <div className="mt-4 grid gap-10 lg:grid-cols-2">
        <ProductImageGallery images={product.images} productName={product.name} />

        <div>
          {product.brand && (
            <p className="text-sm uppercase tracking-wide text-ink-soft">{product.brand}</p>
          )}
          <h1 className="mt-1 font-display text-2xl font-semibold text-ink">{product.name}</h1>

          <div className="mt-2 flex items-center gap-3">
            <RatingStars rating={avgRating} count={reviewCount} size="md" />
            {product.eligibility === "REGULATED" && (
              <span className="rounded-full bg-flame-soft px-2.5 py-0.5 text-xs font-medium text-flame">
                Regulated product
              </span>
            )}
            {user && <WishlistButton productId={product.id} initialWishlisted={wishlisted} />}
          </div>

          <div className="mt-4 flex items-baseline gap-2">
            <span className="font-mono text-2xl font-semibold text-ink">
              ₹{discountedPrice.toFixed(0)}
            </span>
            {product.discountPercent > 0 && (
              <span className="font-mono text-base text-ink-soft line-through">
                ₹{Number(product.price).toFixed(0)}
              </span>
            )}
          </div>

          <p
            className={`mt-2 text-sm font-medium ${
              availableStock > 0 ? "text-safe" : "text-danger"
            }`}
          >
            {availableStock > 0 ? `In stock (${availableStock} available)` : "Out of stock"}
          </p>

          <p className="mt-4 text-sm leading-relaxed text-ink-soft">{product.description}</p>

          <div className="mt-6 flex gap-3">
            {user ? (
              <>
                <AddToCartButton
                  productId={product.id}
                  disabled={availableStock <= 0}
                  disabledReason={availableStock <= 0 ? "Out of stock" : undefined}
                />
                <BuyNowButton productId={product.id} disabled={availableStock <= 0} />
              </>
            ) : (
              <Link href="/login">
                <Button>Sign in to add to cart</Button>
              </Link>
            )}
          </div>
          {availableStock > 0 && !user && (
            <p className="mt-2 text-xs text-ink-soft">Sign in to add items to your cart.</p>
          )}

          {product.warrantyMonths > 0 && (
            <p className="mt-4 text-sm text-ink-soft">
              <span className="font-medium text-ink">Warranty:</span> {product.warrantyMonths}{" "}
              months
            </p>
          )}

          <div className="mt-4">
            <ProductDeliveryCheck productId={product.id} pincode={pincode} />
          </div>

          {product.documents.length > 0 && (
            <div className="mt-4">
              <p className="text-sm font-medium text-ink">Documentation</p>
              <ul className="mt-1 space-y-1">
                {product.documents.map((doc) => (
                  <li key={doc.id}>
                    <a
                      href={doc.url}
                      className="text-sm text-brand hover:underline"
                      target="_blank"
                      rel="noreferrer"
                    >
                      {doc.title} →
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      </div>

      <div className="mt-12 grid gap-8 lg:grid-cols-2">
        {product.specifications.length > 0 && (
          <div className="rounded-xl border border-line bg-surface p-5">
            <h2 className="font-medium text-ink">Specifications</h2>
            <dl className="mt-3 divide-y divide-line text-sm">
              {product.specifications.map((spec) => (
                <div key={spec.id} className="flex justify-between py-2">
                  <dt className="text-ink-soft">{spec.label}</dt>
                  <dd className="text-ink">{spec.value}</dd>
                </div>
              ))}
            </dl>
          </div>
        )}

        <CompatibilityChecker productId={product.id} />
      </div>

      {(product.compatibleWith.length > 0) && (
        <div className="mt-8">
          <h2 className="font-medium text-ink">Known compatible products</h2>
          <div className="mt-3 flex flex-wrap gap-2">
            {product.compatibleWith
              .filter((c) => c.isCompatible)
              .map((c) => (
                <Link
                  key={c.id}
                  href={`/products/${c.compatible.slug}`}
                  className="rounded-full border border-line bg-surface px-3 py-1.5 text-sm text-ink hover:border-brand"
                >
                  {c.compatible.name}
                </Link>
              ))}
          </div>
        </div>
      )}

      <div className="mt-12">
        <h2 className="font-display text-xl font-semibold text-ink">
          Reviews {reviewCount > 0 ? `(${reviewCount})` : ""}
        </h2>
        {product.reviews.length === 0 ? (
          <p className="mt-2 text-sm text-ink-soft">No reviews yet.</p>
        ) : (
          <div className="mt-4 space-y-4">
            {product.reviews.map((review) => (
              <div key={review.id} className="rounded-xl border border-line bg-surface p-4">
                <div className="flex items-center justify-between">
                  <p className="text-sm font-medium text-ink">{review.user.fullName}</p>
                  <RatingStars rating={review.rating} />
                </div>
                {review.comment && (
                  <p className="mt-2 text-sm text-ink-soft">{review.comment}</p>
                )}
              </div>
            ))}
          </div>
        )}
      </div>

      {related.length > 0 && (
        <div className="mt-12">
          <h2 className="font-display text-xl font-semibold text-ink">You might also like</h2>
          <div className="mt-6">
            <ProductGrid products={related} showAddToCart={!!user} />
          </div>
        </div>
      )}
    </div>
  );
}
