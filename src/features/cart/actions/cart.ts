"use server";

import { revalidatePath } from "next/cache";
import { db } from "@/lib/db";
import { requireUser } from "@/features/auth/lib/session";
import { getOrCreateCart } from "@/features/cart/lib/queries";

export async function addToCartAction(productId: string, quantity: number = 1): Promise<void> {
  const user = await requireUser();
  const cart = await getOrCreateCart(user.id);

  const product = await db.product.findUnique({ where: { id: productId } });
  if (!product || !product.isActive) {
    throw new Error("This product is no longer available.");
  }

  await db.cartItem.upsert({
    where: { cartId_productId: { cartId: cart.id, productId } },
    update: { quantity: { increment: quantity }, savedForLater: false },
    create: { cartId: cart.id, productId, quantity, savedForLater: false },
  });

  revalidatePath("/cart");
  revalidatePath(`/products/${product.slug}`);
}

export async function updateCartItemQuantityAction(
  cartItemId: string,
  quantity: number
): Promise<void> {
  const user = await requireUser();
  if (quantity < 1) {
    throw new Error("Quantity must be at least 1.");
  }

  await db.cartItem.updateMany({
    where: { id: cartItemId, cart: { userId: user.id } },
    data: { quantity },
  });

  revalidatePath("/cart");
}

export async function removeCartItemAction(cartItemId: string): Promise<void> {
  const user = await requireUser();
  await db.cartItem.deleteMany({
    where: { id: cartItemId, cart: { userId: user.id } },
  });
  revalidatePath("/cart");
}

export async function setSavedForLaterAction(
  cartItemId: string,
  savedForLater: boolean
): Promise<void> {
  const user = await requireUser();
  await db.cartItem.updateMany({
    where: { id: cartItemId, cart: { userId: user.id } },
    data: { savedForLater },
  });
  revalidatePath("/cart");
}
