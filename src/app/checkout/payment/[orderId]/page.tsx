import { redirect, notFound } from "next/navigation";
import { getCurrentUser } from "@/features/auth/lib/session";
import { db } from "@/lib/db";
import { orderDisplayId } from "@/features/orders/lib/order-display";
import { PaymentForm } from "./payment-form";

export default async function PaymentPage({
  params,
}: {
  params: Promise<{ orderId: string }>;
}) {
  const user = await getCurrentUser();
  if (!user) redirect("/login");

  const { orderId } = await params;
  const order = await db.order.findFirst({
    where: { id: orderId, userId: user.id },
    include: { payment: true, items: true },
  });
  if (!order || !order.payment) notFound();

  if (order.payment.status === "SUCCESS") {
    redirect(`/orders/${orderId}`);
  }

  return (
    <div className="mx-auto max-w-md px-4 py-16 sm:px-6">
      <h1 className="font-display text-2xl font-semibold text-ink">Payment</h1>
      <p className="mt-1 text-sm text-ink-soft">
        Order {orderDisplayId(order.id)} — {order.items.length} item
        {order.items.length !== 1 ? "s" : ""}
      </p>

      <div className="mt-6 rounded-2xl border border-line bg-surface p-6">
        <div className="flex items-baseline justify-between">
          <span className="text-sm text-ink-soft">Amount due</span>
          <span className="font-mono text-xl font-semibold text-ink">
            ₹{Number(order.total).toFixed(0)}
          </span>
        </div>

        {order.payment.status === "FAILED" && (
          <p className="mt-3 rounded-lg bg-danger/10 px-3 py-2 text-sm text-danger">
            Your last payment attempt failed. You can try again below.
          </p>
        )}

        <div className="mt-6 rounded-lg border border-dashed border-line bg-paper p-4 text-xs text-ink-soft">
          This is a mock payment gateway for demo purposes — no real card or
          bank details are collected. Verification happens server-side.
        </div>

        <PaymentForm orderId={order.id} />
      </div>
    </div>
  );
}
