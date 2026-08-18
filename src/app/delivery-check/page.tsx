import { resolveDelivery } from "@/features/delivery/lib/engine";
import { DeliveryResult } from "@/features/delivery/components/delivery-result";
import { Button } from "@/components/ui/button";

export default async function DeliveryCheckPage({
  searchParams,
}: {
  searchParams: Promise<{ pincode?: string }>;
}) {
  const { pincode } = await searchParams;
  const result = pincode ? await resolveDelivery(pincode) : null;

  return (
    <div className="mx-auto max-w-md px-4 py-16 sm:px-6">
      <h1 className="font-display text-2xl font-semibold text-ink">Check delivery availability</h1>
      <p className="mt-1 text-sm text-ink-soft">
        Enter your pincode to see whether we deliver to your area, and the
        estimated delivery time.
      </p>

      <form action="/delivery-check" method="get" className="mt-6 flex gap-2">
        <input
          type="text"
          name="pincode"
          defaultValue={pincode}
          placeholder="e.g. 110001"
          inputMode="numeric"
          required
          className="w-full rounded-lg border border-line bg-surface px-3.5 py-2.5 text-sm text-ink placeholder:text-ink-soft/60 focus:border-brand focus:outline-none"
        />
        <Button type="submit">Check</Button>
      </form>

      {result && (
        <div className="mt-4">
          <DeliveryResult result={result} />
        </div>
      )}

      <p className="mt-6 text-xs text-ink-soft">
        Delivery zones shown are a demo configuration covering a small set
        of sample pincodes, not a real service-area map.
      </p>
    </div>
  );
}
