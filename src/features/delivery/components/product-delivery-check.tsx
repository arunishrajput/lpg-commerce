import { resolveDelivery } from "@/features/delivery/lib/engine";
import { DeliveryResult } from "./delivery-result";

export async function ProductDeliveryCheck({
  productId,
  pincode,
}: {
  productId: string;
  pincode?: string;
}) {
  const result = pincode ? await resolveDelivery(pincode, [productId]) : null;

  return (
    <div className="rounded-xl border border-line bg-surface p-4">
      <p className="text-sm font-medium text-ink">Check delivery for this item</p>
      <form action="" method="get" className="mt-2 flex gap-2">
        <input
          type="text"
          name="pincode"
          defaultValue={pincode}
          placeholder="Enter pincode"
          inputMode="numeric"
          required
          className="w-full rounded-lg border border-line bg-paper px-3 py-2 text-sm text-ink placeholder:text-ink-soft/60 focus:border-brand focus:outline-none"
        />
        <button
          type="submit"
          className="shrink-0 rounded-lg border border-line px-3 py-2 text-sm text-ink hover:border-brand"
        >
          Check
        </button>
      </form>
      {result && (
        <div className="mt-3">
          <DeliveryResult result={result} />
        </div>
      )}
    </div>
  );
}
