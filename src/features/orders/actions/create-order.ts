"use server";

import { redirect } from "next/navigation";
import { requireUser } from "@/features/auth/lib/session";
import { createOrderFromCart, OrderCreationError } from "@/features/orders/lib/create-order";

export interface PlaceOrderState {
  error?: string;
}

export async function placeOrderAction(
  _prev: PlaceOrderState,
  formData: FormData
): Promise<PlaceOrderState> {
  const user = await requireUser();
  const addressId = String(formData.get("addressId") ?? "");
  const couponCode = String(formData.get("coupon") ?? "") || undefined;

  if (!addressId) {
    return { error: "Choose a delivery address first." };
  }

  let orderId: string;
  try {
    const order = await createOrderFromCart({ userId: user.id, addressId, couponCode });
    orderId = order.id;
  } catch (err) {
    if (err instanceof OrderCreationError) {
      return { error: err.message };
    }
    return { error: "Something went wrong placing your order. Please try again." };
  }

  redirect(`/checkout/payment/${orderId}`);
}
