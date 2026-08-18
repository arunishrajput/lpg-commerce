import { ORDER_LIFECYCLE, ORDER_STATUS_LABELS } from "@/features/orders/lib/order-display";

export function OrderTimeline({ status }: { status: string }) {
  if (status === "CANCELLED") {
    return (
      <div className="rounded-xl border border-danger/30 bg-danger/10 p-4 text-sm text-danger">
        This order was cancelled.
      </div>
    );
  }

  const currentIndex = ORDER_LIFECYCLE.indexOf(status as (typeof ORDER_LIFECYCLE)[number]);

  return (
    <ol className="space-y-3">
      {ORDER_LIFECYCLE.map((step, i) => {
        const done = i <= currentIndex;
        const isCurrent = i === currentIndex;
        return (
          <li key={step} className="flex items-center gap-3">
            <span
              className={`flex h-5 w-5 shrink-0 items-center justify-center rounded-full text-[10px] ${
                done ? "bg-brand text-white" : "border border-line text-transparent"
              }`}
            >
              {done ? "✓" : ""}
            </span>
            <span className={`text-sm ${isCurrent ? "font-medium text-ink" : done ? "text-ink" : "text-ink-soft"}`}>
              {ORDER_STATUS_LABELS[step]}
            </span>
          </li>
        );
      })}
    </ol>
  );
}
