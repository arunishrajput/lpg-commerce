"use client";

import { useActionState } from "react";
import { createAddressAction } from "@/features/auth/actions/address";
import type { ActionState } from "@/features/auth/actions/register";
import { Field, TextInput } from "@/components/ui/field";
import { Button } from "@/components/ui/button";

const initialState: ActionState = {};

export function AddressForm() {
  const [state, formAction, pending] = useActionState(createAddressAction, initialState);

  return (
    <form action={formAction} className="space-y-4 rounded-xl border border-line bg-surface p-5">
      <h2 className="font-medium text-ink">Add a new address</h2>

      <Field label="Label (optional)" htmlFor="label">
        <TextInput id="label" name="label" placeholder="Home, Office…" />
      </Field>
      <Field label="Street address" htmlFor="line1" error={state.fieldErrors?.line1}>
        <TextInput id="line1" name="line1" required />
      </Field>
      <Field label="Apartment, suite, etc. (optional)" htmlFor="line2">
        <TextInput id="line2" name="line2" />
      </Field>
      <div className="grid grid-cols-2 gap-4">
        <Field label="City" htmlFor="city" error={state.fieldErrors?.city}>
          <TextInput id="city" name="city" required />
        </Field>
        <Field label="State" htmlFor="state" error={state.fieldErrors?.state}>
          <TextInput id="state" name="state" required />
        </Field>
      </div>
      <Field label="Pincode" htmlFor="pincode" error={state.fieldErrors?.pincode}>
        <TextInput id="pincode" name="pincode" required inputMode="numeric" />
      </Field>

      <label className="flex items-center gap-2 text-sm text-ink-soft">
        <input type="checkbox" name="isDefault" className="rounded border-line" />
        Set as default address
      </label>

      <Button type="submit" disabled={pending}>
        {pending ? "Saving…" : "Save address"}
      </Button>
    </form>
  );
}
