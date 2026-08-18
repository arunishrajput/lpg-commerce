import { Suspense } from "react";
import { LoginForm } from "./login-form";

export default function LoginPage() {
  return (
    <div className="mx-auto max-w-md px-4 py-16 sm:px-6">
      <h1 className="font-display text-2xl font-semibold text-ink">Sign in</h1>
      <p className="mt-1 text-sm text-ink-soft">
        Welcome back. Sign in to view your orders and addresses.
      </p>
      <div className="mt-8 rounded-2xl border border-line bg-surface p-6">
        <Suspense>
          <LoginForm />
        </Suspense>
      </div>
    </div>
  );
}
