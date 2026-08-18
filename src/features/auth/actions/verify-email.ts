"use server";

import { db } from "@/lib/db";
import { hashToken, generateRawToken } from "@/features/auth/lib/tokens";
import { getCurrentUser } from "@/features/auth/lib/session";
import { sendEmail, verificationEmailBody } from "@/services/email";
import { env } from "@/lib/env";

export type VerifyEmailResult =
  | { status: "success" }
  | { status: "expired" }
  | { status: "invalid" };

export async function confirmEmailVerification(
  rawToken: string
): Promise<VerifyEmailResult> {
  const tokenHash = hashToken(rawToken);
  const record = await db.emailVerificationToken.findUnique({
    where: { tokenHash },
  });

  if (!record || record.usedAt) {
    return { status: "invalid" };
  }
  if (record.expiresAt < new Date()) {
    return { status: "expired" };
  }

  await db.$transaction([
    db.emailVerificationToken.update({
      where: { id: record.id },
      data: { usedAt: new Date() },
    }),
    db.user.update({
      where: { id: record.userId },
      data: { emailVerifiedAt: new Date() },
    }),
  ]);

  return { status: "success" };
}

export async function resendVerificationEmail(): Promise<{ sent: boolean }> {
  const user = await getCurrentUser();
  if (!user || user.emailVerifiedAt) return { sent: false };

  const rawToken = generateRawToken();
  await db.emailVerificationToken.create({
    data: {
      userId: user.id,
      tokenHash: hashToken(rawToken),
      expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000),
    },
  });

  const verifyLink = `${env.APP_URL()}/verify-email?token=${rawToken}`;
  await sendEmail({
    to: user.email,
    subject: "Verify your Supply Line email",
    body: verificationEmailBody(verifyLink),
  });

  return { sent: true };
}
