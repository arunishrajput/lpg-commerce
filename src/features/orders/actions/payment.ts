"use server";

import { redirect } from "next/navigation";
import { db } from "@/lib/db";
import { requireUser } from "@/features/auth/lib/session";
import { initiatePayment, verifyPayment } from "@/services/payments";

export async function processPaymentAction(orderId: string, simulateFailure: boolean): Promise<void> {
  const user = await requireUser();

  const order = await db.order.findFirst({
    where: { id: orderId, userId: user.id },
    include: { payment: true, items: true },
  });
  if (!order || !order.payment) {
    throw new Error("Order not found.");
  }
  if (order.payment.status === "SUCCESS") {
    redirect(`/orders/${orderId}`);
  }

  const initiation = await initiatePayment({
    orderId,
    amount: Number(order.total),
    method: order.payment.method,
  });

  // The mock provider treats a "_FAIL" suffix on the reference as a forced
  // failure, so the failure path is reachable deterministically in this demo.
  const providerRef = simulateFailure ? `${initiation.providerRef}_FAIL` : initiation.providerRef;
  const verification = await verifyPayment(providerRef);

  // Server-side verification is the only thing that moves the order
  // forward — nothing here trusts a client-reported "it worked".
  if (verification.status === "success") {
    await db.$transaction(async (tx) => {
      await tx.payment.update({
        where: { id: order.payment!.id },
        data: { status: "SUCCESS", providerRef, verifiedAt: new Date() },
      });

      // No manual store-confirmation step exists yet (that's part of the
      // Phase 7 admin dashboard), so a verified payment advances straight
      // to CONFIRMED rather than pausing at PAYMENT_VERIFIED.
      await tx.order.update({ where: { id: orderId }, data: { status: "CONFIRMED" } });

      for (const item of order.items) {
        await tx.inventory.updateMany({
          where: { storeId: order.storeId ?? undefined, productId: item.productId },
          data: {
            stockOnHand: { decrement: item.quantity },
            stockReserved: { decrement: item.quantity },
          },
        });

        const product = await tx.product.findUnique({ where: { id: item.productId } });
        if (product && product.warrantyMonths > 0) {
          const expiresAt = new Date();
          expiresAt.setMonth(expiresAt.getMonth() + product.warrantyMonths);
          await tx.warranty.create({
            data: {
              orderId,
              productName: product.name,
              expiresAt,
            },
          });
        }
      }

      await tx.invoice.create({ data: { orderId, pdfUrl: null } });

      await tx.notification.create({
        data: {
          userId: user.id,
          type: "order_confirmed",
          title: "Order confirmed",
          body: `Your order has been confirmed and payment received.`,
        },
      });

      await tx.auditLog.create({
        data: {
          actorUserId: user.id,
          action: "payment.verified",
          resource: `order:${orderId}`,
          result: "success",
        },
      });
    });
  } else {
    await db.$transaction(async (tx) => {
      await tx.payment.update({
        where: { id: order.payment!.id },
        data: { status: "FAILED", providerRef },
      });

      await tx.notification.create({
        data: {
          userId: user.id,
          type: "payment_failed",
          title: "Payment failed",
          body: "Your payment couldn't be completed. You can try again from your order.",
        },
      });

      await tx.auditLog.create({
        data: {
          actorUserId: user.id,
          action: "payment.failed",
          resource: `order:${orderId}`,
          result: "failure",
        },
      });
    });
  }

  redirect(`/orders/${orderId}`);
}
