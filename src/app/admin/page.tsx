import Link from "next/link";
import { requireStaff } from "@/features/admin/lib/auth";
import { getDashboardMetrics, getOrdersLast7Days, getTopProducts } from "@/features/admin/lib/dashboard";
import { SimpleBarChart } from "@/features/admin/components/simple-bar-chart";

export default async function AdminDashboardPage() {
  await requireStaff();

  const [metrics, orderTrend, topProducts] = await Promise.all([
    getDashboardMetrics(),
    getOrdersLast7Days(),
    getTopProducts(),
  ]);

  const cards = [
    { label: "Today's revenue", value: `₹${metrics.todayRevenue.toFixed(0)}` },
    { label: "Orders today", value: metrics.todayOrderCount },
    { label: "Total orders", value: metrics.totalOrders },
    { label: "Pending orders", value: metrics.pendingOrders },
    { label: "Delivered orders", value: metrics.deliveredOrders },
    { label: "Cancelled orders", value: metrics.cancelledOrders },
    { label: "Active customers", value: metrics.activeCustomers },
    { label: "Low-stock products", value: metrics.lowStock.length },
  ];

  return (
    <div className="space-y-8">
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        {cards.map((card) => (
          <div key={card.label} className="rounded-xl border border-line bg-surface p-4">
            <p className="text-xs text-ink-soft">{card.label}</p>
            <p className="mt-1 font-mono text-xl font-semibold text-ink">{card.value}</p>
          </div>
        ))}
      </div>

      <div className="grid gap-6 sm:grid-cols-2">
        <div className="rounded-xl border border-line bg-surface p-5">
          <p className="text-sm font-medium text-ink">Orders — last 7 days</p>
          <div className="mt-4">
            <SimpleBarChart data={orderTrend} />
          </div>
        </div>

        <div className="rounded-xl border border-line bg-surface p-5">
          <p className="text-sm font-medium text-ink">Top products by units sold</p>
          {topProducts.length === 0 ? (
            <p className="mt-3 text-sm text-ink-soft">No sales yet.</p>
          ) : (
            <ul className="mt-3 space-y-2 text-sm">
              {topProducts.map((p, i) => (
                <li key={p.productId} className="flex items-center justify-between">
                  <span className="text-ink-soft">
                    {i + 1}. {p.name}
                  </span>
                  <span className="font-mono text-ink">{p.unitsSold}</span>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>

      {metrics.lowStock.length > 0 && (
        <div className="rounded-xl border border-warn/40 bg-warn/10 p-5">
          <p className="text-sm font-medium text-warn">Low-stock alerts</p>
          <ul className="mt-2 space-y-1 text-sm text-ink-soft">
            {metrics.lowStock.map((inv) => (
              <li key={inv.id}>
                {inv.product.name} ({inv.product.sku}) at {inv.store.name}:{" "}
                {inv.stockOnHand - inv.stockReserved} available
              </li>
            ))}
          </ul>
          <Link href="/admin/inventory" className="mt-3 inline-block text-sm text-brand hover:underline">
            Manage inventory →
          </Link>
        </div>
      )}
    </div>
  );
}
