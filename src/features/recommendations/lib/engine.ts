import "server-only";
import { db } from "@/lib/db";
import { mapProductToCard, PRODUCT_CARD_INCLUDE, type ProductCardData } from "@/features/products/lib/queries";

/**
 * Builds recommendations from whichever signals the user actually has —
 * purchase history and wishlist/cart weigh more than a passing view.
 * Ranking: products documented as compatible with something the user
 * already has, then other active products in the same categories, then a
 * popularity fallback so a new account with no signal still sees something
 * reasonable rather than an empty section.
 */
export async function getRecommendationsForUser(
  userId: string,
  limit = 8
): Promise<ProductCardData[]> {
  const [orderItems, wishlistItems, cartItems, recentViews] = await Promise.all([
    db.orderItem.findMany({
      where: { order: { userId } },
      select: { productId: true },
      distinct: ["productId"],
    }),
    db.wishlistItem.findMany({ where: { userId }, select: { productId: true } }),
    db.cartItem.findMany({ where: { cart: { userId } }, select: { productId: true } }),
    db.productView.findMany({
      where: { userId },
      orderBy: { viewedAt: "desc" },
      take: 15,
      select: { productId: true },
      distinct: ["productId"],
    }),
  ]);

  // Purchases and wishlist are the strongest signal of intent; cart next;
  // recently viewed last.
  const signalProductIds = Array.from(
    new Set([
      ...orderItems.map((i) => i.productId),
      ...wishlistItems.map((i) => i.productId),
      ...cartItems.map((i) => i.productId),
      ...recentViews.map((i) => i.productId),
    ])
  );

  const excludeIds = new Set([...wishlistItems.map((i) => i.productId), ...cartItems.map((i) => i.productId)]);

  if (signalProductIds.length === 0) {
    return getPopularProducts(limit, excludeIds);
  }

  const [compatibleLinks, signalProducts] = await Promise.all([
    db.productCompatibility.findMany({
      where: { productId: { in: signalProductIds }, isCompatible: true },
      select: { compatibleId: true },
    }),
    db.product.findMany({
      where: { id: { in: signalProductIds } },
      select: { categoryId: true },
    }),
  ]);

  const compatibleIds = Array.from(new Set(compatibleLinks.map((c) => c.compatibleId))).filter(
    (id) => !signalProductIds.includes(id) && !excludeIds.has(id)
  );
  const categoryIds = Array.from(new Set(signalProducts.map((p) => p.categoryId)));

  const recommended: ProductCardData[] = [];
  const seen = new Set(signalProductIds);

  if (compatibleIds.length > 0) {
    const rows = await db.product.findMany({
      where: { id: { in: compatibleIds }, isActive: true },
      include: PRODUCT_CARD_INCLUDE,
      take: limit,
    });
    for (const row of rows) {
      recommended.push(mapProductToCard(row));
      seen.add(row.id);
    }
  }

  if (recommended.length < limit && categoryIds.length > 0) {
    const rows = await db.product.findMany({
      where: {
        categoryId: { in: categoryIds },
        isActive: true,
        id: { notIn: Array.from(seen).concat(Array.from(excludeIds)) },
      },
      include: PRODUCT_CARD_INCLUDE,
      orderBy: { createdAt: "desc" },
      take: limit - recommended.length,
    });
    for (const row of rows) {
      recommended.push(mapProductToCard(row));
      seen.add(row.id);
    }
  }

  if (recommended.length < limit) {
    const fallback = await getPopularProducts(limit - recommended.length, new Set([...seen, ...excludeIds]));
    recommended.push(...fallback);
  }

  return recommended.slice(0, limit);
}

async function getPopularProducts(limit: number, excludeIds: Set<string>): Promise<ProductCardData[]> {
  const rows = await db.product.findMany({
    where: { isActive: true, id: { notIn: Array.from(excludeIds) } },
    include: PRODUCT_CARD_INCLUDE,
    orderBy: { reviews: { _count: "desc" } },
    take: limit,
  });
  return rows.map(mapProductToCard);
}

/**
 * Product-specific "you might also like" — documented compatibility for
 * this exact product first, then same-category, excluding the product
 * itself. Distinct from the personalized engine above; this one has
 * nothing to do with who's looking at the page.
 */
export async function getRelatedProducts(productId: string, limit = 4): Promise<ProductCardData[]> {
  const product = await db.product.findUnique({
    where: { id: productId },
    select: {
      categoryId: true,
      compatibleWith: { where: { isCompatible: true }, select: { compatibleId: true } },
    },
  });
  if (!product) return [];

  const compatibleIds = product.compatibleWith.map((c) => c.compatibleId);
  const related: ProductCardData[] = [];
  const seen = new Set([productId]);

  if (compatibleIds.length > 0) {
    const rows = await db.product.findMany({
      where: { id: { in: compatibleIds }, isActive: true },
      include: PRODUCT_CARD_INCLUDE,
      take: limit,
    });
    for (const row of rows) {
      related.push(mapProductToCard(row));
      seen.add(row.id);
    }
  }

  if (related.length < limit) {
    const rows = await db.product.findMany({
      where: { categoryId: product.categoryId, isActive: true, id: { notIn: Array.from(seen) } },
      include: PRODUCT_CARD_INCLUDE,
      take: limit - related.length,
    });
    for (const row of rows) related.push(mapProductToCard(row));
  }

  return related.slice(0, limit);
}
