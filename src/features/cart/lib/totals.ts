export interface CartLineItem {
  id: string; // CartItem id
  productId: string;
  slug: string;
  name: string;
  brand: string | null;
  imageUrl: string | null;
  unitPrice: number;
  discountPercent: number;
  quantity: number;
  savedForLater: boolean;
  availableStock: number;
  eligibility: "STANDARD" | "REGULATED";
  isActive: boolean;
}

export interface CartTotals {
  subtotal: number;
  discount: number;
  deliveryFee: number;
  total: number;
}

/**
 * Item-level totals only. The delivery fee is deliberately not computed
 * here — it depends on a destination pincode and comes from the delivery
 * engine (features/delivery/lib/engine.ts), so callers pass it in once
 * they know it (or 0 while a destination hasn't been chosen yet).
 */
export function computeTotals(
  activeItems: CartLineItem[],
  couponDiscountPercent = 0,
  deliveryFee = 0
): CartTotals {
  const subtotal = activeItems.reduce((sum, item) => {
    const unit = item.unitPrice * (1 - item.discountPercent / 100);
    return sum + unit * item.quantity;
  }, 0);

  const discount = subtotal * (couponDiscountPercent / 100);
  const afterDiscount = subtotal - discount;

  return {
    subtotal,
    discount,
    deliveryFee,
    total: afterDiscount + deliveryFee,
  };
}

export interface CartIssue {
  cartItemId: string;
  productName: string;
  reason: "out_of_stock" | "insufficient_stock" | "unavailable";
  availableStock?: number;
}

/**
 * Checks the "before checkout" conditions from the spec: still available,
 * enough quantity, still active. Delivery-eligibility-by-location joins in
 * via the delivery engine separately.
 */
export function findCartIssues(items: CartLineItem[]): CartIssue[] {
  const issues: CartIssue[] = [];
  for (const item of items) {
    if (item.savedForLater) continue;
    if (!item.isActive) {
      issues.push({ cartItemId: item.id, productName: item.name, reason: "unavailable" });
    } else if (item.availableStock <= 0) {
      issues.push({ cartItemId: item.id, productName: item.name, reason: "out_of_stock" });
    } else if (item.quantity > item.availableStock) {
      issues.push({
        cartItemId: item.id,
        productName: item.name,
        reason: "insufficient_stock",
        availableStock: item.availableStock,
      });
    }
  }
  return issues;
}
