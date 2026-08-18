const LEVEL_META: Record<
  string,
  { label: string; description: string; tone: "ink-soft" | "warn" | "safe" }
> = {
  BASIC: {
    label: "Basic",
    description: "Account created. Verify your phone to unlock faster checkout.",
    tone: "ink-soft",
  },
  PHONE_VERIFIED: {
    label: "Phone verified",
    description: "Add a verified address to speed up delivery checks.",
    tone: "warn",
  },
  ADDRESS_VERIFIED: {
    label: "Address verified",
    description: "Complete KYC if you plan to order regulated products.",
    tone: "warn",
  },
  KYC_VERIFIED: {
    label: "Fully verified",
    description: "Your account is verified for all product categories.",
    tone: "safe",
  },
};

const TONE_CLASSES: Record<string, string> = {
  "ink-soft": "bg-line/60 text-ink-soft",
  warn: "bg-warn/15 text-warn",
  safe: "bg-safe/15 text-safe",
};

export function VerificationBadge({ level }: { level: string }) {
  const meta = LEVEL_META[level] ?? LEVEL_META.BASIC;
  return (
    <div className="rounded-xl border border-line bg-surface p-4">
      <div className="flex items-center gap-2">
        <span
          className={`inline-flex rounded-full px-2.5 py-1 text-xs font-medium ${TONE_CLASSES[meta.tone]}`}
        >
          {meta.label}
        </span>
      </div>
      <p className="mt-2 text-sm text-ink-soft">{meta.description}</p>
    </div>
  );
}
