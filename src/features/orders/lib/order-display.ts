/** Human-friendly order reference — the raw cuid stays the real primary key. */
export function orderDisplayId(orderId: string): string {
  return `#${orderId.slice(-8).toUpperCase()}`;
}

export const ORDER_STATUS_LABELS: Record<string, string> = {
  PLACED: "Order placed",
  PAYMENT_VERIFIED: "Payment verified",
  CONFIRMED: "Confirmed",
  PROCESSING: "Processing",
  PACKED: "Packed",
  DISPATCHED: "Dispatched",
  OUT_FOR_DELIVERY: "Out for delivery",
  DELIVERED: "Delivered",
  CANCELLED: "Cancelled",
};

export const ORDER_LIFECYCLE = [
  "PLACED",
  "PAYMENT_VERIFIED",
  "CONFIRMED",
  "PROCESSING",
  "PACKED",
  "DISPATCHED",
  "OUT_FOR_DELIVERY",
  "DELIVERED",
] as const;

/** Orders can only be cancelled before they've physically left the store. */
const CANCELLABLE_STATUSES = new Set(["PLACED", "PAYMENT_VERIFIED", "CONFIRMED", "PROCESSING"]);

export function isOrderCancellable(status: string): boolean {
  return CANCELLABLE_STATUSES.has(status);
}
