"use server";

import { revalidatePath } from "next/cache";
import { db } from "@/lib/db";
import { requireStaff } from "@/features/admin/lib/auth";

export async function addCompatibilityAction(
  productId: string,
  compatibleId: string,
  note: string
): Promise<void> {
  const { staff } = await requireStaff(["SUPER_ADMIN", "STORE_MANAGER"]);
  if (productId === compatibleId) return;

  await db.productCompatibility.upsert({
    where: { productId_compatibleId: { productId, compatibleId } },
    update: { isCompatible: true, note: note || null },
    create: { productId, compatibleId, isCompatible: true, note: note || null },
  });

  await db.auditLog.create({
    data: {
      staffId: staff.id,
      action: "product.compatibility_added",
      resource: `product:${productId}`,
      result: "success",
    },
  });

  revalidatePath(`/admin/products/${productId}/edit`);
}

export async function removeCompatibilityAction(
  productId: string,
  compatibleId: string
): Promise<void> {
  const { staff } = await requireStaff(["SUPER_ADMIN", "STORE_MANAGER"]);

  await db.productCompatibility.deleteMany({
    where: { productId, compatibleId },
  });

  await db.auditLog.create({
    data: {
      staffId: staff.id,
      action: "product.compatibility_removed",
      resource: `product:${productId}`,
      result: "success",
    },
  });

  revalidatePath(`/admin/products/${productId}/edit`);
}

export async function searchProductsForAdmin(query: string, excludeId: string) {
  await requireStaff(["SUPER_ADMIN", "STORE_MANAGER"]);
  if (query.trim().length < 2) return [];

  return db.product.findMany({
    where: { id: { not: excludeId }, name: { contains: query.trim(), mode: "insensitive" } },
    select: { id: true, name: true, sku: true },
    take: 8,
  });
}
