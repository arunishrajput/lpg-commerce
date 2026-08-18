import Link from "next/link";
import { SAFETY_ESCALATION_RESPONSE } from "@/features/ai/lib/safety";

export default function SafetyPage() {
  return (
    <div className="mx-auto max-w-2xl px-4 py-12 sm:px-6">
      <h1 className="font-display text-2xl font-semibold text-ink">Product safety information</h1>
      <p className="mt-2 text-sm text-ink-soft">
        General safety guidance for LPG and kitchen gas equipment. This page
        doesn&apos;t replace the manual for your specific product — check
        each product page for its linked documentation.
      </p>

      <div className="mt-6 rounded-2xl border border-danger/30 bg-danger/10 p-6">
        <h2 className="font-medium text-danger">If you suspect a gas leak</h2>
        <p className="mt-2 whitespace-pre-wrap text-sm text-ink">{SAFETY_ESCALATION_RESPONSE}</p>
      </div>

      <div className="mt-6 space-y-4 text-sm text-ink-soft">
        <div>
          <h2 className="font-medium text-ink">General good practice</h2>
          <ul className="mt-2 list-disc space-y-1 pl-5">
            <li>Have gas connections and regulators installed or serviced by a qualified technician.</li>
            <li>Check hoses periodically for cracking, brittleness, or looseness at the fittings.</li>
            <li>Never use equipment that&apos;s damaged, leaking, or behaving unexpectedly — stop and have it inspected first.</li>
            <li>Keep the kitchen ventilated when cooking.</li>
            <li>Know where your cylinder shut-off valve is and how to use it.</li>
          </ul>
        </div>

        <div>
          <h2 className="font-medium text-ink">Regulated products</h2>
          <p className="mt-2">
            Items marked <span className="rounded-full bg-flame-soft px-2 py-0.5 text-xs font-medium text-flame">Regulated</span>{" "}
            on their product page (regulators, hoses) are shown for reference in this demo catalog.
            Read the{" "}
            <Link href="/compliance" className="text-brand hover:underline">
              compliance page
            </Link>{" "}
            for what that means here.
          </p>
        </div>
      </div>
    </div>
  );
}
