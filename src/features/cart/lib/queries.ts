import "server-only";
import { db } from "@/lib/db";
import {
  computeTotals,
  findCartIssues,
  type CartLineItem,
  type CartTotals,
  type CartIssue,
} from "./totals";

// Re-exported so existing imports from "@/features/cart/lib/queries" keep
// working — the pure logic itself now lives in totals.ts (no db import),
// which is what lets it be unit-tested without a database.
export { computeTotals, findCartIssues };
export type { CartLineItem, CartTotals, CartIssue };

export async function getOrCreateCart(userId: string) {
  let cart = await db.cart.findFirst({ where: { userId } });
  if (!cart) {
    cart = await db.cart.create({ data: { userId } });
  }
  return cart;
}

export async function getCartItems(userId: string): Promise<CartLineItem[]> {
  const cart = await getOrCreateCart(userId);

  const items = await db.cartItem.findMany({
    where: { cartId: cart.id },
    include: {
      product: {
        include: {
          images: { orderBy: { sortOrder: "asc" }, take: 1 },
          inventory: { select: { stockOnHand: true, stockReserved: true } },
        },
      },
    },
    orderBy: { id: "asc" },
  });

  return items.map((item) => ({
    id: item.id,
    productId: item.productId,
    slug: item.product.slug,
    name: item.product.name,
    brand: item.product.brand,
    imageUrl: item.product.images[0]?.url ?? null,
    unitPrice: Number(item.product.price),
    discountPercent: item.product.discountPercent,
    quantity: item.quantity,
    savedForLater: item.savedForLater,
    availableStock: item.product.inventory.reduce(
      (sum, inv) => sum + Math.max(0, inv.stockOnHand - inv.stockReserved),
      0
    ),
    eligibility: item.product.eligibility,
    isActive: item.product.isActive,
  }));
}


export async function previewCoupon(code: string): Promise<
  | { valid: true; discountPercent: number }
  | { valid: false; reason: string }
> {
  if (!code.trim()) return { valid: false, reason: "Enter a coupon code." };

  const coupon = await db.coupon.findUnique({ where: { code: code.trim().toUpperCase() } });
  if (!coupon || !coupon.isActive) {
    return { valid: false, reason: "That coupon code isn't valid." };
  }
  if (coupon.expiresAt && coupon.expiresAt < new Date()) {
    return { valid: false, reason: "That coupon has expired." };
  }

  return { valid: true, discountPercent: coupon.discountPercent };
}
