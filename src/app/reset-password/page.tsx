"use client";

import { useActionState } from "react";
import { useSearchParams } from "next/navigation";
import { Suspense } from "react";
import { resetPasswordAction } from "@/features/auth/actions/password-reset";
import type { ActionState } from "@/features/auth/actions/register";
import { Field, TextInput } from "@/components/ui/field";
import { Button } from "@/components/ui/button";

const initialState: ActionState = {};

function ResetPasswordForm() {
  const [state, formAction, pending] = useActionState(resetPasswordAction, initialState);
  const params = useSearchParams();
  const token = params.get("token") ?? "";

  if (!token) {
    return (
      <p className="text-sm text-danger">
        This page needs a reset token. Use the link from your email.
      </p>
    );
  }

  return (
    <form action={formAction} className="space-y-5">
      <input type="hidden" name="token" value={token} />
      <Field label="New password" htmlFor="password" error={state.fieldErrors?.password}>
        <TextInput
          id="password"
          name="password"
          type="password"
          required
          autoComplete="new-password"
        />
      </Field>
      {state.error && (
        <p className="text-sm text-danger" role="alert">
          {state.error}
        </p>
      )}
      <Button type="submit" disabled={pending} className="w-full">
        {pending ? "Updating…" : "Update password"}
      </Button>
    </form>
  );
}

export default function ResetPasswordPage() {
  return (
    <div className="mx-auto max-w-md px-4 py-16 sm:px-6">
      <h1 className="font-display text-2xl font-semibold text-ink">Set a new password</h1>
      <div className="mt-8 rounded-2xl border border-line bg-surface p-6">
        <Suspense>
          <ResetPasswordForm />
        </Suspense>
      </div>
    </div>
  );
}
