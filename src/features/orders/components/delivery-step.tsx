import Link from "next/link";
import type { DeliveryQuote, DeliveryUnavailable } from "@/features/delivery/lib/engine";
import { Button } from "@/components/ui/button";

export function DeliveryStep({
  quote,
  carryParams,
}: {
  quote: DeliveryQuote | DeliveryUnavailable;
  carryParams: string;
}) {
  if (!quote.available) {
    return (
      <div className="space-y-4">
        <div className="rounded-xl border border-danger/30 bg-danger/10 p-4 text-sm text-danger">
          <p className="font-medium">
            {quote.reason === "out_of_stock"
              ? "These items can't be delivered to this address right now."
              : "We don't deliver to this address yet."}
          </p>
          <p className="mt-1 text-ink-soft">
            {quote.reason === "out_of_stock"
              ? "No store carrying every item in your cart delivers here. Try a different address, or adjust your cart."
              : "Try a different delivery address, or check availability from the delivery check page."}
          </p>
        </div>
        <div className="flex justify-between">
          <Link href="/checkout?step=address" className="text-sm text-brand hover:underline">
            ← Choose a different address
          </Link>
          <Link href="/delivery-check" className="text-sm text-brand hover:underline">
            Check another pincode
          </Link>
        </div>
      </div>
    );
  }

  return (
    <form action="/checkout" method="get" className="space-y-4">
      <input type="hidden" name="step" value="review" />
      {carryParams
        .split("&")
        .filter(Boolean)
        .map((pair) => {
          const [key, value] = pair.split("=");
          return <input key={key} type="hidden" name={key} value={decodeURIComponent(value ?? "")} />;
        })}

      <label className="flex cursor-pointer items-start gap-3 rounded-xl border border-brand bg-surface p-4">
        <input type="radio" name="delivery" value="standard" defaultChecked required className="mt-1" />
        <div className="flex-1">
          <div className="flex items-center justify-between">
            <p className="text-sm font-medium text-ink">{quote.zoneName}</p>
            <p className="font-mono text-sm text-ink">
              {quote.fee === 0 ? "Free" : `₹${quote.fee.toFixed(0)}`}
            </p>
          </div>
          <p className="mt-0.5 text-sm text-ink-soft">
            Estimated delivery: {quote.etaMinMinutes}–{quote.etaMaxMinutes} minutes
            {quote.distanceKm !== null ? ` · ~${quote.distanceKm.toFixed(1)} km away` : ""}
          </p>
        </div>
      </label>

      <div className="flex justify-end pt-2">
        <Button type="submit">Continue to review</Button>
      </div>
    </form>
  );
}
