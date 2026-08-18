import { randomBytes, createHash } from "crypto";

/** A raw, URL-safe token to hand to the client (cookie, email link). */
export function generateRawToken(): string {
  return randomBytes(32).toString("base64url");
}

/** The value we actually persist — never store raw tokens at rest. */
export function hashToken(raw: string): string {
  return createHash("sha256").update(raw).digest("hex");
}
