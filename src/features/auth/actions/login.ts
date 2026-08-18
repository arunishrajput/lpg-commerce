"use server";

import { redirect } from "next/navigation";
import { db } from "@/lib/db";
import { loginSchema } from "@/features/auth/lib/schemas";
import { verifyPassword } from "@/features/auth/lib/password";
import { createSession } from "@/features/auth/lib/session";
import { checkRateLimit } from "@/lib/rate-limit";
import type { ActionState } from "./register";

export async function loginAction(
  _prev: ActionState,
  formData: FormData
): Promise<ActionState> {
  const raw = {
    email: String(formData.get("email") ?? ""),
    password: String(formData.get("password") ?? ""),
  };

  const parsed = loginSchema.safeParse(raw);
  if (!parsed.success) {
    return { error: "Enter a valid email and password." };
  }

  // Keyed by the email being attempted, not the caller's IP — simple and
  // enough to blunt credential-stuffing against one account in this demo.
  const rate = checkRateLimit(`login:${parsed.data.email.toLowerCase()}`, 8, 15 * 60);
  if (!rate.allowed) {
    return { error: "Too many attempts. Please wait a few minutes and try again." };
  }

  const user = await db.user.findUnique({ where: { email: parsed.data.email } });
  if (!user) {
    // Same message as a wrong password — don't reveal which part was wrong.
    return { error: "Incorrect email or password." };
  }

  const valid = await verifyPassword(parsed.data.password, user.passwordHash);
  if (!valid) {
    return { error: "Incorrect email or password." };
  }

  await createSession(user.id);
  redirect("/account");
}
