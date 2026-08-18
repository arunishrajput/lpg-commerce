import Link from "next/link";
import { requireStaff } from "@/features/admin/lib/auth";
import { db } from "@/lib/db";
import { orderDisplayId, ORDER_STATUS_LABELS } from "@/features/orders/lib/order-display";

export default async function AdminRiskPage() {
  await requireStaff(["SUPER_ADMIN", "STORE_MANAGER"]);

  const flagged = await db.order.findMany({
    where: { riskScore: { in: ["medium", "high"] } },
    orderBy: { createdAt: "desc" },
    take: 100,
    include: { user: { select: { fullName: true, email: true } } },
  });

  return (
    <div>
      <h2 className="font-display text-xl font-semibold text-ink">Orders flagged for review</h2>
      <p className="mt-1 text-sm text-ink-soft">
        Scored from operational signals only — repeated failed payments, an
        unusually high cancellation rate, order bursts, or repeated refunds
        in the last 30 days. This is a review flag, not an automatic block;
        every flagged order still went through normally.
      </p>

      <div className="mt-4 overflow-x-auto rounded-xl border border-line bg-surface">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-line text-left text-xs uppercase tracking-wide text-ink-soft">
              <th className="px-4 py-3">Order</th>
              <th className="px-4 py-3">Customer</th>
              <th className="px-4 py-3">Status</th>
              <th className="px-4 py-3">Risk</th>
              <th className="px-4 py-3">Placed</th>
            </tr>
          </thead>
          <tbody>
            {flagged.map((order) => (
              <tr key={order.id} className="border-b border-line last:border-0">
                <td className="px-4 py-3">
                  <Link href={`/orders/${order.id}`} className="font-mono text-brand hover:underline">
                    {orderDisplayId(order.id)}
                  </Link>
                </td>
                <td className="px-4 py-3 text-ink-soft">
                  {order.user.fullName}
                  <div className="text-xs">{order.user.email}</div>
                </td>
                <td className="px-4 py-3 text-ink-soft">
                  {ORDER_STATUS_LABELS[order.status] ?? order.status}
                </td>
                <td className="px-4 py-3">
                  <span
                    className={`rounded-full px-2 py-0.5 text-xs font-medium ${
                      order.riskScore === "high" ? "bg-danger/10 text-danger" : "bg-warn/10 text-warn"
                    }`}
                  >
                    {order.riskScore}
                  </span>
                </td>
                <td className="px-4 py-3 text-ink-soft">{order.createdAt.toLocaleDateString()}</td>
              </tr>
            ))}
          </tbody>
        </table>
        {flagged.length === 0 && (
          <p className="p-8 text-center text-sm text-ink-soft">Nothing flagged right now.</p>
        )}
      </div>
    </div>
  );
}
