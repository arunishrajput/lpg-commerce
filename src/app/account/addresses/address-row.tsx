"use client";

import { useTransition } from "react";
import { deleteAddressAction, setDefaultAddressAction } from "@/features/auth/actions/address";
import { Button } from "@/components/ui/button";

interface AddressRowProps {
  id: string;
  label: string | null;
  line1: string;
  line2: string | null;
  city: string;
  state: string;
  pincode: string;
  isDefault: boolean;
}

export function AddressRow(address: AddressRowProps) {
  const [pending, startTransition] = useTransition();

  return (
    <div className="flex items-start justify-between gap-4 rounded-xl border border-line bg-surface p-4">
      <div>
        <div className="flex items-center gap-2">
          <p className="text-sm font-medium text-ink">
            {address.label || "Address"}
          </p>
          {address.isDefault && (
            <span className="rounded-full bg-brand/10 px-2 py-0.5 text-xs text-brand">
              Default
            </span>
          )}
        </div>
        <p className="mt-1 text-sm text-ink-soft">
          {address.line1}
          {address.line2 ? `, ${address.line2}` : ""}, {address.city}, {address.state}{" "}
          {address.pincode}
        </p>
      </div>
      <div className="flex shrink-0 gap-2">
        {!address.isDefault && (
          <Button
            variant="secondary"
            disabled={pending}
            onClick={() => startTransition(() => setDefaultAddressAction(address.id))}
          >
            Set default
          </Button>
        )}
        <Button
          variant="danger"
          disabled={pending}
          onClick={() => startTransition(() => deleteAddressAction(address.id))}
        >
          Delete
        </Button>
      </div>
    </div>
  );
}
