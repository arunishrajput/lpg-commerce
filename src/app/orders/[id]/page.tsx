import { redirect, notFound } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import { getCurrentUser } from "@/features/auth/lib/session";
import { getOrderDetail } from "@/features/orders/lib/queries";
import { orderDisplayId, isOrderCancellable } from "@/features/orders/lib/order-display";
import { OrderTimeline } from "@/features/orders/components/order-timeline";
import { CancelSection } from "./cancel-section";
import { Button } from "@/components/ui/button";

export default async function OrderDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const user = await getCurrentUser();
  if (!user) redirect("/login");

  const { id } = await params;
  const order = await getOrderDetail(id, user.id);
  if (!order) notFound();

  const paymentPending = order.payment?.status === "PENDING";
  const paymentFailed = order.payment?.status === "FAILED";

  return (
    <div className="mx-auto max-w-3xl px-4 py-10 sm:px-6">
      <div className="flex flex-wrap items-baseline justify-between gap-2">
        <h1 className="font-display text-2xl font-semibold text-ink">
          Order {orderDisplayId(order.id)}
        </h1>
        <p className="text-sm text-ink-soft">{order.createdAt.toLocaleString()}</p>
      </div>

      {(paymentPending || paymentFailed) && (
        <div className="mt-4 rounded-xl border border-warn/40 bg-warn/10 p-4">
          <p className="text-sm font-medium text-warn">
            {paymentFailed ? "Payment failed" : "Payment pending"}
          </p>
          <p className="mt-1 text-sm text-ink-soft">
            {paymentFailed
              ? "Your last attempt didn't go through. You can try again."
              : "Complete payment to confirm this order."}
          </p>
          <Link href={`/checkout/payment/${order.id}`} className="mt-3 inline-block">
            <Button>{paymentFailed ? "Retry payment" : "Complete payment"}</Button>
          </Link>
        </div>
      )}

      <div className="mt-6 grid gap-8 sm:grid-cols-[1fr_240px]">
        <div className="space-y-6">
          <div className="space-y-3">
            {order.items.map((item) => (
              <div key={item.id} className="flex items-center gap-3 rounded-xl border border-line bg-surface p-3">
                <div className="relative h-14 w-14 shrink-0 overflow-hidden rounded-lg bg-paper">
                  {item.product.images[0] && (
                    <Image
                      src={item.product.images[0].url}
                      alt={item.product.name}
                      fill
                      sizes="56px"
                      className="object-cover"
                    />
                  )}
                </div>
                <div className="flex-1">
                  <Link href={`/products/${item.product.slug}`} className="text-sm text-ink hover:underline">
                    {item.product.name}
                  </Link>
                  <p className="text-xs text-ink-soft">Qty {item.quantity}</p>
                </div>
                <p className="font-mono text-sm text-ink">
                  ₹{(Number(item.unitPrice) * item.quantity).toFixed(0)}
                </p>
              </div>
            ))}
          </div>

          <div className="rounded-xl border border-line bg-surface p-4">
            <p className="text-sm font-medium text-ink">Delivering to</p>
            <p className="mt-1 text-sm text-ink-soft">
              {order.address.line1}
              {order.address.line2 ? `, ${order.address.line2}` : ""}, {order.address.city},{" "}
              {order.address.state} {order.address.pincode}
            </p>
            {order.delivery && (
              <p className="mt-2 text-xs text-ink-soft">
                {order.store?.name ?? "Assigned store"}
                {order.delivery.distanceKm !== null
                  ? ` · ~${order.delivery.distanceKm.toFixed(1)} km away`
                  : ""}
                {order.delivery.etaMinutes ? ` · est. ${order.delivery.etaMinutes} min` : ""}
              </p>
            )}
          </div>

          <dl className="space-y-2 rounded-xl border border-line bg-surface p-4 text-sm">
            <div className="flex justify-between">
              <dt className="text-ink-soft">Subtotal</dt>
              <dd className="font-mono text-ink">₹{Number(order.subtotal).toFixed(0)}</dd>
            </div>
            {Number(order.discount) > 0 && (
              <div className="flex justify-between">
                <dt className="text-ink-soft">Discount</dt>
                <dd className="font-mono text-safe">−₹{Number(order.discount).toFixed(0)}</dd>
              </div>
            )}
            <div className="flex justify-between">
              <dt className="text-ink-soft">Delivery fee</dt>
              <dd className="font-mono text-ink">
                {Number(order.deliveryFee) === 0 ? "Free" : `₹${Number(order.deliveryFee).toFixed(0)}`}
              </dd>
            </div>
            <div className="flex justify-between border-t border-line pt-2 text-base font-medium">
              <dt className="text-ink">Total</dt>
              <dd className="font-mono text-ink">₹{Number(order.total).toFixed(0)}</dd>
            </div>
          </dl>

          {order.warranty.length > 0 && (
            <div className="rounded-xl border border-line bg-surface p-4">
              <p className="text-sm font-medium text-ink">Warranty</p>
              <ul className="mt-2 space-y-1 text-sm text-ink-soft">
                {order.warranty.map((w) => (
                  <li key={w.id}>
                    {w.productName} — until {w.expiresAt.toLocaleDateString()}
                  </li>
                ))}
              </ul>
            </div>
          )}

          {order.invoice && (
            <div className="rounded-xl border border-line bg-surface p-4">
              <p className="text-sm font-medium text-ink">Invoice</p>
              <p className="mt-1 text-sm text-ink-soft">
                Issued {order.invoice.issuedAt.toLocaleDateString()}. Downloadable PDF invoices
                arrive with document generation in a later phase.
              </p>
            </div>
          )}

          {order.refund && (
            <div className="rounded-xl border border-line bg-surface p-4">
              <p className="text-sm font-medium text-ink">Refund</p>
              <p className="mt-1 text-sm text-ink-soft">
                ₹{Number(order.refund.amount).toFixed(0)} — {order.refund.status.toLowerCase()}
              </p>
            </div>
          )}
        </div>

        <div className="space-y-6">
          <div>
            <p className="mb-3 text-sm font-medium text-ink">Status</p>
            <OrderTimeline status={order.status} />
          </div>

          {isOrderCancellable(order.status) && <CancelSection orderId={order.id} />}
        </div>
      </div>
    </div>
  );
}
