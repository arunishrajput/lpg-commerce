import "server-only";
import { db } from "@/lib/db";

export async function listOrdersForUser(userId: string) {
  return db.order.findMany({
    where: { userId },
    orderBy: { createdAt: "desc" },
    include: {
      items: { include: { product: { include: { images: { take: 1 } } } } },
      payment: true,
    },
  });
}

export async function getOrderDetail(orderId: string, userId: string) {
  return db.order.findFirst({
    where: { id: orderId, userId },
    include: {
      items: { include: { product: { include: { images: { take: 1 } } } } },
      payment: true,
      refund: true,
      invoice: true,
      warranty: true,
      address: true,
      store: true,
      delivery: true,
    },
  });
}
