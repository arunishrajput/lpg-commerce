"use client";

import { useState, useTransition } from "react";
import { resendVerificationEmail } from "@/features/auth/actions/verify-email";
import { Button } from "@/components/ui/button";

export function ResendVerificationButton() {
  const [pending, startTransition] = useTransition();
  const [sent, setSent] = useState(false);

  if (sent) {
    return <p className="text-sm text-safe">Verification email sent — check your inbox.</p>;
  }

  return (
    <Button
      variant="secondary"
      disabled={pending}
      onClick={() =>
        startTransition(async () => {
          await resendVerificationEmail();
          setSent(true);
        })
      }
    >
      {pending ? "Sending…" : "Resend verification email"}
    </Button>
  );
}
