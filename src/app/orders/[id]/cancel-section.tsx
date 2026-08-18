"use client";

import { useState } from "react";
import { CancelOrderForm } from "@/features/orders/components/cancel-order-form";
import { Button } from "@/components/ui/button";

export function CancelSection({ orderId }: { orderId: string }) {
  const [open, setOpen] = useState(false);

  if (!open) {
    return (
      <Button variant="secondary" onClick={() => setOpen(true)}>
        Cancel order
      </Button>
    );
  }

  return (
    <div className="rounded-xl border border-line bg-surface p-4">
      <p className="mb-3 text-sm font-medium text-ink">Cancel this order?</p>
      <CancelOrderForm orderId={orderId} />
    </div>
  );
}
