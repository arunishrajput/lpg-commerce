import Link from "next/link";
import { Button } from "@/components/ui/button";
import type { CartTotals } from "@/features/cart/lib/queries";

export function CartSummary({
  totals,
  couponCode,
  couponError,
  couponApplied,
  itemCount,
  hasIssues,
  deliveryNote,
}: {
  totals: CartTotals;
  couponCode?: string;
  couponError?: string;
  couponApplied?: boolean;
  itemCount: number;
  hasIssues: boolean;
  deliveryNote?: string | null;
}) {
  return (
    <div className="rounded-xl border border-line bg-surface p-5">
      <h2 className="font-medium text-ink">Order summary</h2>

      <form action="/cart" method="get" className="mt-4 flex gap-2">
        <input
          type="text"
          name="coupon"
          placeholder="Coupon code"
          defaultValue={couponCode}
          className="w-full rounded-lg border border-line bg-paper px-3 py-2 text-sm text-ink placeholder:text-ink-soft/60 focus:border-brand focus:outline-none"
        />
        <Button type="submit" variant="secondary">
          Apply
        </Button>
      </form>
      {couponError && <p className="mt-1 text-xs text-danger">{couponError}</p>}
      {couponApplied && <p className="mt-1 text-xs text-safe">Coupon applied.</p>}

      <dl className="mt-5 space-y-2 text-sm">
        <div className="flex justify-between">
          <dt className="text-ink-soft">Subtotal ({itemCount} items)</dt>
          <dd className="font-mono text-ink">₹{totals.subtotal.toFixed(0)}</dd>
        </div>
        {totals.discount > 0 && (
          <div className="flex justify-between">
            <dt className="text-ink-soft">Discount</dt>
            <dd className="font-mono text-safe">−₹{totals.discount.toFixed(0)}</dd>
          </div>
        )}
        <div className="flex justify-between">
          <dt className="text-ink-soft">Delivery fee</dt>
          <dd className="font-mono text-ink">
            {totals.deliveryFee === 0 ? "Free" : `₹${totals.deliveryFee.toFixed(0)}`}
          </dd>
        </div>
        <div className="flex justify-between border-t border-line pt-2 text-base font-medium">
          <dt className="text-ink">Total</dt>
          <dd className="font-mono text-ink">₹{totals.total.toFixed(0)}</dd>
        </div>
      </dl>

      {deliveryNote && <p className="mt-2 text-xs text-ink-soft">{deliveryNote}</p>}

      {hasIssues ? (
        <Button disabled className="mt-5 w-full" title="Resolve the issues above first">
          Proceed to checkout
        </Button>
      ) : itemCount === 0 ? (
        <Button disabled className="mt-5 w-full">
          Proceed to checkout
        </Button>
      ) : (
        <Link
          href={couponApplied && couponCode ? `/checkout?coupon=${encodeURIComponent(couponCode)}` : "/checkout"}
          className="mt-5 block"
        >
          <Button className="w-full">Proceed to checkout</Button>
        </Link>
      )}
    </div>
  );
}
