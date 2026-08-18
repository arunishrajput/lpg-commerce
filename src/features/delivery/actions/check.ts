"use server";

import { resolveDelivery } from "@/features/delivery/lib/engine";

export async function checkDeliveryForPincode(pincode: string, productIds: string[] = []) {
  return resolveDelivery(pincode, productIds);
}
