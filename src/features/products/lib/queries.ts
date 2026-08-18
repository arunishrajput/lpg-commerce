import "server-only";
import { unstable_cache } from "next/cache";
import { db } from "@/lib/db";
import type { ProductSearchParams } from "./schemas";
import { PAGE_SIZE } from "./schemas";

export interface ProductCardData {
  id: string;
  slug: string;
  name: string;
  brand: string | null;
  price: number;
  discountPercent: number;
  eligibility: "STANDARD" | "REGULATED";
  imageUrl: string | null;
  avgRating: number;
  reviewCount: number;
  availableStock: number;
  categoryName: string;
}

type ProductWithCardRelations = {
  id: string;
  slug: string;
  name: string;
  brand: string | null;
  price: unknown;
  discountPercent: number;
  eligibility: "STANDARD" | "REGULATED";
  category: { name: string };
  images: { url: string }[];
  reviews: { rating: number }[];
  inventory: { stockOnHand: number; stockReserved: number }[];
};

/** Shared row -> card mapper, reused by search listing and recommendations
 * so "available stock" and "average rating" are computed one way. */
export function mapProductToCard(p: ProductWithCardRelations): ProductCardData {
  const reviewCount = p.reviews.length;
  const avgRating =
    reviewCount > 0 ? p.reviews.reduce((sum, r) => sum + r.rating, 0) / reviewCount : 0;
  const availableStock = p.inventory.reduce(
    (sum, inv) => sum + Math.max(0, inv.stockOnHand - inv.stockReserved),
    0
  );

  return {
    id: p.id,
    slug: p.slug,
    name: p.name,
    brand: p.brand,
    price: Number(p.price),
    discountPercent: p.discountPercent,
    eligibility: p.eligibility,
    imageUrl: p.images[0]?.url ?? null,
    avgRating,
    reviewCount,
    availableStock,
    categoryName: p.category.name,
  };
}

export const PRODUCT_CARD_INCLUDE = {
  category: true,
  images: { orderBy: { sortOrder: "asc" as const }, take: 1 },
  reviews: { select: { rating: true } },
  inventory: { select: { stockOnHand: true, stockReserved: true } },
};

/**
 * Product listing with search/filter/sort.
 *
 * Price, category, brand, and text search run as DB predicates. Average
 * rating and available stock aren't denormalized onto Product yet, so
 * rating-based filtering/sorting and in-stock filtering happen in-process
 * after a capped fetch. Fine at this catalog size; if the catalog grows
 * significantly, denormalize avgRating/availableStock onto Product
 * (updated on review/inventory writes) so every filter can run in SQL.
 */
export async function listProducts(params: ProductSearchParams): Promise<{
  products: ProductCardData[];
  total: number;
  page: number;
  pageSize: number;
}> {
  const where = {
    isActive: true,
    ...(params.category ? { category: { slug: params.category } } : {}),
    ...(params.brand ? { brand: { equals: params.brand, mode: "insensitive" as const } } : {}),
    ...(params.q
      ? {
          OR: [
            { name: { contains: params.q, mode: "insensitive" as const } },
            { brand: { contains: params.q, mode: "insensitive" as const } },
            { sku: { contains: params.q, mode: "insensitive" as const } },
            { description: { contains: params.q, mode: "insensitive" as const } },
          ],
        }
      : {}),
    ...(params.minPrice !== undefined || params.maxPrice !== undefined
      ? {
          price: {
            ...(params.minPrice !== undefined ? { gte: params.minPrice } : {}),
            ...(params.maxPrice !== undefined ? { lte: params.maxPrice } : {}),
          },
        }
      : {}),
  };

  const dbOrderBy =
    params.sort === "price_asc"
      ? [{ price: "asc" as const }]
      : params.sort === "price_desc"
        ? [{ price: "desc" as const }]
        : params.sort === "newest"
          ? [{ createdAt: "desc" as const }]
          : [{ createdAt: "desc" as const }]; // "popular" / "rating" resolved in-process below

  const rows = await db.product.findMany({
    where,
    orderBy: dbOrderBy,
    take: 200,
    include: PRODUCT_CARD_INCLUDE,
  });

  let mapped: ProductCardData[] = rows.map(mapProductToCard);

  if (params.minRating !== undefined) {
    mapped = mapped.filter((p) => p.avgRating >= params.minRating!);
  }
  if (params.inStockOnly) {
    mapped = mapped.filter((p) => p.availableStock > 0);
  }

  if (params.sort === "rating") {
    mapped.sort((a, b) => b.avgRating - a.avgRating);
  } else if (params.sort === "popular") {
    mapped.sort((a, b) => b.reviewCount - a.reviewCount);
  }

  const total = mapped.length;
  const start = (params.page - 1) * PAGE_SIZE;
  const page = mapped.slice(start, start + PAGE_SIZE);

  return { products: page, total, page: params.page, pageSize: PAGE_SIZE };
}

// Categories and the active brand list change rarely (only on admin
// product/category edits) but are read on nearly every page — cache them
// instead of re-querying per request. Invalidated by tag whenever an admin
// action could have changed the underlying set (see
// features/admin/actions/products.ts).
const getCachedCategories = unstable_cache(
  () => db.category.findMany({ orderBy: { name: "asc" } }),
  ["categories"],
  { tags: ["categories"], revalidate: 300 }
);

const getCachedBrands = unstable_cache(
  async () => {
    const rows = await db.product.findMany({
      where: { isActive: true, brand: { not: null } },
      select: { brand: true },
      distinct: ["brand"],
    });
    return rows.map((r) => r.brand!).sort();
  },
  ["brands"],
  { tags: ["brands"], revalidate: 300 }
);

export async function listCategories() {
  return getCachedCategories();
}

export async function listBrands(): Promise<string[]> {
  return getCachedBrands();
}

export async function getProductBySlug(slug: string) {
  const product = await db.product.findUnique({
    where: { slug },
    include: {
      category: true,
      images: { orderBy: { sortOrder: "asc" } },
      specifications: true,
      documents: true,
      reviews: {
        include: { user: { select: { fullName: true } } },
        orderBy: { createdAt: "desc" },
        take: 20,
      },
      inventory: { select: { stockOnHand: true, stockReserved: true } },
      compatibleWith: {
        include: {
          compatible: {
            select: { id: true, slug: true, name: true, brand: true },
          },
        },
      },
    },
  });

  if (!product) return null;

  const reviewCount = product.reviews.length;
  const avgRating =
    reviewCount > 0
      ? product.reviews.reduce((sum, r) => sum + r.rating, 0) / reviewCount
      : 0;
  const availableStock = product.inventory.reduce(
    (sum, inv) => sum + Math.max(0, inv.stockOnHand - inv.stockReserved),
    0
  );

  return { product, avgRating, reviewCount, availableStock };
}

/**
 * Structured, admin-maintained compatibility only — this never falls back
 * to an AI guess. If a pairing isn't in ProductCompatibility, the answer is
 * "not documented," not an inferred yes/no.
 */
export async function checkCompatibility(productId: string, otherProductId: string) {
  if (productId === otherProductId) {
    return { status: "same_product" as const };
  }

  const record = await db.productCompatibility.findFirst({
    where: {
      OR: [
        { productId, compatibleId: otherProductId },
        { productId: otherProductId, compatibleId: productId },
      ],
    },
  });

  if (!record) {
    return { status: "undocumented" as const };
  }

  return {
    status: record.isCompatible ? ("compatible" as const) : ("incompatible" as const),
    note: record.note,
  };
}

export async function searchProductsForCompatibilityPicker(query: string, excludeId: string) {
  return db.product.findMany({
    where: {
      isActive: true,
      id: { not: excludeId },
      name: { contains: query, mode: "insensitive" },
    },
    select: { id: true, name: true, brand: true, slug: true },
    take: 8,
  });
}
