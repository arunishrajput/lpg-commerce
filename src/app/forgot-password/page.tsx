"use client";

import { useActionState } from "react";
import Link from "next/link";
import { forgotPasswordAction } from "@/features/auth/actions/password-reset";
import type { ActionState } from "@/features/auth/actions/register";
import { Field, TextInput } from "@/components/ui/field";
import { Button } from "@/components/ui/button";

const initialState: ActionState = {};

export default function ForgotPasswordPage() {
  const [state, formAction, pending] = useActionState(forgotPasswordAction, initialState);
  const submitted = pending === false && state !== initialState;

  return (
    <div className="mx-auto max-w-md px-4 py-16 sm:px-6">
      <h1 className="font-display text-2xl font-semibold text-ink">Reset your password</h1>
      <p className="mt-1 text-sm text-ink-soft">
        Enter your account email and we&apos;ll send a reset link.
      </p>
      <div className="mt-8 rounded-2xl border border-line bg-surface p-6">
        {submitted ? (
          <p className="text-sm text-ink">
            If an account exists for that email, a reset link is on its way.
          </p>
        ) : (
          <form action={formAction} className="space-y-5">
            <Field label="Email" htmlFor="email">
              <TextInput id="email" name="email" type="email" required autoComplete="email" />
            </Field>
            <Button type="submit" disabled={pending} className="w-full">
              {pending ? "Sending…" : "Send reset link"}
            </Button>
            <p className="text-center text-sm text-ink-soft">
              <Link href="/login" className="text-brand hover:underline">
                Back to sign in
              </Link>
            </p>
          </form>
        )}
      </div>
    </div>
  );
}
