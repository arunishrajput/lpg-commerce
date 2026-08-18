"use client";

import { useActionState } from "react";
import { adjustInventoryAction, type InventoryAdjustState } from "@/features/admin/actions/inventory";
import { Button } from "@/components/ui/button";

const initialState: InventoryAdjustState = {};

export function AdjustInventoryForm({ inventoryId }: { inventoryId: string }) {
  const boundAction = adjustInventoryAction.bind(null, inventoryId);
  const [state, formAction, pending] = useActionState(boundAction, initialState);

  return (
    <form action={formAction} className="flex flex-wrap items-center gap-2">
      <input
        type="number"
        name="delta"
        placeholder="+/- qty"
        required
        className="w-24 rounded-lg border border-line bg-paper px-2 py-1.5 text-sm text-ink"
      />
      <input
        type="text"
        name="reason"
        placeholder="Reason"
        required
        className="w-40 rounded-lg border border-line bg-paper px-2 py-1.5 text-sm text-ink"
      />
      <Button type="submit" variant="secondary" disabled={pending}>
        {pending ? "Saving…" : "Apply"}
      </Button>
      {state.error && <span className="text-xs text-danger">{state.error}</span>}
    </form>
  );
}
