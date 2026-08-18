"use server";

import { revalidatePath } from "next/cache";
import { db } from "@/lib/db";
import { requireUser } from "@/features/auth/lib/session";

export async function toggleWishlistAction(productId: string): Promise<{ wishlisted: boolean }> {
  const user = await requireUser();

  const existing = await db.wishlistItem.findUnique({
    where: { userId_productId: { userId: user.id, productId } },
  });

  if (existing) {
    await db.wishlistItem.delete({ where: { id: existing.id } });
    revalidatePath("/account/wishlist");
    return { wishlisted: false };
  }

  await db.wishlistItem.create({ data: { userId: user.id, productId } });
  revalidatePath("/account/wishlist");
  return { wishlisted: true };
}

export async function removeFromWishlistAction(productId: string): Promise<void> {
  const user = await requireUser();
  await db.wishlistItem.deleteMany({ where: { userId: user.id, productId } });
  revalidatePath("/account/wishlist");
}

export async function isWishlisted(userId: string, productId: string): Promise<boolean> {
  const existing = await db.wishlistItem.findUnique({
    where: { userId_productId: { userId, productId } },
  });
  return !!existing;
}
