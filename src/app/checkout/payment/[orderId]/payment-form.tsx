"use client";

import { useTransition } from "react";
import { processPaymentAction } from "@/features/orders/actions/payment";
import { Button } from "@/components/ui/button";

export function PaymentForm({ orderId }: { orderId: string }) {
  const [pending, startTransition] = useTransition();

  return (
    <div className="mt-6 space-y-3">
      <Button
        className="w-full"
        disabled={pending}
        onClick={() => startTransition(() => processPaymentAction(orderId, false))}
      >
        {pending ? "Processing…" : "Pay now"}
      </Button>
      <Button
        variant="ghost"
        className="w-full"
        disabled={pending}
        onClick={() => startTransition(() => processPaymentAction(orderId, true))}
      >
        Simulate a failed payment
      </Button>
    </div>
  );
}
