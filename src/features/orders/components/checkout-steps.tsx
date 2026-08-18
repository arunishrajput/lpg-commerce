const STEPS = [
  { key: "address", label: "Address" },
  { key: "delivery", label: "Delivery" },
  { key: "review", label: "Review" },
] as const;

export type CheckoutStep = (typeof STEPS)[number]["key"];

export function CheckoutSteps({ current }: { current: CheckoutStep }) {
  const currentIndex = STEPS.findIndex((s) => s.key === current);

  return (
    <ol className="flex items-center gap-3 text-sm">
      {STEPS.map((step, i) => (
        <li key={step.key} className="flex items-center gap-3">
          <span
            className={`flex h-6 w-6 items-center justify-center rounded-full text-xs font-medium ${
              i <= currentIndex ? "bg-brand text-white" : "bg-line text-ink-soft"
            }`}
          >
            {i + 1}
          </span>
          <span className={i <= currentIndex ? "text-ink" : "text-ink-soft"}>{step.label}</span>
          {i < STEPS.length - 1 && <span className="text-line">—</span>}
        </li>
      ))}
    </ol>
  );
}
