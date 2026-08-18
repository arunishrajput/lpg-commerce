import "server-only";
import { db } from "@/lib/db";
import { scoreFromSignals, type RiskLevel, type RiskSignals } from "./risk-scoring";

export type { RiskLevel, RiskSignals };
export { scoreFromSignals };

export async function computeRiskScore(userId: string): Promise<RiskLevel> {
  const since = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);

  const [failedPayments, recentOrders, cancelledOrders, refunds, ordersLast24h] = await Promise.all([
    db.payment.count({
      where: { order: { userId }, status: "FAILED", createdAt: { gte: since } },
    }),
    db.order.count({ where: { userId, createdAt: { gte: since } } }),
    db.order.count({ where: { userId, status: "CANCELLED", createdAt: { gte: since } } }),
    db.refund.count({ where: { order: { userId }, createdAt: { gte: since } } }),
    db.order.count({ where: { userId, createdAt: { gte: new Date(Date.now() - 24 * 60 * 60 * 1000) } } }),
  ]);

  return scoreFromSignals({ failedPayments, recentOrders, cancelledOrders, refunds, ordersLast24h });
}
