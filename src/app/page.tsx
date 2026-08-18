import Link from "next/link";
import { Button } from "@/components/ui/button";
import { listProducts, listCategories } from "@/features/products/lib/queries";
import { ProductGrid } from "@/features/products/components/product-grid";
import { productSearchSchema } from "@/features/products/lib/schemas";
import { getCurrentUser } from "@/features/auth/lib/session";
import { getRecommendationsForUser } from "@/features/recommendations/lib/engine";

export default async function HomePage() {
  const [categories, { products: featured }, user] = await Promise.all([
    listCategories(),
    listProducts(productSearchSchema.parse({ sort: "popular" })),
    getCurrentUser(),
  ]);

  const recommendations = user ? await getRecommendationsForUser(user.id) : [];

  return (
    <div>
      {/* Hero */}
      <section className="mx-auto max-w-6xl px-4 py-16 sm:px-6 sm:py-24">
        <div className="max-w-2xl">
          <span className="inline-flex items-center gap-1.5 rounded-full bg-flame-soft px-3 py-1 text-xs font-medium text-flame">
            Checked compatibility, every listing
          </span>
          <h1 className="mt-4 font-display text-4xl font-semibold leading-tight text-ink sm:text-5xl">
            Reliable LPG & kitchen equipment, delivered to your door
          </h1>
          <p className="mt-4 text-ink-soft">
            Burners, regulators, hoses, and kitchen accessories — with
            compatibility you can check before you buy, and delivery you can
            track after.
          </p>
          <div className="mt-8 flex flex-wrap gap-3">
            <Link href="/products">
              <Button>Shop now</Button>
            </Link>
            <Link href="/delivery-check">
              <Button variant="secondary">Check delivery availability</Button>
            </Link>
          </div>
        </div>
      </section>

      <div className="mx-auto max-w-6xl px-4 sm:px-6">
        <div className="supply-line" />
      </div>

      {/* Categories */}
      <section className="mx-auto max-w-6xl px-4 py-14 sm:px-6">
        <h2 className="font-display text-xl font-semibold text-ink">Shop by category</h2>
        <div className="mt-6 grid grid-cols-2 gap-3 sm:grid-cols-4">
          {categories.map((category) => (
            <Link
              key={category.id}
              href={`/products?category=${category.slug}`}
              className="rounded-xl border border-line bg-surface p-5 text-sm font-medium text-ink transition-colors hover:border-brand"
            >
              {category.name}
            </Link>
          ))}
        </div>
      </section>

      <div className="mx-auto max-w-6xl px-4 sm:px-6">
        <div className="supply-line" />
      </div>

      {/* Featured products */}
      <section className="mx-auto max-w-6xl px-4 py-14 sm:px-6">
        <div className="flex items-baseline justify-between">
          <h2 className="font-display text-xl font-semibold text-ink">Featured products</h2>
          <Link href="/products" className="text-sm text-brand hover:underline">
            View all →
          </Link>
        </div>
        <div className="mt-6">
          <ProductGrid products={featured.slice(0, 8)} showAddToCart={!!user} />
        </div>
      </section>

      {recommendations.length > 0 && (
        <>
          <div className="mx-auto max-w-6xl px-4 sm:px-6">
            <div className="supply-line" />
          </div>
          <section className="mx-auto max-w-6xl px-4 py-14 sm:px-6">
            <h2 className="font-display text-xl font-semibold text-ink">Recommended for you</h2>
            <p className="mt-1 text-sm text-ink-soft">
              Based on your orders, wishlist, cart, and recently viewed items.
            </p>
            <div className="mt-6">
              <ProductGrid products={recommendations} showAddToCart={!!user} />
            </div>
          </section>
        </>
      )}

      <div className="mx-auto max-w-6xl px-4 sm:px-6">
        <div className="supply-line" />
      </div>

      {/* Safety section */}
      <section className="mx-auto max-w-6xl px-4 py-14 sm:px-6">
        <div className="rounded-2xl border border-line bg-surface p-6 sm:p-8">
          <h2 className="font-display text-xl font-semibold text-ink">
            Buying gas equipment safely
          </h2>
          <p className="mt-2 max-w-2xl text-sm text-ink-soft">
            Every product page links to its official manual and safety
            documentation. Regulated items are clearly marked, and this demo
            catalog does not represent authorization to sell, transport,
            refill, or deliver actual LPG cylinders.
          </p>
          <Link
            href="/safety"
            className="mt-4 inline-block text-sm font-medium text-brand hover:underline"
          >
            Read our safety information →
          </Link>
        </div>
      </section>
    </div>
  );
}

