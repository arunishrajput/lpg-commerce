"use client";

import { useActionState } from "react";
import { placeOrderAction, type PlaceOrderState } from "@/features/orders/actions/create-order";
import { Button } from "@/components/ui/button";

const initialState: PlaceOrderState = {};

export function PlaceOrderForm({
  addressId,
  couponCode,
  disabled,
}: {
  addressId: string;
  couponCode?: string;
  disabled: boolean;
}) {
  const [state, formAction, pending] = useActionState(placeOrderAction, initialState);

  return (
    <form action={formAction}>
      <input type="hidden" name="addressId" value={addressId} />
      {couponCode && <input type="hidden" name="coupon" value={couponCode} />}

      {state.error && (
        <p className="mb-3 rounded-lg bg-danger/10 px-3 py-2 text-sm text-danger" role="alert">
          {state.error}
        </p>
      )}

      <Button type="submit" disabled={disabled || pending} className="w-full">
        {pending ? "Placing order…" : "Place order"}
      </Button>
      <p className="mt-2 text-center text-xs text-ink-soft">
        Mock payment — no real card or bank details are collected in this demo.
      </p>
    </form>
  );
}
