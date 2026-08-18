export type RiskLevel = "low" | "medium" | "high";

export interface RiskSignals {
  failedPayments: number;
  recentOrders: number;
  cancelledOrders: number;
  refunds: number;
  ordersLast24h: number;
}

/**
 * Pure scoring function — no I/O, so it's directly unit-testable without a
 * database. Uses only operational signals already on the order/payment/
 * refund records, never protected attributes. Feeds a "flag for manual
 * review" label (Order.riskScore), not an automatic block: nothing here
 * prevents an order from being placed or a payment from being attempted.
 */
export function scoreFromSignals(signals: RiskSignals): RiskLevel {
  let points = 0;

  // Repeated failed payments — possible card testing.
  if (signals.failedPayments >= 5) points += 3;
  else if (signals.failedPayments >= 2) points += 1;

  // Excessive cancellations relative to order volume.
  const cancellationRate = signals.recentOrders > 0 ? signals.cancelledOrders / signals.recentOrders : 0;
  if (signals.recentOrders >= 3 && cancellationRate >= 0.6) points += 2;
  else if (signals.recentOrders >= 3 && cancellationRate >= 0.3) points += 1;

  // Unusual order frequency — many orders in a single day.
  if (signals.ordersLast24h >= 5) points += 2;
  else if (signals.ordersLast24h >= 3) points += 1;

  // Suspicious refund behavior.
  if (signals.refunds >= 3) points += 2;
  else if (signals.refunds >= 1) points += 0.5;

  if (points >= 4) return "high";
  if (points >= 1.5) return "medium";
  return "low";
}
