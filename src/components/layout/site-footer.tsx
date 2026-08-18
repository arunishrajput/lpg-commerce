import Link from "next/link";

export function SiteFooter() {
  return (
    <footer className="border-t border-line bg-surface">
      <div className="mx-auto max-w-6xl px-4 py-10 sm:px-6">
        <div className="supply-line mb-8" />
        <div className="grid gap-8 sm:grid-cols-3">
          <div>
            <p className="font-display text-base font-semibold text-ink">
              Supply Line
            </p>
            <p className="mt-2 text-sm text-ink-soft">
              Kitchen equipment and gas accessories, sold and delivered
              within the limits shown on each product page.
            </p>
          </div>
          <div>
            <p className="text-sm font-medium text-ink">Safety</p>
            <ul className="mt-2 space-y-1 text-sm text-ink-soft">
              <li>
                <Link href="/safety" className="hover:text-ink">
                  Product safety information
                </Link>
              </li>
              <li>
                <Link href="/compliance" className="hover:text-ink">
                  Compliance & regulated products
                </Link>
              </li>
            </ul>
          </div>
          <div>
            <p className="text-sm font-medium text-ink">Help</p>
            <ul className="mt-2 space-y-1 text-sm text-ink-soft">
              <li>
                <Link href="/support" className="hover:text-ink">
                  Support
                </Link>
              </li>
              <li>
                <Link href="/track" className="hover:text-ink">
                  Track an order
                </Link>
              </li>
            </ul>
          </div>
        </div>
        <p className="mt-8 text-xs text-ink-soft/70">
          Demo build. Regulated-product listings are illustrative only and
          are not authorized for real sale, transport, refill, or delivery.
        </p>
      </div>
    </footer>
  );
}
