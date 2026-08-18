import type { DeliveryQuote, DeliveryUnavailable } from "@/features/delivery/lib/engine";

export function DeliveryResult({ result }: { result: DeliveryQuote | DeliveryUnavailable }) {
  if (!result.available) {
    const message =
      result.reason === "invalid_pincode"
        ? "Enter a valid pincode to check."
        : result.reason === "out_of_stock"
          ? "These items aren't in stock at any store that delivers to this pincode."
          : "Delivery isn't available in this area yet.";

    return (
      <div className="rounded-lg bg-danger/10 px-3 py-2.5 text-sm text-danger">{message}</div>
    );
  }

  return (
    <div className="rounded-lg bg-safe/10 px-3 py-2.5 text-sm text-safe">
      <p className="font-medium">Delivery available — {result.zoneName}</p>
      <p className="mt-0.5 text-ink-soft">
        Estimated delivery: {result.etaMinMinutes}–{result.etaMaxMinutes} minutes ·{" "}
        {result.fee === 0 ? "Free delivery" : `₹${result.fee.toFixed(0)} delivery fee`}
      </p>
    </div>
  );
}
