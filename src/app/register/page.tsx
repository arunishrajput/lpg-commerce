import { RegisterForm } from "./register-form";

export default function RegisterPage() {
  return (
    <div className="mx-auto max-w-md px-4 py-16 sm:px-6">
      <h1 className="font-display text-2xl font-semibold text-ink">
        Create your account
      </h1>
      <p className="mt-1 text-sm text-ink-soft">
        Save addresses, track orders, and check delivery to your door.
      </p>
      <div className="mt-8 rounded-2xl border border-line bg-surface p-6">
        <RegisterForm />
      </div>
    </div>
  );
}
