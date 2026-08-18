import { requireStaff } from "@/features/admin/lib/auth";
import { db } from "@/lib/db";
import { AdjustInventoryForm } from "./adjust-inventory-form";

export default async function AdminInventoryPage() {
  await requireStaff(["SUPER_ADMIN", "STORE_MANAGER", "INVENTORY_MANAGER"]);

  const inventory = await db.inventory.findMany({
    include: { product: { select: { name: true, sku: true } }, store: { select: { name: true } } },
    orderBy: { product: { name: "asc" } },
  });

  return (
    <div>
      <h2 className="font-display text-xl font-semibold text-ink">Inventory</h2>
      <p className="mt-1 text-sm text-ink-soft">
        Stock on hand, reserved (held by pending orders), and available.
        Adjustments require a reason and are recorded in the audit log.
      </p>

      <div className="mt-4 overflow-x-auto rounded-xl border border-line bg-surface">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-line text-left text-xs uppercase tracking-wide text-ink-soft">
              <th className="px-4 py-3">Product</th>
              <th className="px-4 py-3">Store</th>
              <th className="px-4 py-3">On hand</th>
              <th className="px-4 py-3">Reserved</th>
              <th className="px-4 py-3">Available</th>
              <th className="px-4 py-3">Adjust</th>
            </tr>
          </thead>
          <tbody>
            {inventory.map((inv) => {
              const available = inv.stockOnHand - inv.stockReserved;
              const low = available <= inv.lowStockAt;
              return (
                <tr key={inv.id} className="border-b border-line last:border-0 align-top">
                  <td className="px-4 py-3 text-ink">
                    {inv.product.name}
                    <div className="font-mono text-xs text-ink-soft">{inv.product.sku}</div>
                  </td>
                  <td className="px-4 py-3 text-ink-soft">{inv.store.name}</td>
                  <td className="px-4 py-3 font-mono text-ink">{inv.stockOnHand}</td>
                  <td className="px-4 py-3 font-mono text-ink-soft">{inv.stockReserved}</td>
                  <td className="px-4 py-3">
                    <span
                      className={`font-mono ${low ? "font-medium text-warn" : "text-ink"}`}
                    >
                      {available}
                    </span>
                    {low && <span className="ml-1 text-xs text-warn">low</span>}
                  </td>
                  <td className="px-4 py-3">
                    <AdjustInventoryForm inventoryId={inv.id} />
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
        {inventory.length === 0 && (
          <p className="p-8 text-center text-sm text-ink-soft">No inventory records yet.</p>
        )}
      </div>
    </div>
  );
}
