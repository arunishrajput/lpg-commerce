"use server";

import { db } from "@/lib/db";
import { getCurrentUser } from "@/features/auth/lib/session";

export async function recordProductView(productId: string): Promise<void> {
  const user = await getCurrentUser();
  if (!user) return; // Browsing history is only tracked for signed-in users.

  await db.productView.create({ data: { userId: user.id, productId } });
}
