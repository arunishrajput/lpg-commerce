import Link from "next/link";
import { getCurrentUser } from "@/features/auth/lib/session";
import { db } from "@/lib/db";

const NAV_LINKS = [
  { href: "/products", label: "Products" },
  { href: "/products?featured=offers", label: "Offers" },
  { href: "/orders", label: "Orders" },
  { href: "/track", label: "Track order" },
  { href: "/support", label: "Support" },
];

export async function SiteHeader() {
  const user = await getCurrentUser();

  let cartCount = 0;
  let isStaff = false;
  if (user) {
    const cart = await db.cart.findFirst({ where: { userId: user.id } });
    if (cart) {
      const items = await db.cartItem.findMany({
        where: { cartId: cart.id, savedForLater: false },
        select: { quantity: true },
      });
      cartCount = items.reduce((sum, i) => sum + i.quantity, 0);
    }
    const staff = await db.staff.findUnique({ where: { email: user.email } });
    isStaff = !!staff;
  }

  return (
    <header className="sticky top-0 z-40 border-b border-line bg-surface/95 backdrop-blur">
      <div className="mx-auto flex max-w-6xl items-center gap-4 px-4 py-3 sm:px-6">
        <Link href="/" className="flex items-center gap-2 shrink-0">
          <span
            aria-hidden
            className="inline-block h-6 w-6 rounded-sm bg-brand"
            style={{
              backgroundImage:
                "linear-gradient(135deg, var(--brand) 0%, var(--flame) 100%)",
            }}
          />
          <span className="font-display text-lg font-semibold tracking-tight text-ink">
            Supply Line
          </span>
        </Link>

        <nav className="hidden md:flex items-center gap-5 text-sm text-ink-soft">
          {NAV_LINKS.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className="hover:text-ink transition-colors"
            >
              {link.label}
            </Link>
          ))}
        </nav>

        <form
          action="/products"
          className="hidden md:flex flex-1 items-center max-w-sm ml-2"
        >
          <input
            type="search"
            name="q"
            placeholder="Search burners, regulators, hoses…"
            className="w-full rounded-full border border-line bg-paper px-4 py-1.5 text-sm text-ink placeholder:text-ink-soft/70 focus:border-brand focus:outline-none"
          />
        </form>

        <div className="ml-auto flex items-center gap-3 text-sm">
          <Link
            href="/delivery-check"
            className="hidden sm:inline text-ink-soft hover:text-ink transition-colors"
          >
            Deliver to…
          </Link>
          <Link
            href="/cart"
            className="relative text-ink-soft hover:text-ink transition-colors"
          >
            Cart
            {cartCount > 0 && (
              <span className="absolute -right-3 -top-2 inline-flex h-4 min-w-4 items-center justify-center rounded-full bg-flame px-1 text-[10px] font-medium text-white">
                {cartCount}
              </span>
            )}
          </Link>
          {isStaff && (
            <Link
              href="/admin"
              className="hidden sm:inline text-ink-soft hover:text-ink transition-colors"
            >
              Admin
            </Link>
          )}
          {user ? (
            <Link
              href="/account"
              className="rounded-full bg-brand px-3 py-1.5 text-white hover:bg-brand-deep transition-colors"
            >
              {user.fullName.split(" ")[0]}
            </Link>
          ) : (
            <Link
              href="/login"
              className="rounded-full bg-brand px-3 py-1.5 text-white hover:bg-brand-deep transition-colors"
            >
              Sign in
            </Link>
          )}
        </div>
      </div>
    </header>
  );
}
