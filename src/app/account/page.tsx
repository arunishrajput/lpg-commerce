import { redirect } from "next/navigation";
import Link from "next/link";
import { getCurrentUser } from "@/features/auth/lib/session";
import { VerificationBadge } from "@/features/auth/components/verification-badge";
import { ResendVerificationButton } from "./resend-verification-button";
import { LogoutButton } from "@/components/layout/logout-button";

export default async function AccountPage() {
  const user = await getCurrentUser();
  if (!user) redirect("/login");

  return (
    <div className="mx-auto max-w-2xl px-4 py-12 sm:px-6">
      <div className="flex items-center justify-between">
        <h1 className="font-display text-2xl font-semibold text-ink">My profile</h1>
        <LogoutButton />
      </div>

      <div className="mt-6 grid gap-4 sm:grid-cols-2">
        <div className="rounded-xl border border-line bg-surface p-4">
          <p className="text-xs uppercase tracking-wide text-ink-soft">Name</p>
          <p className="mt-1 text-sm text-ink">{user.fullName}</p>
        </div>
        <div className="rounded-xl border border-line bg-surface p-4">
          <p className="text-xs uppercase tracking-wide text-ink-soft">Email</p>
          <p className="mt-1 text-sm text-ink">{user.email}</p>
          {!user.emailVerifiedAt && (
            <p className="mt-1 text-xs text-warn">Not verified</p>
          )}
        </div>
        <div className="rounded-xl border border-line bg-surface p-4">
          <p className="text-xs uppercase tracking-wide text-ink-soft">Phone</p>
          <p className="mt-1 text-sm text-ink">{user.phone ?? "Not added"}</p>
        </div>
        <div className="rounded-xl border border-line bg-surface p-4">
          <p className="text-xs uppercase tracking-wide text-ink-soft">Addresses</p>
          <Link href="/account/addresses" className="mt-1 inline-block text-sm text-brand hover:underline">
            Manage addresses →
          </Link>
        </div>
        <div className="rounded-xl border border-line bg-surface p-4">
          <p className="text-xs uppercase tracking-wide text-ink-soft">Wishlist</p>
          <Link href="/account/wishlist" className="mt-1 inline-block text-sm text-brand hover:underline">
            View wishlist →
          </Link>
        </div>
      </div>

      <div className="mt-6">
        <VerificationBadge level={user.verificationLevel} />
      </div>

      {!user.emailVerifiedAt && (
        <div className="mt-6">
          <ResendVerificationButton />
        </div>
      )}
    </div>
  );
}
