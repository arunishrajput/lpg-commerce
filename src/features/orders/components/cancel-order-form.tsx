"use client";

import { useActionState } from "react";
import { cancelOrderAction, type CancelOrderState } from "@/features/orders/actions/cancel";
import { Button } from "@/components/ui/button";

const initialState: CancelOrderState = {};

export function CancelOrderForm({ orderId }: { orderId: string }) {
  const boundAction = cancelOrderAction.bind(null, orderId);
  const [state, formAction, pending] = useActionState(boundAction, initialState);

  return (
    <form action={formAction} className="space-y-3">
      <label htmlFor="reason" className="block text-sm font-medium text-ink">
        Reason (optional)
      </label>
      <select
        id="reason"
        name="reason"
        className="w-full rounded-lg border border-line bg-surface px-3 py-2 text-sm text-ink"
      >
        <option value="Changed my mind">Changed my mind</option>
        <option value="Found a better price">Found a better price</option>
        <option value="Ordered by mistake">Ordered by mistake</option>
        <option value="Delivery taking too long">Delivery taking too long</option>
        <option value="Other">Other</option>
      </select>

      {state.error && (
        <p className="text-sm text-danger" role="alert">
          {state.error}
        </p>
      )}

      <Button type="submit" variant="danger" disabled={pending} className="w-full">
        {pending ? "Cancelling…" : "Cancel this order"}
      </Button>
    </form>
  );
}
