import Link from "next/link";
import { requireStaff } from "@/features/admin/lib/auth";
import { db } from "@/lib/db";
import { Button } from "@/components/ui/button";
import { ToggleActiveButton } from "./toggle-active-button";

export default async function AdminProductsPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string }>;
}) {
  await requireStaff(["SUPER_ADMIN", "STORE_MANAGER"]);
  const { q } = await searchParams;

  const products = await db.product.findMany({
    where: q
      ? {
          OR: [
            { name: { contains: q, mode: "insensitive" } },
            { sku: { contains: q, mode: "insensitive" } },
          ],
        }
      : undefined,
    include: { category: true },
    orderBy: { createdAt: "desc" },
    take: 100,
  });

  return (
    <div>
      <div className="flex items-center justify-between">
        <h2 className="font-display text-xl font-semibold text-ink">Products</h2>
        <Link href="/admin/products/new">
          <Button>Add product</Button>
        </Link>
      </div>

      <form action="/admin/products" method="get" className="mt-4">
        <input
          type="text"
          name="q"
          defaultValue={q}
          placeholder="Search by name or SKU…"
          className="w-full max-w-sm rounded-lg border border-line bg-surface px-3.5 py-2 text-sm text-ink placeholder:text-ink-soft/60 focus:border-brand focus:outline-none"
        />
      </form>

      <div className="mt-4 overflow-x-auto rounded-xl border border-line bg-surface">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-line text-left text-xs uppercase tracking-wide text-ink-soft">
              <th className="px-4 py-3">Product</th>
              <th className="px-4 py-3">SKU</th>
              <th className="px-4 py-3">Category</th>
              <th className="px-4 py-3">Price</th>
              <th className="px-4 py-3">Status</th>
              <th className="px-4 py-3"></th>
            </tr>
          </thead>
          <tbody>
            {products.map((p) => (
              <tr key={p.id} className="border-b border-line last:border-0">
                <td className="px-4 py-3 text-ink">{p.name}</td>
                <td className="px-4 py-3 font-mono text-xs text-ink-soft">{p.sku}</td>
                <td className="px-4 py-3 text-ink-soft">{p.category.name}</td>
                <td className="px-4 py-3 font-mono text-ink">₹{Number(p.price).toFixed(0)}</td>
                <td className="px-4 py-3">
                  <span
                    className={`rounded-full px-2 py-0.5 text-xs font-medium ${
                      p.isActive ? "bg-safe/10 text-safe" : "bg-line text-ink-soft"
                    }`}
                  >
                    {p.isActive ? "Active" : "Inactive"}
                  </span>
                </td>
                <td className="px-4 py-3 text-right">
                  <div className="flex justify-end gap-2">
                    <Link href={`/admin/products/${p.id}/edit`} className="text-brand hover:underline">
                      Edit
                    </Link>
                    <ToggleActiveButton productId={p.id} isActive={p.isActive} />
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {products.length === 0 && (
          <p className="p-8 text-center text-sm text-ink-soft">No products found.</p>
        )}
      </div>
    </div>
  );
}
