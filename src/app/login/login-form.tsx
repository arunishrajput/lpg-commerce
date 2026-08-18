"use client";

import { useActionState } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { loginAction } from "@/features/auth/actions/login";
import type { ActionState } from "@/features/auth/actions/register";
import { Field, TextInput } from "@/components/ui/field";
import { Button } from "@/components/ui/button";

const initialState: ActionState = {};

export function LoginForm() {
  const [state, formAction, pending] = useActionState(loginAction, initialState);
  const params = useSearchParams();
  const justReset = params.get("reset") === "1";

  return (
    <form action={formAction} className="space-y-5">
      {justReset && (
        <p className="rounded-lg bg-safe/10 px-3 py-2 text-sm text-safe">
          Password updated. Sign in with your new password.
        </p>
      )}

      <Field label="Email" htmlFor="email">
        <TextInput id="email" name="email" type="email" required autoComplete="email" />
      </Field>
      <Field label="Password" htmlFor="password">
        <TextInput
          id="password"
          name="password"
          type="password"
          required
          autoComplete="current-password"
        />
      </Field>

      {state.error && (
        <p className="text-sm text-danger" role="alert">
          {state.error}
        </p>
      )}

      <div className="flex items-center justify-between text-sm">
        <Link href="/forgot-password" className="text-brand hover:underline">
          Forgot password?
        </Link>
      </div>

      <Button type="submit" disabled={pending} className="w-full">
        {pending ? "Signing in…" : "Sign in"}
      </Button>

      <p className="text-center text-sm text-ink-soft">
        New here?{" "}
        <Link href="/register" className="text-brand hover:underline">
          Create an account
        </Link>
      </p>
    </form>
  );
}
