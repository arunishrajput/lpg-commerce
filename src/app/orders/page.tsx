import { redirect } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { getCurrentUser } from "@/features/auth/lib/session";
import { listOrdersForUser } from "@/features/orders/lib/queries";
import { orderDisplayId, ORDER_STATUS_LABELS } from "@/features/orders/lib/order-display";
import { Button } from "@/components/ui/button";

export default async function OrdersPage() {
  const user = await getCurrentUser();
  if (!user) redirect("/login");

  const orders = await listOrdersForUser(user.id);

  return (
    <div className="mx-auto max-w-3xl px-4 py-10 sm:px-6">
      <h1 className="font-display text-2xl font-semibold text-ink">Your orders</h1>

      {orders.length === 0 ? (
        <div className="mt-8 rounded-xl border border-dashed border-line p-12 text-center">
          <p className="text-sm font-medium text-ink">No orders yet</p>
          <Link href="/products" className="mt-4 inline-block">
            <Button>Browse products</Button>
          </Link>
        </div>
      ) : (
        <div className="mt-6 space-y-3">
          {orders.map((order) => (
            <Link
              key={order.id}
              href={`/orders/${order.id}`}
              className="flex items-center gap-4 rounded-xl border border-line bg-surface p-4 transition-colors hover:border-brand"
            >
              <div className="flex -space-x-3">
                {order.items.slice(0, 3).map((item) => (
                  <div
                    key={item.id}
                    className="relative h-12 w-12 overflow-hidden rounded-lg border-2 border-surface bg-paper"
                  >
                    {item.product.images[0] && (
                      <Image
                        src={item.product.images[0].url}
                        alt=""
                        fill
                        sizes="48px"
                        className="object-cover"
                      />
                    )}
                  </div>
                ))}
              </div>

              <div className="flex-1">
                <div className="flex items-center justify-between">
                  <p className="font-mono text-sm text-ink">{orderDisplayId(order.id)}</p>
                  <p className="font-mono text-sm text-ink">₹{Number(order.total).toFixed(0)}</p>
                </div>
                <div className="mt-0.5 flex items-center justify-between">
                  <p className="text-xs text-ink-soft">
                    {order.items.length} item{order.items.length !== 1 ? "s" : ""} ·{" "}
                    {order.createdAt.toLocaleDateString()}
                  </p>
                  <StatusBadge status={order.status} />
                </div>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}

function StatusBadge({ status }: { status: string }) {
  const tone =
    status === "CANCELLED"
      ? "bg-danger/10 text-danger"
      : status === "DELIVERED"
        ? "bg-safe/10 text-safe"
        : "bg-brand/10 text-brand";

  return (
    <span className={`rounded-full px-2 py-0.5 text-xs font-medium ${tone}`}>
      {ORDER_STATUS_LABELS[status] ?? status}
    </span>
  );
}
