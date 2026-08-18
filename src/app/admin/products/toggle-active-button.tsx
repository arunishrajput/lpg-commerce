"use client";

import { useTransition } from "react";
import { toggleProductActiveAction } from "@/features/admin/actions/products";

export function ToggleActiveButton({
  productId,
  isActive,
}: {
  productId: string;
  isActive: boolean;
}) {
  const [pending, startTransition] = useTransition();

  return (
    <button
      type="button"
      disabled={pending}
      onClick={() => startTransition(() => toggleProductActiveAction(productId))}
      className="text-ink-soft hover:text-ink disabled:opacity-50"
    >
      {isActive ? "Deactivate" : "Activate"}
    </button>
  );
}
