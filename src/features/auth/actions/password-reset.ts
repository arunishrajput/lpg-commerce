"use server";

import { redirect } from "next/navigation";
import { db } from "@/lib/db";
import {
  forgotPasswordSchema,
  resetPasswordSchema,
} from "@/features/auth/lib/schemas";
import { hashPassword, passwordStrengthError } from "@/features/auth/lib/password";
import { generateRawToken, hashToken } from "@/features/auth/lib/tokens";
import { sendEmail, passwordResetEmailBody } from "@/services/email";
import { env } from "@/lib/env";
import { checkRateLimit } from "@/lib/rate-limit";
import type { ActionState } from "./register";

export async function forgotPasswordAction(
  _prev: ActionState,
  formData: FormData
): Promise<ActionState> {
  const parsed = forgotPasswordSchema.safeParse({
    email: String(formData.get("email") ?? ""),
  });
  if (!parsed.success) {
    return { error: "Enter a valid email address." };
  }

  const rate = checkRateLimit(`reset:${parsed.data.email.toLowerCase()}`, 3, 60 * 60);
  if (!rate.allowed) {
    // Same generic behavior as the "no such account" case below — don't
    // reveal that rate limiting (vs. account existence) is what happened.
    return {};
  }

  const user = await db.user.findUnique({ where: { email: parsed.data.email } });

  // Always behave the same whether or not the account exists, so we don't
  // reveal which emails are registered.
  if (user) {
    const rawToken = generateRawToken();
    await db.passwordResetToken.create({
      data: {
        userId: user.id,
        tokenHash: hashToken(rawToken),
        expiresAt: new Date(Date.now() + 60 * 60 * 1000),
      },
    });

    const resetLink = `${env.APP_URL()}/reset-password?token=${rawToken}`;
    await sendEmail({
      to: user.email,
      subject: "Reset your Supply Line password",
      body: passwordResetEmailBody(resetLink),
    });
  }

  return { error: undefined };
}

export async function resetPasswordAction(
  _prev: ActionState,
  formData: FormData
): Promise<ActionState> {
  const parsed = resetPasswordSchema.safeParse({
    token: String(formData.get("token") ?? ""),
    password: String(formData.get("password") ?? ""),
  });
  if (!parsed.success) {
    return { error: "Something's missing. Try the reset link again." };
  }

  const strengthError = passwordStrengthError(parsed.data.password);
  if (strengthError) {
    return { fieldErrors: { password: strengthError } };
  }

  const tokenHash = hashToken(parsed.data.token);
  const record = await db.passwordResetToken.findUnique({ where: { tokenHash } });

  if (!record || record.usedAt || record.expiresAt < new Date()) {
    return { error: "This reset link is invalid or has expired. Request a new one." };
  }

  const passwordHash = await hashPassword(parsed.data.password);

  await db.$transaction([
    db.user.update({ where: { id: record.userId }, data: { passwordHash } }),
    db.passwordResetToken.update({
      where: { id: record.id },
      data: { usedAt: new Date() },
    }),
    // Invalidate existing sessions on password change.
    db.session.deleteMany({ where: { userId: record.userId } }),
  ]);

  redirect("/login?reset=1");
}
