"use client";

import { useActionState } from "react";
import Link from "next/link";
import { registerAction, type ActionState } from "@/features/auth/actions/register";
import { Field, TextInput } from "@/components/ui/field";
import { Button } from "@/components/ui/button";

const initialState: ActionState = {};

export function RegisterForm() {
  const [state, formAction, pending] = useActionState(registerAction, initialState);

  return (
    <form action={formAction} className="space-y-5">
      <Field label="Full name" htmlFor="fullName" error={state.fieldErrors?.fullName}>
        <TextInput id="fullName" name="fullName" required autoComplete="name" />
      </Field>
      <Field label="Email" htmlFor="email" error={state.fieldErrors?.email}>
        <TextInput id="email" name="email" type="email" required autoComplete="email" />
      </Field>
      <Field label="Phone (optional)" htmlFor="phone" error={state.fieldErrors?.phone}>
        <TextInput id="phone" name="phone" type="tel" autoComplete="tel" placeholder="+91 98765 43210" />
      </Field>
      <Field label="Password" htmlFor="password" error={state.fieldErrors?.password}>
        <TextInput
          id="password"
          name="password"
          type="password"
          required
          autoComplete="new-password"
        />
        <p className="text-xs text-ink-soft">
          At least 8 characters, with an uppercase letter and a number.
        </p>
      </Field>

      {state.error && (
        <p className="text-sm text-danger" role="alert">
          {state.error}
        </p>
      )}

      <Button type="submit" disabled={pending} className="w-full">
        {pending ? "Creating account…" : "Create account"}
      </Button>

      <p className="text-center text-sm text-ink-soft">
        Already have an account?{" "}
        <Link href="/login" className="text-brand hover:underline">
          Sign in
        </Link>
      </p>
    </form>
  );
}
