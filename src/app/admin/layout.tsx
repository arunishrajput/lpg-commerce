import Link from "next/link";
import { requireStaff } from "@/features/admin/lib/auth";
import { AdminNav } from "@/features/admin/components/admin-nav";

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const { staff } = await requireStaff();

  return (
    <div className="mx-auto max-w-6xl px-4 py-8 sm:px-6">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-xs uppercase tracking-wide text-ink-soft">Admin</p>
          <h1 className="font-display text-xl font-semibold text-ink">
            {staff.name} · {staff.role.replace(/_/g, " ").toLowerCase()}
          </h1>
        </div>
        <Link href="/" className="text-sm text-brand hover:underline">
          ← Back to store
        </Link>
      </div>

      <div className="mt-6 grid gap-6 sm:grid-cols-[180px_1fr]">
        <AdminNav role={staff.role} />
        <div>{children}</div>
      </div>
    </div>
  );
}
