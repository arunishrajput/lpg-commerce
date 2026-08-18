"use server";

import { db } from "@/lib/db";
import { registerSchema } from "@/features/auth/lib/schemas";
import { hashPassword, passwordStrengthError } from "@/features/auth/lib/password";
import { generateRawToken, hashToken } from "@/features/auth/lib/tokens";
import { createSession } from "@/features/auth/lib/session";
import { sendEmail, verificationEmailBody } from "@/services/email";
import { env } from "@/lib/env";
import { checkRateLimit } from "@/lib/rate-limit";
import { redirect } from "next/navigation";

export interface ActionState {
  error?: string;
  fieldErrors?: Record<string, string>;
}

export async function registerAction(
  _prev: ActionState,
  formData: FormData
): Promise<ActionState> {
  const raw = {
    fullName: String(formData.get("fullName") ?? ""),
    email: String(formData.get("email") ?? ""),
    phone: String(formData.get("phone") ?? ""),
    password: String(formData.get("password") ?? ""),
  };

  const parsed = registerSchema.safeParse(raw);
  if (!parsed.success) {
    const fieldErrors: Record<string, string> = {};
    for (const issue of parsed.error.issues) {
      fieldErrors[String(issue.path[0])] = issue.message;
    }
    return { fieldErrors };
  }

  const rate = checkRateLimit(`register:${parsed.data.email.toLowerCase()}`, 5, 60 * 60);
  if (!rate.allowed) {
    return { error: "Too many attempts. Please wait a while and try again." };
  }

  const strengthError = passwordStrengthError(parsed.data.password);
  if (strengthError) {
    return { fieldErrors: { password: strengthError } };
  }

  const existing = await db.user.findUnique({
    where: { email: parsed.data.email },
  });
  if (existing) {
    return { fieldErrors: { email: "An account with this email already exists." } };
  }

  const passwordHash = await hashPassword(parsed.data.password);

  const user = await db.user.create({
    data: {
      fullName: parsed.data.fullName,
      email: parsed.data.email,
      phone: parsed.data.phone || null,
      passwordHash,
    },
  });

  // Email verification token
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

  await createSession(user.id);

  redirect("/account?welcome=1");
}
