import { redirect } from "next/navigation";
import { getCurrentUser } from "@/features/auth/lib/session";
import { db } from "@/lib/db";
import {
  getCartItems,
  computeTotals,
  findCartIssues,
  previewCoupon,
} from "@/features/cart/lib/queries";
import { resolveDelivery } from "@/features/delivery/lib/engine";
import { CheckoutSteps, type CheckoutStep } from "@/features/orders/components/checkout-steps";
import { AddressStep } from "@/features/orders/components/address-step";
import { DeliveryStep } from "@/features/orders/components/delivery-step";
import { ReviewStep } from "@/features/orders/components/review-step";

type RawSearchParams = Record<string, string | string[] | undefined>;

function firstValue(value: string | string[] | undefined): string | undefined {
  return Array.isArray(value) ? value[0] : value;
}

export default async function CheckoutPage({
  searchParams,
}: {
  searchParams: Promise<RawSearchParams>;
}) {
  const user = await getCurrentUser();
  if (!user) redirect("/login?next=/checkout");

  const raw = await searchParams;
  const step = (firstValue(raw.step) as CheckoutStep) || "address";
  const addressId = firstValue(raw.addressId);
  const coupon = firstValue(raw.coupon);

  const items = await getCartItems(user.id);
  const activeItems = items.filter((i) => !i.savedForLater);

  if (activeItems.length === 0) {
    redirect("/cart");
  }

  const issues = findCartIssues(items);

  let couponDiscountPercent = 0;
  let couponApplied = false;
  if (coupon) {
    const result = await previewCoupon(coupon);
    if (result.valid) {
      couponDiscountPercent = result.discountPercent;
      couponApplied = true;
    }
  }

  const couponParam = coupon ? `coupon=${encodeURIComponent(coupon)}` : "";
  const productIds = activeItems.map((i) => i.productId);

  return (
    <div className="mx-auto max-w-2xl px-4 py-10 sm:px-6">
      <h1 className="font-display text-2xl font-semibold text-ink">Checkout</h1>
      <div className="mt-4">
        <CheckoutSteps current={step} />
      </div>

      <div className="mt-8">
        {step === "address" && (
          <AddressStepLoader userId={user.id} carryParams={couponParam} />
        )}

        {step === "delivery" && (
          <DeliveryStepLoader
            userId={user.id}
            addressId={addressId}
            productIds={productIds}
            carryParams={couponParam}
          />
        )}

        {step === "review" && (
          <ReviewStepLoader
            userId={user.id}
            addressId={addressId}
            items={activeItems}
            productIds={productIds}
            couponDiscountPercent={couponDiscountPercent}
            couponCode={couponApplied ? coupon : undefined}
            issuesCount={issues.length}
          />
        )}
      </div>
    </div>
  );
}

async function AddressStepLoader({
  userId,
  carryParams,
}: {
  userId: string;
  carryParams: string;
}) {
  const addresses = await db.address.findMany({
    where: { userId },
    orderBy: [{ isDefault: "desc" }, { createdAt: "desc" }],
  });
  return <AddressStep addresses={addresses} carryParams={carryParams} />;
}

async function DeliveryStepLoader({
  userId,
  addressId,
  productIds,
  carryParams,
}: {
  userId: string;
  addressId: string | undefined;
  productIds: string[];
  carryParams: string;
}) {
  if (!addressId) redirect("/checkout?step=address");

  const address = await db.address.findFirst({ where: { id: addressId, userId } });
  if (!address) redirect("/checkout?step=address");

  const quote = await resolveDelivery(address.pincode, productIds);

  return (
    <DeliveryStep
      quote={quote}
      carryParams={[`addressId=${addressId}`, carryParams].filter(Boolean).join("&")}
    />
  );
}

async function ReviewStepLoader({
  userId,
  addressId,
  items,
  productIds,
  couponDiscountPercent,
  couponCode,
  issuesCount,
}: {
  userId: string;
  addressId: string | undefined;
  items: Awaited<ReturnType<typeof getCartItems>>;
  productIds: string[];
  couponDiscountPercent: number;
  couponCode?: string;
  issuesCount: number;
}) {
  if (!addressId) redirect("/checkout?step=address");

  const address = await db.address.findFirst({ where: { id: addressId, userId } });
  if (!address) redirect("/checkout?step=address");

  const quote = await resolveDelivery(address.pincode, productIds);
  if (!quote.available) {
    redirect(`/checkout?step=delivery&addressId=${addressId}`);
  }

  const totals = computeTotals(items, couponDiscountPercent, quote.fee);

  return (
    <ReviewStep
      items={items}
      totals={totals}
      address={address}
      hasIssues={issuesCount > 0}
      couponCode={couponCode}
    />
  );
}
