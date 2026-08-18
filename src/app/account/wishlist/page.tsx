import { redirect } from "next/navigation";
import Link from "next/link";
import { getCurrentUser } from "@/features/auth/lib/session";
import { db } from "@/lib/db";
import { WishlistRow } from "./wishlist-row";
import { Button } from "@/components/ui/button";

export default async function WishlistPage() {
  const user = await getCurrentUser();
  if (!user) redirect("/login");

  const items = await db.wishlistItem.findMany({
    where: { userId: user.id },
    include: {
      product: {
        include: {
          images: { orderBy: { sortOrder: "asc" }, take: 1 },
          inventory: { select: { stockOnHand: true, stockReserved: true } },
        },
      },
    },
    orderBy: { createdAt: "desc" },
  });

  return (
    <div className="mx-auto max-w-3xl px-4 py-10 sm:px-6">
      <h1 className="font-display text-2xl font-semibold text-ink">Wishlist</h1>

      {items.length === 0 ? (
        <div className="mt-8 rounded-xl border border-dashed border-line p-12 text-center">
          <p className="text-sm font-medium text-ink">Nothing saved yet</p>
          <Link href="/products" className="mt-4 inline-block">
            <Button>Browse products</Button>
          </Link>
        </div>
      ) : (
        <div className="mt-6 space-y-3">
          {items.map((item) => {
            const availableStock = item.product.inventory.reduce(
              (sum, inv) => sum + Math.max(0, inv.stockOnHand - inv.stockReserved),
              0
            );
            return (
              <WishlistRow
                key={item.id}
                productId={item.productId}
                slug={item.product.slug}
                name={item.product.name}
                brand={item.product.brand}
                imageUrl={item.product.images[0]?.url ?? null}
                price={Number(item.product.price)}
                discountPercent={item.product.discountPercent}
                availableStock={availableStock}
              />
            );
          })}
        </div>
      )}
    </div>
  );
}
