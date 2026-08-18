"use server";

import { redirect } from "next/navigation";
import { db } from "@/lib/db";
import { requireUser } from "@/features/auth/lib/session";
import { isOrderCancellable } from "@/features/orders/lib/order-display";

export interface CancelOrderState {
  error?: string;
}

export async function cancelOrderAction(
  orderId: string,
  _prev: CancelOrderState,
  formData: FormData
): Promise<CancelOrderState> {
  const user = await requireUser();
  const reason = String(formData.get("reason") ?? "").trim() || "Cancelled by customer";

  const order = await db.order.findFirst({
    where: { id: orderId, userId: user.id },
    include: { items: true, payment: true },
  });
  if (!order) {
    return { error: "Order not found." };
  }
  if (!isOrderCancellable(order.status)) {
    return {
      error: "This order can't be cancelled because it has already been dispatched.",
    };
  }

  const paymentWasVerified = order.payment?.status === "SUCCESS";

  await db.$transaction(async (tx) => {
    await tx.order.update({ where: { id: order.id }, data: { status: "CANCELLED" } });

    for (const item of order.items) {
      if (paymentWasVerified) {
        // Stock was already physically deducted at payment confirmation —
        // put it back.
        await tx.inventory.updateMany({
          where: { storeId: order.storeId ?? undefined, productId: item.productId },
          data: { stockOnHand: { increment: item.quantity } },
        });
      } else {
        // Payment never completed — only the reservation needs releasing.
        await tx.inventory.updateMany({
          where: { storeId: order.storeId ?? undefined, productId: item.productId },
          data: { stockReserved: { decrement: item.quantity } },
        });
      }
    }

    if (paymentWasVerified) {
      // Mock gateway settles instantly. A real gateway's refund is async,
      // so this would start at REQUESTED and move to COMPLETED via a
      // webhook rather than in the same request.
      await tx.refund.create({
        data: {
          orderId: order.id,
          status: "COMPLETED",
          reason,
          amount: order.total,
        },
      });
    }

    await tx.notification.create({
      data: {
        userId: user.id,
        type: "order_cancelled",
        title: "Order cancelled",
        body: paymentWasVerified
          ? "Your order was cancelled and a refund has been issued."
          : "Your order was cancelled.",
      },
    });

    await tx.auditLog.create({
      data: {
        actorUserId: user.id,
        action: "order.cancelled",
        resource: `order:${order.id}`,
        result: "success",
      },
    });
  });

  redirect(`/orders/${orderId}`);
}
