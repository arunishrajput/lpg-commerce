export default function CompliancePage() {
  return (
    <div className="mx-auto max-w-2xl px-4 py-12 sm:px-6">
      <h1 className="font-display text-2xl font-semibold text-ink">
        Compliance & regulated products
      </h1>

      <div className="mt-6 space-y-4 text-sm text-ink-soft">
        <p>
          This is a demo/portfolio build. It is <strong className="text-ink">not</strong>{" "}
          licensed, authorized, or configured to sell, transport, refill, or
          deliver real regulated LPG cylinders. Nothing on this site should
          be taken as evidence of such authorization.
        </p>
        <p>
          Products marked <span className="rounded-full bg-flame-soft px-2 py-0.5 text-xs font-medium text-flame">Regulated</span>{" "}
          in this catalog (regulators, hoses) are shown with an eligibility
          flag on their database record. In a real deployment, that flag
          would gate the product behind identity verification and
          delivery-restriction rules appropriate to local regulations —
          neither is asserted or implemented here beyond the flag itself.
        </p>
        <p>
          Identity verification in this demo uses a generic KYC status model
          (status, consent timestamp, a masked identifier, and an opaque
          provider reference) rather than collecting or storing real
          government ID numbers, and uses a mock verification provider only.
        </p>
      </div>
    </div>
  );
}
