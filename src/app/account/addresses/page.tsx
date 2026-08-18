import { redirect } from "next/navigation";
import { getCurrentUser } from "@/features/auth/lib/session";
import { db } from "@/lib/db";
import { AddressForm } from "./address-form";
import { AddressRow } from "./address-row";
import type { Address } from "@prisma/client";

export default async function AddressesPage() {
  const user = await getCurrentUser();
  if (!user) redirect("/login");

  const addresses = await db.address.findMany({
    where: { userId: user.id },
    orderBy: [{ isDefault: "desc" }, { createdAt: "desc" }],
  });

  return (
    <div className="mx-auto max-w-2xl px-4 py-12 sm:px-6">
      <h1 className="font-display text-2xl font-semibold text-ink">My addresses</h1>
      <p className="mt-1 text-sm text-ink-soft">
        Used to check delivery availability and estimate delivery time.
      </p>

      <div className="mt-6 space-y-3">
        {addresses.length === 0 ? (
          <p className="rounded-xl border border-dashed border-line p-6 text-center text-sm text-ink-soft">
            No addresses saved yet.
          </p>
        ) : (
          addresses.map((address: Address) => <AddressRow key={address.id} {...address} />)
        )}
      </div>

      <div className="mt-8">
        <AddressForm />
      </div>
    </div>
  );
}
