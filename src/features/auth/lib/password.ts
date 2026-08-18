import bcrypt from "bcryptjs";

const SALT_ROUNDS = 12;

export async function hashPassword(plain: string): Promise<string> {
  return bcrypt.hash(plain, SALT_ROUNDS);
}

export async function verifyPassword(
  plain: string,
  hash: string
): Promise<boolean> {
  return bcrypt.compare(plain, hash);
}

export function passwordStrengthError(plain: string): string | null {
  if (plain.length < 8) return "Password must be at least 8 characters.";
  if (!/[A-Z]/.test(plain)) return "Include at least one uppercase letter.";
  if (!/[a-z]/.test(plain)) return "Include at least one lowercase letter.";
  if (!/[0-9]/.test(plain)) return "Include at least one number.";
  return null;
}
