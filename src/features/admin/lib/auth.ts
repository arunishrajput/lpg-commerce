import "server-only";
import { redirect } from "next/navigation";
import { db } from "@/lib/db";
import { getCurrentUser } from "@/features/auth/lib/session";
import type { StaffRole } from "@prisma/client";

/**
 * Admin access is granted to any signed-in user whose account email
 * matches a seeded Staff record — there's no separate staff login system
 * in this demo. A real deployment would want stronger auth for staff
 * (SSO, MFA, a separate credential store) rather than reusing customer
 * sessions; this is documented as a simplification, not hidden.
 */
export async function requireStaff(allowedRoles?: StaffRole[]) {
  const user = await getCurrentUser();
  if (!user) {
    redirect("/login?next=/admin");
  }

  const staff = await db.staff.findUnique({ where: { email: user.email } });
  if (!staff) {
    redirect("/");
  }

  if (allowedRoles && !allowedRoles.includes(staff.role)) {
    redirect("/admin?denied=1");
  }

  return { user, staff };
}

export async function getStaffContext() {
  const user = await getCurrentUser();
  if (!user) return null;
  const staff = await db.staff.findUnique({ where: { email: user.email } });
  if (!staff) return null;
  return { user, staff };
}
