"use server";

import { revalidatePath } from "next/cache";
import { db } from "@/lib/db";
import { requireStaff } from "@/features/admin/lib/auth";

export interface InventoryAdjustState {
  error?: string;
}

export async function adjustInventoryAction(
  inventoryId: string,
  _prev: InventoryAdjustState,
  formData: FormData
): Promise<InventoryAdjustState> {
  const { staff } = await requireStaff(["SUPER_ADMIN", "STORE_MANAGER", "INVENTORY_MANAGER"]);

  const delta = Number(formData.get("delta") ?? 0);
  const reason = String(formData.get("reason") ?? "").trim();

  if (!Number.isFinite(delta) || delta === 0) {
    return { error: "Enter a non-zero amount." };
  }
  if (!reason) {
    return { error: "A reason is required for stock adjustments." };
  }

  const inventory = await db.inventory.findUnique({ where: { id: inventoryId } });
  if (!inventory) {
    return { error: "Inventory record not found." };
  }
  if (inventory.stockOnHand + delta < 0) {
    return { error: "That would take stock on hand below zero." };
  }

  await db.$transaction([
    db.inventory.update({
      where: { id: inventoryId },
      data: { stockOnHand: { increment: delta } },
    }),
    db.inventoryTransaction.create({
      data: { inventoryId, change: delta, reason },
    }),
    db.auditLog.create({
      data: {
        staffId: staff.id,
        action: delta > 0 ? "inventory.added" : "inventory.removed",
        resource: `inventory:${inventoryId}`,
        result: "success",
      },
    }),
  ]);

  revalidatePath("/admin/inventory");
  return {};
}

export async function setLowStockThresholdAction(inventoryId: string, threshold: number): Promise<void> {
  await requireStaff(["SUPER_ADMIN", "STORE_MANAGER", "INVENTORY_MANAGER"]);
  if (!Number.isFinite(threshold) || threshold < 0) return;
  await db.inventory.update({ where: { id: inventoryId }, data: { lowStockAt: threshold } });
  revalidatePath("/admin/inventory");
}
