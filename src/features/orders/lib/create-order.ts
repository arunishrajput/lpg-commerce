import "server-only";
import { db } from "@/lib/db";
import { getCartItems, computeTotals, findCartIssues, previewCoupon } from "@/features/cart/lib/queries";
import { resolveDelivery } from "@/features/delivery/lib/engine";
import { computeRiskScore } from "@/features/admin/lib/risk";

export class OrderCreationError extends Error {}

/**
 * Creates an order from the user's current cart. Every check here runs
 * server-side against the database — cart contents, stock, coupon validity,
 * and delivery eligibility are never taken on the client's word, per
 * "never trust frontend payment status" and the equivalent principle for
 * order totals and fulfillability.
 */
export async function createOrderFromCart(params: {
  userId: string;
  addressId: string;
  couponCode?: string;
}) {
  const { userId, addressId } = params;

  const address = await db.address.findFirst({ where: { id: addressId, userId } });
  if (!address) {
    throw new OrderCreationError("That delivery address wasn't found.");
  }

  const items = await getCartItems(userId);
  const activeItems = items.filter((i) => !i.savedForLater);
  if (activeItems.length === 0) {
    throw new OrderCreationError("Your cart is empty.");
  }

  const issues = findCartIssues(items);
  if (issues.length > 0) {
    throw new OrderCreationError(
      "Some items in your cart changed availability. Please review your cart before ordering."
    );
  }

  let couponDiscountPercent = 0;
  let couponId: string | null = null;
  if (params.couponCode) {
    const result = await previewCoupon(params.couponCode);
    if (result.valid) {
      couponDiscountPercent = result.discountPercent;
      const coupon = await db.coupon.findUnique({ where: { code: params.couponCode.toUpperCase() } });
      couponId = coupon?.id ?? null;
    }
  }

  // Store selection, delivery fee, and ETA all come from the delivery
  // engine — the best store carrying every item that also delivers to this
  // address, chosen by zone tier then distance (see features/delivery).
  const quote = await resolveDelivery(
    address.pincode,
    activeItems.map((i) => i.productId)
  );
  if (!quote.available) {
    throw new OrderCreationError(
      quote.reason === "out_of_stock"
        ? "No store carrying every item in your cart can deliver to this address."
        : "We don't deliver to this address yet."
    );
  }

  const totals = computeTotals(activeItems, couponDiscountPercent, quote.fee);
  const cart = await db.cart.findFirstOrThrow({ where: { userId } });
  const riskScore = await computeRiskScore(userId);

  const order = await db.$transaction(async (tx) => {
    const created = await tx.order.create({
      data: {
        userId,
        storeId: quote.storeId,
        addressId,
        status: "PLACED",
        subtotal: totals.subtotal,
        deliveryFee: totals.deliveryFee,
        discount: totals.discount,
        tax: 0,
        total: totals.total,
        couponId,
        riskScore,
        items: {
          create: activeItems.map((item) => ({
            productId: item.productId,
            quantity: item.quantity,
            unitPrice: item.unitPrice * (1 - item.discountPercent / 100),
          })),
        },
        payment: {
          create: {
            method: "MOCK",
            status: "PENDING",
            amount: totals.total,
          },
        },
        delivery: {
          create: {
            status: "PENDING",
            distanceKm: quote.distanceKm,
            feeCharged: quote.fee,
            etaMinutes: quote.etaMaxMinutes,
          },
        },
      },
    });

    // Reserve stock so it can't be double-sold while payment is pending.
    // Physically decremented from stockOnHand only once payment succeeds
    // (see features/orders/actions/payment.ts).
    for (const item of activeItems) {
      await tx.inventory.updateMany({
        where: { storeId: quote.storeId, productId: item.productId },
        data: { stockReserved: { increment: item.quantity } },
      });
    }

    // Ordered items leave the cart; anything saved-for-later stays.
    await tx.cartItem.deleteMany({
      where: { cartId: cart.id, id: { in: activeItems.map((i) => i.id) } },
    });

    await tx.auditLog.create({
      data: {
        actorUserId: userId,
        action: "order.created",
        resource: `order:${created.id}`,
        result: "success",
      },
    });

    return created;
  });

  return order;
}
