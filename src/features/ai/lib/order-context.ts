import "server-only";
import { db } from "@/lib/db";
import { orderDisplayId, ORDER_STATUS_LABELS } from "@/features/orders/lib/order-display";

const ORDER_KEYWORDS = [
  "order",
  "delivery",
  "deliver",
  "shipment",
  "shipped",
  "track",
  "payment",
  "paid",
  "refund",
  "cancel",
  "invoice",
];

export function mentionsOrder(message: string): boolean {
  const lower = message.toLowerCase();
  return ORDER_KEYWORDS.some((kw) => lower.includes(kw));
}

/**
 * Only ever looks up the requesting user's own orders — there's no path
 * from this function to another customer's data, regardless of what the
 * message asks.
 */
export async function retrieveOrderContext(userId: string, limit = 3): Promise<string> {
  const orders = await db.order.findMany({
    where: { userId },
    orderBy: { createdAt: "desc" },
    take: limit,
    include: { payment: true, refund: true, items: { select: { quantity: true } } },
  });

  if (orders.length === 0) return "";

  return orders
    .map((o) => {
      const itemCount = o.items.reduce((sum, i) => sum + i.quantity, 0);
      const parts = [
        `Order ${orderDisplayId(o.id)}: status ${ORDER_STATUS_LABELS[o.status] ?? o.status}, ${itemCount} item(s), total ₹${Number(o.total).toFixed(0)}, placed ${o.createdAt.toDateString()}`,
        o.payment ? `Payment: ${o.payment.status.toLowerCase()}` : null,
        o.refund ? `Refund: ${o.refund.status.toLowerCase()}, ₹${Number(o.refund.amount).toFixed(0)}` : null,
      ];
      return parts.filter(Boolean).join(". ");
    })
    .join("\n");
}
