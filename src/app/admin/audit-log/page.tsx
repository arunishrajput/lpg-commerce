import { requireStaff } from "@/features/admin/lib/auth";
import { db } from "@/lib/db";

export default async function AdminAuditLogPage() {
  await requireStaff(["SUPER_ADMIN"]);

  const logs = await db.auditLog.findMany({
    orderBy: { createdAt: "desc" },
    take: 200,
    include: {
      actorUser: { select: { fullName: true, email: true } },
      staff: { select: { name: true, email: true } },
    },
  });

  return (
    <div>
      <h2 className="font-display text-xl font-semibold text-ink">Audit log</h2>
      <p className="mt-1 text-sm text-ink-soft">
        Last 200 recorded actions. Never includes passwords, payment
        secrets, OTPs, or identity numbers — see the audit log entries
        written throughout the codebase for what's captured.
      </p>

      <div className="mt-4 overflow-x-auto rounded-xl border border-line bg-surface">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-line text-left text-xs uppercase tracking-wide text-ink-soft">
              <th className="px-4 py-3">Time</th>
              <th className="px-4 py-3">Actor</th>
              <th className="px-4 py-3">Action</th>
              <th className="px-4 py-3">Resource</th>
              <th className="px-4 py-3">Result</th>
            </tr>
          </thead>
          <tbody>
            {logs.map((log) => (
              <tr key={log.id} className="border-b border-line last:border-0">
                <td className="px-4 py-3 whitespace-nowrap font-mono text-xs text-ink-soft">
                  {log.createdAt.toLocaleString()}
                </td>
                <td className="px-4 py-3 text-ink-soft">
                  {log.staff
                    ? `${log.staff.name} (staff)`
                    : log.actorUser
                      ? log.actorUser.fullName
                      : "System"}
                </td>
                <td className="px-4 py-3 font-mono text-xs text-ink">{log.action}</td>
                <td className="px-4 py-3 font-mono text-xs text-ink-soft">{log.resource}</td>
                <td className="px-4 py-3">
                  <span
                    className={`rounded-full px-2 py-0.5 text-xs font-medium ${
                      log.result === "success" ? "bg-safe/10 text-safe" : "bg-danger/10 text-danger"
                    }`}
                  >
                    {log.result}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {logs.length === 0 && (
          <p className="p-8 text-center text-sm text-ink-soft">No audit log entries yet.</p>
        )}
      </div>
    </div>
  );
}
