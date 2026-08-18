import Link from "next/link";
import { confirmEmailVerification } from "@/features/auth/actions/verify-email";
import { Button } from "@/components/ui/button";

export default async function VerifyEmailPage({
  searchParams,
}: {
  searchParams: Promise<{ token?: string }>;
}) {
  const { token } = await searchParams;

  if (!token) {
    return (
      <StatusCard
        title="Missing verification link"
        body="This page needs a verification token. Use the link from your email."
      />
    );
  }

  const result = await confirmEmailVerification(token);

  if (result.status === "success") {
    return (
      <StatusCard
        title="Email verified"
        body="Your email is confirmed. You're all set."
        tone="safe"
      />
    );
  }

  if (result.status === "expired") {
    return (
      <StatusCard
        title="Link expired"
        body="This verification link has expired. Sign in and request a new one from your account page."
        tone="warn"
      />
    );
  }

  return (
    <StatusCard
      title="Invalid link"
      body="This verification link isn't valid, or has already been used."
      tone="warn"
    />
  );
}

function StatusCard({
  title,
  body,
  tone = "ink",
}: {
  title: string;
  body: string;
  tone?: "safe" | "warn" | "ink";
}) {
  const toneClass =
    tone === "safe" ? "text-safe" : tone === "warn" ? "text-warn" : "text-ink";

  return (
    <div className="mx-auto max-w-md px-4 py-20 text-center sm:px-6">
      <h1 className={`font-display text-2xl font-semibold ${toneClass}`}>{title}</h1>
      <p className="mt-2 text-sm text-ink-soft">{body}</p>
      <div className="mt-6">
        <Link href="/account">
          <Button variant="secondary">Go to your account</Button>
        </Link>
      </div>
    </div>
  );
}
