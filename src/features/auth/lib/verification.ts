import "server-only";
import { db } from "@/lib/db";
import type { VerificationLevel, Address } from "@prisma/client";

/**
 * Verification is a ladder: BASIC -> PHONE_VERIFIED -> ADDRESS_VERIFIED -> KYC_VERIFIED.
 * Recomputed from underlying facts rather than set ad hoc, so it can never
 * drift out of sync with what's actually been verified.
 */
export async function recomputeVerificationLevel(userId: string): Promise<VerificationLevel> {
  const user = await db.user.findUniqueOrThrow({
    where: { id: userId },
    include: {
      addresses: true,
      kycRecord: true,
    },
  });

  let level: VerificationLevel = "BASIC";

  if (user.phoneVerifiedAt) {
    level = "PHONE_VERIFIED";
  }
  if (user.phoneVerifiedAt && user.addresses.some((a: Address) => a.verifiedAt)) {
    level = "ADDRESS_VERIFIED";
  }
  if (user.kycRecord?.status === "VERIFIED") {
    level = "KYC_VERIFIED";
  }

  if (level !== user.verificationLevel) {
    await db.user.update({
      where: { id: userId },
      data: { verificationLevel: level },
    });
  }

  return level;
}
