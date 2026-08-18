import Image from "next/image";
import type { Address } from "@prisma/client";
import type { CartLineItem, CartTotals } from "@/features/cart/lib/queries";
import { PlaceOrderForm } from "./place-order-form";

export function ReviewStep({
  items,
  totals,
  address,
  hasIssues,
  couponCode,
}: {
  items: CartLineItem[];
  totals: CartTotals;
  address: Address;
  hasIssues: boolean;
  couponCode?: string;
}) {
  return (
    <div className="space-y-6">
      <div className="rounded-xl border border-line bg-surface p-4">
        <p className="text-sm font-medium text-ink">Delivering to</p>
        <p className="mt-1 text-sm text-ink-soft">
          {address.label ? `${address.label} — ` : ""}
          {address.line1}
          {address.line2 ? `, ${address.line2}` : ""}, {address.city}, {address.state}{" "}
          {address.pincode}
        </p>
      </div>

      <div className="space-y-3">
        {items.map((item) => {
          const unitPrice = item.unitPrice * (1 - item.discountPercent / 100);
          return (
            <div key={item.id} className="flex items-center gap-3 rounded-xl border border-line bg-surface p-3">
              <div className="relative h-14 w-14 shrink-0 overflow-hidden rounded-lg bg-paper">
                {item.imageUrl && (
                  <Image src={item.imageUrl} alt={item.name} fill sizes="56px" className="object-cover" />
                )}
              </div>
              <div className="flex-1">
                <p className="text-sm text-ink">{item.name}</p>
                <p className="text-xs text-ink-soft">Qty {item.quantity}</p>
              </div>
              <p className="font-mono text-sm text-ink">₹{(unitPrice * item.quantity).toFixed(0)}</p>
            </div>
          );
        })}
      </div>

      <dl className="space-y-2 rounded-xl border border-line bg-surface p-4 text-sm">
        <div className="flex justify-between">
          <dt className="text-ink-soft">Subtotal</dt>
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

      {hasIssues && (
        <p className="rounded-lg bg-danger/10 px-3 py-2 text-sm text-danger">
          Some items in your cart need attention before you can order. Go back to your cart to fix them.
        </p>
      )}

      <PlaceOrderForm addressId={address.id} couponCode={couponCode} disabled={hasIssues} />
    </div>
  );
}
