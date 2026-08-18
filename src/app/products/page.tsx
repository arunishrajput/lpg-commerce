import { productSearchSchema } from "@/features/products/lib/schemas";
import { listProducts, listCategories, listBrands } from "@/features/products/lib/queries";
import { ProductGrid } from "@/features/products/components/product-grid";
import { ProductFilters } from "@/features/products/components/product-filters";
import { Pagination } from "@/components/ui/pagination";
import { getCurrentUser } from "@/features/auth/lib/session";

type RawSearchParams = Record<string, string | string[] | undefined>;

function firstValue(value: string | string[] | undefined): string | undefined {
  return Array.isArray(value) ? value[0] : value;
}

export default async function ProductsPage({
  searchParams,
}: {
  searchParams: Promise<RawSearchParams>;
}) {
  const rawParams = await searchParams;

  const parsed = productSearchSchema.safeParse({
    q: firstValue(rawParams.q),
    category: firstValue(rawParams.category) || undefined,
    brand: firstValue(rawParams.brand) || undefined,
    minPrice: firstValue(rawParams.minPrice) || undefined,
    maxPrice: firstValue(rawParams.maxPrice) || undefined,
    minRating: firstValue(rawParams.minRating) || undefined,
    inStockOnly: firstValue(rawParams.inStockOnly),
    sort: firstValue(rawParams.sort) || undefined,
    page: firstValue(rawParams.page) || undefined,
  });

  const params = parsed.success ? parsed.data : productSearchSchema.parse({});

  const [{ products, total, page, pageSize }, categories, brands, user] = await Promise.all([
    listProducts(params),
    listCategories(),
    listBrands(),
    getCurrentUser(),
  ]);

  function buildHref(targetPage: number) {
    const usp = new URLSearchParams();
    if (params.q) usp.set("q", params.q);
    if (params.category) usp.set("category", params.category);
    if (params.brand) usp.set("brand", params.brand);
    if (params.minPrice !== undefined) usp.set("minPrice", String(params.minPrice));
    if (params.maxPrice !== undefined) usp.set("maxPrice", String(params.maxPrice));
    if (params.minRating !== undefined) usp.set("minRating", String(params.minRating));
    if (params.inStockOnly) usp.set("inStockOnly", "1");
    usp.set("sort", params.sort);
    usp.set("page", String(targetPage));
    return `/products?${usp.toString()}`;
  }

  return (
    <div className="mx-auto max-w-6xl px-4 py-10 sm:px-6">
      <div className="flex flex-wrap items-baseline justify-between gap-2">
        <h1 className="font-display text-2xl font-semibold text-ink">
          {params.category
            ? categories.find((c) => c.slug === params.category)?.name ?? "Products"
            : "All products"}
        </h1>
        <p className="text-sm text-ink-soft">
          {total} {total === 1 ? "product" : "products"}
          {params.q ? ` for “${params.q}”` : ""}
        </p>
      </div>

      <div className="mt-6 grid gap-8 lg:grid-cols-[240px_1fr]">
        <aside className="lg:sticky lg:top-20 lg:self-start">
          <ProductFilters categories={categories} brands={brands} params={params} />
        </aside>

        <div>
          <ProductGrid products={products} showAddToCart={!!user} />
          <Pagination page={page} pageSize={pageSize} total={total} buildHref={buildHref} />
        </div>
      </div>
    </div>
  );
}
