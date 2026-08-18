"use server";

import { revalidatePath } from "next/cache";
import { db } from "@/lib/db";
import { addressSchema } from "@/features/auth/lib/schemas";
import { requireUser } from "@/features/auth/lib/session";
import type { ActionState } from "./register";

export async function createAddressAction(
  _prev: ActionState,
  formData: FormData
): Promise<ActionState> {
  const user = await requireUser();

  const parsed = addressSchema.safeParse({
    label: String(formData.get("label") ?? ""),
    line1: String(formData.get("line1") ?? ""),
    line2: String(formData.get("line2") ?? ""),
    city: String(formData.get("city") ?? ""),
    state: String(formData.get("state") ?? ""),
    pincode: String(formData.get("pincode") ?? ""),
    isDefault: formData.get("isDefault") === "on",
  });

  if (!parsed.success) {
    const fieldErrors: Record<string, string> = {};
    for (const issue of parsed.error.issues) {
      fieldErrors[String(issue.path[0])] = issue.message;
    }
    return { fieldErrors };
  }

  if (parsed.data.isDefault) {
    await db.address.updateMany({
      where: { userId: user.id },
      data: { isDefault: false },
    });
  }

  await db.address.create({
    data: {
      userId: user.id,
      label: parsed.data.label || null,
      line1: parsed.data.line1,
      line2: parsed.data.line2 || null,
      city: parsed.data.city,
      state: parsed.data.state,
      pincode: parsed.data.pincode,
      isDefault: parsed.data.isDefault ?? false,
    },
  });

  revalidatePath("/account/addresses");
  return {};
}

export async function deleteAddressAction(addressId: string): Promise<void> {
  const user = await requireUser();
  await db.address.deleteMany({ where: { id: addressId, userId: user.id } });
  revalidatePath("/account/addresses");
}

export async function setDefaultAddressAction(addressId: string): Promise<void> {
  const user = await requireUser();
  await db.$transaction([
    db.address.updateMany({
      where: { userId: user.id },
      data: { isDefault: false },
    }),
    db.address.updateMany({
      where: { id: addressId, userId: user.id },
      data: { isDefault: true },
    }),
  ]);
  revalidatePath("/account/addresses");
}
