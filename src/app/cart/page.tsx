import { redirect } from "next/navigation";
import Link from "next/link";
import { getCurrentUser } from "@/features/auth/lib/session";
import { getCartItems, computeTotals, findCartIssues, previewCoupon } from "@/features/cart/lib/queries";
import { CartItemRow } from "@/features/cart/components/cart-item-row";
import { CartSummary } from "@/features/cart/components/cart-summary";
import { Button } from "@/components/ui/button";
import { db } from "@/lib/db";
import { resolveDelivery } from "@/features/delivery/lib/engine";

export default async function CartPage({
  searchParams,
}: {
  searchParams: Promise<{ coupon?: string }>;
}) {
  const user = await getCurrentUser();
  if (!user) redirect("/login");

  const { coupon } = await searchParams;

  const items = await getCartItems(user.id);
  const activeItems = items.filter((i) => !i.savedForLater);
  const savedItems = items.filter((i) => i.savedForLater);
  const issues = findCartIssues(items);

  let couponDiscountPercent = 0;
  let couponError: string | undefined;
  let couponApplied = false;

  if (coupon) {
    const result = await previewCoupon(coupon);
    if (result.valid) {
      couponDiscountPercent = result.discountPercent;
      couponApplied = true;
    } else {
      couponError = result.reason;
    }
  }

  // Best-effort delivery estimate using the default address, if any — the
  // authoritative quote (and the one that actually sets the order's fee)
  // is computed again in checkout once an address is explicitly chosen.
  let deliveryFee = 0;
  let deliveryNote: string | null = null;
  if (activeItems.length > 0) {
    const defaultAddress = await db.address.findFirst({
      where: { userId: user.id, isDefault: true },
    });
    if (defaultAddress) {
      const quote = await resolveDelivery(
        defaultAddress.pincode,
        activeItems.map((i) => i.productId)
      );
      if (quote.available) {
        deliveryFee = quote.fee;
        deliveryNote = `To your default address (${defaultAddress.pincode}): ${quote.zoneName}, ${quote.etaMinMinutes}–${quote.etaMaxMinutes} min.`;
      } else {
        deliveryNote = "Delivery isn't available to your default address for these items yet.";
      }
    } else {
      deliveryNote = "Add an address to see delivery fee and timing.";
    }
  }

  const totals = computeTotals(activeItems, couponDiscountPercent, deliveryFee);

  return (
    <div className="mx-auto max-w-4xl px-4 py-10 sm:px-6">
      <h1 className="font-display text-2xl font-semibold text-ink">Your cart</h1>

      {items.length === 0 ? (
        <div className="mt-8 rounded-xl border border-dashed border-line p-12 text-center">
          <p className="text-sm font-medium text-ink">Your cart is empty</p>
          <Link href="/products" className="mt-4 inline-block">
            <Button>Browse products</Button>
          </Link>
        </div>
      ) : (
        <div className="mt-6 grid gap-8 lg:grid-cols-[1fr_320px]">
          <div className="space-y-6">
            {issues.length > 0 && (
              <div className="rounded-xl border border-warn/40 bg-warn/10 p-4 text-sm text-warn">
                <p className="font-medium">Before you check out:</p>
                <ul className="mt-1 list-disc pl-5">
                  {issues.map((issue) => (
                    <li key={issue.cartItemId}>
                      {issue.productName}:{" "}
                      {issue.reason === "out_of_stock" && "out of stock"}
                      {issue.reason === "unavailable" && "no longer available"}
                      {issue.reason === "insufficient_stock" &&
                        `only ${issue.availableStock} left — reduce quantity`}
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {activeItems.length > 0 && (
              <div className="space-y-3">
                {activeItems.map((item) => (
                  <CartItemRow key={item.id} item={item} />
                ))}
              </div>
            )}

            {savedItems.length > 0 && (
              <div>
                <h2 className="text-sm font-medium text-ink-soft">
                  Saved for later ({savedItems.length})
                </h2>
                <div className="mt-3 space-y-3">
                  {savedItems.map((item) => (
                    <CartItemRow key={item.id} item={item} />
                  ))}
                </div>
              </div>
            )}
          </div>

          <div>
            <CartSummary
              totals={totals}
              couponCode={coupon}
              couponError={couponError}
              couponApplied={couponApplied}
              itemCount={activeItems.reduce((sum, i) => sum + i.quantity, 0)}
              hasIssues={issues.length > 0}
              deliveryNote={deliveryNote}
            />
          </div>
        </div>
      )}
    </div>
  );
}
