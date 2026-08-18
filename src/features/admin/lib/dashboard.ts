import "server-only";
import { db } from "@/lib/db";

function startOfDay(d: Date): Date {
  const copy = new Date(d);
  copy.setHours(0, 0, 0, 0);
  return copy;
}

export async function getDashboardMetrics() {
  const today = startOfDay(new Date());

  const [
    todayOrders,
    totalOrders,
    pendingOrders,
    deliveredOrders,
    cancelledOrders,
    activeCustomers,
    lowStockInventory,
  ] = await Promise.all([
    db.order.findMany({ where: { createdAt: { gte: today } }, select: { total: true } }),
    db.order.count(),
    db.order.count({
      where: { status: { in: ["PLACED", "PAYMENT_VERIFIED", "CONFIRMED", "PROCESSING", "PACKED"] } },
    }),
    db.order.count({ where: { status: "DELIVERED" } }),
    db.order.count({ where: { status: "CANCELLED" } }),
    db.user.count({ where: { orders: { some: {} } } }),
    db.inventory.findMany({
      include: { product: { select: { name: true, sku: true } }, store: { select: { name: true } } },
    }),
  ]);

  const todayRevenue = todayOrders.reduce((sum, o) => sum + Number(o.total), 0);
  const lowStock = lowStockInventory.filter(
    (inv) => inv.stockOnHand - inv.stockReserved <= inv.lowStockAt
  );

  return {
    todayRevenue,
    todayOrderCount: todayOrders.length,
    totalOrders,
    pendingOrders,
    deliveredOrders,
    cancelledOrders,
    activeCustomers,
    lowStock,
  };
}

/** Order counts for the last 7 days, oldest first — used for a simple bar chart. */
export async function getOrdersLast7Days(): Promise<{ label: string; count: number }[]> {
  const days: { label: string; start: Date; end: Date }[] = [];
  for (let i = 6; i >= 0; i--) {
    const start = startOfDay(new Date(Date.now() - i * 24 * 60 * 60 * 1000));
    const end = new Date(start.getTime() + 24 * 60 * 60 * 1000);
    days.push({ label: start.toLocaleDateString(undefined, { weekday: "short" }), start, end });
  }

  const counts = await Promise.all(
    days.map((d) => db.order.count({ where: { createdAt: { gte: d.start, lt: d.end } } }))
  );

  return days.map((d, i) => ({ label: d.label, count: counts[i] }));
}

export async function getTopProducts(limit = 5) {
  const items = await db.orderItem.groupBy({
    by: ["productId"],
    _sum: { quantity: true },
    orderBy: { _sum: { quantity: "desc" } },
    take: limit,
  });

  const products = await db.product.findMany({
    where: { id: { in: items.map((i) => i.productId) } },
    select: { id: true, name: true },
  });
  const nameById = new Map(products.map((p) => [p.id, p.name]));

  return items.map((i) => ({
    productId: i.productId,
    name: nameById.get(i.productId) ?? "Unknown product",
    unitsSold: i._sum.quantity ?? 0,
  }));
}
