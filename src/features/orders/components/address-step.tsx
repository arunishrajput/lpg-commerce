import Link from "next/link";
import type { Address } from "@prisma/client";
import { Button } from "@/components/ui/button";

export function AddressStep({
  addresses,
  carryParams,
}: {
  addresses: Address[];
  carryParams: string;
}) {
  if (addresses.length === 0) {
    return (
      <div className="rounded-xl border border-dashed border-line p-8 text-center">
        <p className="text-sm font-medium text-ink">No saved addresses yet</p>
        <p className="mt-1 text-sm text-ink-soft">
          Add a delivery address to continue.
        </p>
        <Link href="/account/addresses" className="mt-4 inline-block">
          <Button>Add an address</Button>
        </Link>
      </div>
    );
  }

  return (
    <form action="/checkout" method="get" className="space-y-4">
      <input type="hidden" name="step" value="delivery" />
      {carryParams
        .split("&")
        .filter(Boolean)
        .map((pair) => {
          const [key, value] = pair.split("=");
          return <input key={key} type="hidden" name={key} value={decodeURIComponent(value ?? "")} />;
        })}

      <div className="space-y-3">
        {addresses.map((address) => (
          <label
            key={address.id}
            className="flex cursor-pointer items-start gap-3 rounded-xl border border-line bg-surface p-4 has-[:checked]:border-brand"
          >
            <input
              type="radio"
              name="addressId"
              value={address.id}
              defaultChecked={address.isDefault}
              required
              className="mt-1"
            />
            <div>
              <p className="text-sm font-medium text-ink">
                {address.label || "Address"}
                {address.isDefault && (
                  <span className="ml-2 rounded-full bg-brand/10 px-2 py-0.5 text-xs text-brand">
                    Default
                  </span>
                )}
              </p>
              <p className="mt-0.5 text-sm text-ink-soft">
                {address.line1}
                {address.line2 ? `, ${address.line2}` : ""}, {address.city}, {address.state}{" "}
                {address.pincode}
              </p>
            </div>
          </label>
        ))}
      </div>

      <div className="flex items-center justify-between pt-2">
        <Link href="/account/addresses" className="text-sm text-brand hover:underline">
          + Add a new address
        </Link>
        <Button type="submit">Continue to delivery</Button>
      </div>
    </form>
  );
}
