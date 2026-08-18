import Link from "next/link";
import type { StaffRole } from "@prisma/client";

const NAV_ITEMS: { href: string; label: string; roles?: StaffRole[] }[] = [
  { href: "/admin", label: "Dashboard" },
  { href: "/admin/products", label: "Products", roles: ["SUPER_ADMIN", "STORE_MANAGER"] },
  {
    href: "/admin/inventory",
    label: "Inventory",
    roles: ["SUPER_ADMIN", "STORE_MANAGER", "INVENTORY_MANAGER"],
  },
  {
    href: "/admin/forecasting",
    label: "Forecasting",
    roles: ["SUPER_ADMIN", "STORE_MANAGER", "INVENTORY_MANAGER"],
  },
  { href: "/admin/risk", label: "Risk review", roles: ["SUPER_ADMIN", "STORE_MANAGER"] },
  { href: "/admin/audit-log", label: "Audit log", roles: ["SUPER_ADMIN"] },
];

export function AdminNav({ role }: { role: StaffRole }) {
  const visible = NAV_ITEMS.filter((item) => !item.roles || item.roles.includes(role));

  return (
    <nav className="space-y-1">
      {visible.map((item) => (
        <Link
          key={item.href}
          href={item.href}
          className="block rounded-lg px-3 py-2 text-sm text-ink-soft hover:bg-paper hover:text-ink"
        >
          {item.label}
        </Link>
      ))}
    </nav>
  );
}
