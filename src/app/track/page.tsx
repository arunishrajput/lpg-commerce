import { redirect } from "next/navigation";
import Link from "next/link";
import { getCurrentUser } from "@/features/auth/lib/session";
import { listOrdersForUser } from "@/features/orders/lib/queries";
import { orderDisplayId, ORDER_STATUS_LABELS } from "@/features/orders/lib/order-display";

export default async function TrackOrderPage() {
  const user = await getCurrentUser();
  if (!user) redirect("/login");

  const orders = await listOrdersForUser(user.id);
  const recent = orders.slice(0, 5);

  return (
    <div className="mx-auto max-w-md px-4 py-16 sm:px-6">
      <h1 className="font-display text-2xl font-semibold text-ink">Track an order</h1>
      <p className="mt-1 text-sm text-ink-soft">
        Select a recent order to see its live status.
      </p>

      {recent.length === 0 ? (
        <p className="mt-6 text-sm text-ink-soft">You don&apos;t have any orders yet.</p>
      ) : (
        <div className="mt-6 space-y-2">
          {recent.map((order) => (
            <Link
              key={order.id}
              href={`/orders/${order.id}`}
              className="flex items-center justify-between rounded-xl border border-line bg-surface p-4 hover:border-brand"
            >
              <span className="font-mono text-sm text-ink">{orderDisplayId(order.id)}</span>
              <span className="text-xs text-ink-soft">
                {ORDER_STATUS_LABELS[order.status] ?? order.status}
              </span>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
