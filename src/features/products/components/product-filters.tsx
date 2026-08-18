import type { Category } from "@prisma/client";
import type { ProductSearchParams, SortOption } from "@/features/products/lib/schemas";
import { Button } from "@/components/ui/button";

const SORT_LABELS: Record<SortOption, string> = {
  popular: "Most reviewed",
  newest: "Newest",
  price_asc: "Price: low to high",
  price_desc: "Price: high to low",
  rating: "Highest rated",
};

export function ProductFilters({
  categories,
  brands,
  params,
}: {
  categories: Category[];
  brands: string[];
  params: ProductSearchParams;
}) {
  return (
    <form action="/products" method="get" className="space-y-6">
      {params.q && <input type="hidden" name="q" value={params.q} />}

      <div>
        <p className="text-sm font-medium text-ink">Category</p>
        <div className="mt-2 space-y-1.5">
          <label className="flex items-center gap-2 text-sm text-ink-soft">
            <input
              type="radio"
              name="category"
              value=""
              defaultChecked={!params.category}
              className="border-line"
            />
            All categories
          </label>
          {categories.map((c) => (
            <label key={c.id} className="flex items-center gap-2 text-sm text-ink-soft">
              <input
                type="radio"
                name="category"
                value={c.slug}
                defaultChecked={params.category === c.slug}
                className="border-line"
              />
              {c.name}
            </label>
          ))}
        </div>
      </div>

      {brands.length > 0 && (
        <div>
          <label htmlFor="brand" className="text-sm font-medium text-ink">
            Brand
          </label>
          <select
            id="brand"
            name="brand"
            defaultValue={params.brand ?? ""}
            className="mt-2 w-full rounded-lg border border-line bg-surface px-3 py-2 text-sm text-ink"
          >
            <option value="">All brands</option>
            {brands.map((b) => (
              <option key={b} value={b}>
                {b}
              </option>
            ))}
          </select>
        </div>
      )}

      <div>
        <p className="text-sm font-medium text-ink">Price range (₹)</p>
        <div className="mt-2 flex items-center gap-2">
          <input
            type="number"
            name="minPrice"
            placeholder="Min"
            min={0}
            defaultValue={params.minPrice ?? ""}
            className="w-full rounded-lg border border-line bg-surface px-3 py-2 text-sm text-ink"
          />
          <span className="text-ink-soft">–</span>
          <input
            type="number"
            name="maxPrice"
            placeholder="Max"
            min={0}
            defaultValue={params.maxPrice ?? ""}
            className="w-full rounded-lg border border-line bg-surface px-3 py-2 text-sm text-ink"
          />
        </div>
      </div>

      <div>
        <label htmlFor="minRating" className="text-sm font-medium text-ink">
          Minimum rating
        </label>
        <select
          id="minRating"
          name="minRating"
          defaultValue={params.minRating ?? ""}
          className="mt-2 w-full rounded-lg border border-line bg-surface px-3 py-2 text-sm text-ink"
        >
          <option value="">Any rating</option>
          <option value="4">4★ & up</option>
          <option value="3">3★ & up</option>
          <option value="2">2★ & up</option>
        </select>
      </div>

      <label className="flex items-center gap-2 text-sm text-ink-soft">
        <input
          type="checkbox"
          name="inStockOnly"
          value="1"
          defaultChecked={params.inStockOnly}
          className="rounded border-line"
        />
        In stock only
      </label>

      <div>
        <label htmlFor="sort" className="text-sm font-medium text-ink">
          Sort by
        </label>
        <select
          id="sort"
          name="sort"
          defaultValue={params.sort}
          className="mt-2 w-full rounded-lg border border-line bg-surface px-3 py-2 text-sm text-ink"
        >
          {(Object.keys(SORT_LABELS) as SortOption[]).map((key) => (
            <option key={key} value={key}>
              {SORT_LABELS[key]}
            </option>
          ))}
        </select>
      </div>

      <div className="flex gap-2">
        <Button type="submit" className="flex-1">
          Apply filters
        </Button>
        <a href="/products" className="shrink-0">
          <Button type="button" variant="secondary">
            Clear
          </Button>
        </a>
      </div>
    </form>
  );
}
