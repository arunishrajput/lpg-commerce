import { requireStaff } from "@/features/admin/lib/auth";
import { getForecastForAllProducts } from "@/features/admin/lib/forecasting";

export default async function AdminForecastingPage() {
  await requireStaff(["SUPER_ADMIN", "STORE_MANAGER", "INVENTORY_MANAGER"]);

  const forecasts = await getForecastForAllProducts();

  return (
    <div>
      <h2 className="font-display text-xl font-semibold text-ink">Demand forecasting</h2>
      <p className="mt-1 text-sm text-ink-soft">
        Based on confirmed sales (payment-verified orders) over the last 90
        days. Predicted demand is a 4-week moving average — a simple,
        swappable default (see <code className="font-mono text-xs">MovingAverageModel</code>{" "}
        in <code className="font-mono text-xs">features/admin/lib/forecasting.ts</code>).
      </p>

      <div className="mt-4 overflow-x-auto rounded-xl border border-line bg-surface">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-line text-left text-xs uppercase tracking-wide text-ink-soft">
              <th className="px-4 py-3">Product</th>
              <th className="px-4 py-3">Last 7 days</th>
              <th className="px-4 py-3">Last 30 days</th>
              <th className="px-4 py-3">Predicted next week</th>
            </tr>
          </thead>
          <tbody>
            {forecasts.map((f) => (
              <tr key={f.productId} className="border-b border-line last:border-0">
                <td className="px-4 py-3 text-ink">
                  {f.productName}
                  <div className="font-mono text-xs text-ink-soft">{f.sku}</div>
                </td>
                <td className="px-4 py-3 font-mono text-ink">{f.last7Days}</td>
                <td className="px-4 py-3 font-mono text-ink">{f.last30Days}</td>
                <td className="px-4 py-3 font-mono font-medium text-brand">
                  {f.predictedNextWeek} units
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {forecasts.length === 0 && (
          <p className="p-8 text-center text-sm text-ink-soft">No active products.</p>
        )}
      </div>
    </div>
  );
}
