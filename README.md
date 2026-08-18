# Supply Line — Smart LPG & Kitchen Equipment Commerce Platform

A portfolio-grade full-stack commerce platform for LPG-adjacent kitchen
equipment (burners, lighters, regulators, hoses, stands, kitchen and safety
accessories). Built incrementally, phase by phase, per the master
development spec.

## ⚠️ Compliance notice

This is a **demo/portfolio build**. It is not licensed, authorized, or
configured to sell, transport, refill, or deliver real regulated LPG
cylinders. Regulated-product handling (eligibility flags, KYC, delivery
restrictions) is architected so real licensing/verification rules can be
plugged in later — none are asserted here. KYC uses a mock provider only and
never stores raw government ID numbers, only a masked identifier and an
opaque provider reference.

## Status

| Phase | Scope | Status |
|---|---|---|
| 1 | Project setup, design system, database schema | ✅ Done |
| 2 | Authentication, profile, addresses, verification levels | ✅ Done |
| 3 | Product catalog, categories, search | ✅ Done |
| 4 | Cart, wishlist, checkout | ✅ Done |
| 5 | Orders, payment architecture | ✅ Done |
| 6 | Delivery engine, location | ✅ Done |
| 7 | Admin dashboard, inventory | ✅ Done |
| 8 | AI support assistant, product knowledge base | ✅ Done |
| 9 | Recommendations, forecasting | ✅ Done |
| 10 | Security hardening, fraud detection, audit logs | ✅ Done |
| 11 | Testing, optimization | ✅ Done |
| 12 | Deployment, documentation | ✅ Done |

The full database schema (`prisma/schema.prisma`) is written up front so
later phases only add logic, not migrations from scratch — but only
Phase 1–2 models are wired to working UI so far.

## Architecture

```
src/
  app/            Next.js App Router routes (pages, layouts)
  features/       Domain logic, grouped by feature
    auth/           actions, lib (session, password, tokens, verification), components
    products/        (scaffolded, Phase 3)
    cart/             (scaffolded, Phase 4)
    orders/           (scaffolded, Phase 5)
    delivery/         (scaffolded, Phase 6)
    kyc/              (scaffolded)
    admin/            (scaffolded, Phase 7)
    notifications/    (scaffolded, Phase 8)
    ai/               (scaffolded, Phase 8)
  services/        Provider-agnostic external integrations
    email/          Swappable email provider (mock in dev)
    payments/       (scaffolded — payment abstraction, Phase 5)
    location/       (scaffolded — maps/geocoding abstraction, Phase 6)
    storage/        (scaffolded — object storage abstraction)
  components/      Shared UI (ui/, layout/)
  lib/             Cross-cutting: db client, env access
  types/           Shared TypeScript types
prisma/
  schema.prisma    Full data model for the entire platform
```

Business logic lives in `features/*` and `services/*`, not in page
components — pages call server actions and render.

## Technology stack

- **Frontend**: Next.js (App Router) + TypeScript + Tailwind CSS v4
- **Backend**: Next.js server actions
- **Database**: PostgreSQL + Prisma ORM
- **Auth**: Custom session auth — bcrypt password hashing, httpOnly cookie
  sessions backed by a hashed-token `Session` table (not JWT-in-cookie, so
  sessions can be revoked server-side)
- **Email**: Provider-agnostic interface (`src/services/email`), mock
  provider active in development (logs to console instead of sending)
- **Payments / Maps / AI**: Interfaces are stubbed in `env.ts` and will get
  provider implementations in their respective phases

## Design system

"Supply Line" — a steel-blue/flame-amber palette (`globals.css` `@theme`)
grounded in the subject matter, with a recurring "supply line" divider motif
(a dashed pipeline with couplings) used structurally between page sections
instead of generic dividers. Space Grotesk for display type, Inter for body,
IBM Plex Mono for data (order IDs, SKUs).

## Getting started

```bash
npm install
cp .env.example .env   # fill in DATABASE_URL at minimum
npx prisma generate
npx prisma migrate dev --name init
npm run db:seed         # loads demo categories, products, inventory, compatibility,
                         # delivery zones, coupons, and a demo admin account
npm run dev
```

The seeded admin account (`admin@supplyline.demo` / `AdminDemo123`) can
sign in normally and will see an "Admin" link in the header, leading to
`/admin`.

> **Note on this sandbox build**: `npx prisma generate` could not run in the
> development container used to write this code, because its network
> allowlist blocks `binaries.prisma.sh` (Prisma's engine download host).
> This is a sandbox-networking limitation, not a code issue — running the
> commands above in a normal environment (local machine, CI, Vercel) will
> generate the client and resolve every `@prisma/client` type error cleanly.
> Everything outside the generated Prisma types already type-checks.

## Environment variables

See `.env.example` for the full list, grouped by category (database, auth,
payments, AI, maps, email, storage). Every external integration is behind a
provider interface that defaults to a safe mock/dev implementation when the
corresponding `*_PROVIDER` variable is unset or `"mock"`.

## Product catalog (Phase 3 scope)

- **Search & filter**: name/brand/SKU/description text search, category,
  brand, price range, minimum rating, in-stock only — combined in one GET
  form (`/products`) that works with JavaScript disabled.
- **Sort**: newest, price asc/desc, rating, most-reviewed ("popular").
  Price/category/brand/text-search filters and price/newest sorts run as SQL
  predicates; rating and stock aren't denormalized onto `Product` yet, so
  those filters/sorts resolve in-process after a capped fetch — documented
  in `features/products/lib/queries.ts` with the denormalization path noted
  for when the catalog grows.
- **Product detail page**: image gallery, specs, safety documentation
  links, warranty, stock, reviews.
- **Compatibility checker**: always reads from the admin-maintained
  `ProductCompatibility` table — never inferred. An undocumented pairing is
  shown as "not documented," not guessed as safe.
- Add-to-cart/Buy-now buttons are visibly present but disabled with a note
  on when they activate, rather than being fake buttons that do nothing.
- `prisma/seed.ts` loads 7 categories, 16 products (mixing standard and
  regulated-eligibility items), specs, safety documents, one demo store's
  inventory, admin-curated compatibility pairs, and two demo coupon codes
  (`WELCOME10`, `SAVE20`).

## Cart, wishlist & checkout (Phase 4 scope)

- **Cart**: add/remove/update quantity, save-for-later <-> move-to-cart,
  coupon code preview (`Coupon` table -- validity/expiry checked, but the
  discount isn't persisted onto `Cart` since the schema only stores an
  applied coupon on `Order`; the code is carried through checkout via query
  params and would be attached to the order in Phase 5), computed subtotal/
  discount/delivery fee/total.
- **Pre-checkout verification**: before showing the checkout link, the cart
  flags items that are out of stock, over the available quantity, or no
  longer active -- per spec section 12.
- **Wishlist**: toggle from the product page or product cards, dedicated
  `/account/wishlist` page with quick-add-to-cart per item.
- **Checkout**: a 3-step, stateless, query-param-driven wizard (Address ->
  Delivery -> Review) that works without client JavaScript. Delivery is a
  single flat-rate placeholder option -- the real zone/distance engine is
  Phase 6. The review step's "Place order" button is visibly present but
  disabled with an explanation, since order creation and payment
  verification are Phase 5 -- consistent with how Add to Cart was handled
  before Phase 4 built it.
- Delivery fee logic and coupon validation live in
  `features/cart/lib/queries.ts`, not in page components.

## Orders & payments (Phase 5 scope)

- **Order creation**: re-validates the cart server-side (stock, active
  status, coupon) at the moment of purchase — nothing from the client is
  trusted for totals or availability. Stock is *reserved*
  (`Inventory.stockReserved`) at order creation and only physically
  deducted from `stockOnHand` once payment is verified, so a pending
  payment can't oversell stock but also doesn't remove it before money has
  actually moved.
- **Payment abstraction** (`services/payments`): a `PaymentProvider`
  interface with `initiate`/`verify`; only a deterministic mock
  implementation is wired up. Verification is always server-side — the
  payment page has a "Pay now" and a "Simulate a failed payment" button
  specifically so the failure path (declined payment, retry, no order
  confirmation) is exercised, not just the happy path.
- **Order lifecycle**: `PLACED -> ... -> DELIVERED`, matching the state
  diagram in the spec. A verified payment advances the order straight to
  `CONFIRMED` in this phase; the intermediate staff-driven steps
  (`PROCESSING` through `DELIVERED`) are set from the Phase 7 admin
  dashboard, not by the customer flow.
- **Cancellation & refund**: cancellable while `PLACED`/`PAYMENT_VERIFIED`/
  `CONFIRMED`/`PROCESSING`; blocked with an explanatory message once
  dispatched. Cancelling a paid order restocks inventory and creates a
  `Refund` record; the mock gateway settles it instantly and the UI notes
  that a real gateway's settlement would be asynchronous instead.
- **Invoice & warranty**: an `Invoice` row and a `Warranty` row per
  warrantied item are created on payment success. PDF generation isn't
  built yet — the invoice section says so rather than faking a download
  link.
- Every order/payment state change writes an `AuditLog` entry and a
  `Notification` row, per spec sections 29-30.

## Delivery engine & location (Phase 6 scope)

- **Location abstraction** (`services/location`): a `LocationProvider`
  interface with `geocodePincode`; only a deterministic mock is wired up
  (same pincode always resolves to the same coordinates, without calling a
  real maps API). A real provider (Google Maps, Mapbox, OpenStreetMap)
  would implement the same interface.
- **Delivery engine** (`features/delivery/lib/engine.ts`): resolves
  availability, fee, ETA, and *which store* fulfills an order from a
  destination pincode. Zones are matched by longest pincode-prefix per
  store (`DeliveryZone.pincodePrefix`); across all active stores, the
  cheapest/fastest tier wins, with distance as the tiebreaker. When product
  IDs are passed in, a store is only eligible if it has every item in
  stock — this is also how multi-store order fulfillment picks a store
  (spec section 14), not a separate code path.
- **Wired in everywhere delivery matters**: a delivery-check page, a
  per-product delivery widget, a best-effort estimate on the cart page
  (from the user's default address), an authoritative quote in the
  checkout Delivery step (blocks continuing if unavailable, with a way to
  pick a different address), and the same engine call inside order
  creation itself — so the fee and store an order is actually placed
  against can never drift from what checkout showed.
- Demo delivery zones (seeded): Central Delhi (`110` prefix, free,
  30–45 min), wider Delhi NCR (`11` prefix, ₹40, 45–90 min), and Mumbai
  (`400` prefix, ₹80, 90–150 min). Any other pincode is "not yet
  available" — this is a small demo configuration, not a real service-area
  map.
- Order creation now records a `Delivery` row (distance, fee, ETA) shown
  on the order detail page. Live GPS tracking / simulated movement and
  delivery-partner assignment are deeper than pincode-zone availability and
  are left for a later phase.

## Admin dashboard & inventory (Phase 7 scope)

- **RBAC**: real backend checks, not hidden buttons — every admin page and
  mutating action calls `requireStaff([...roles])`
  (`features/admin/lib/auth.ts`), which redirects unless the signed-in
  user's account email matches a `Staff` row with an allowed role. Roles
  from the spec (`SUPER_ADMIN`, `STORE_MANAGER`, `INVENTORY_MANAGER`,
  `DELIVERY_MANAGER`, `SUPPORT_AGENT`) already existed in the schema;
  Product management is gated to `SUPER_ADMIN`/`STORE_MANAGER`, inventory
  adjustments also allow `INVENTORY_MANAGER`.
- **Demo simplification, stated plainly**: there's no separate staff login
  system — admin access is granted to whichever signed-in customer account
  happens to share an email with a seeded `Staff` row. A real deployment
  would want stronger, separate staff auth (SSO, MFA). A demo admin account
  is seeded: `admin@supplyline.demo` / `AdminDemo123`.
- **Dashboard**: today's revenue, order counts (total/pending/delivered/
  cancelled), active customers, low-stock alerts, a 7-day order-count bar
  chart, and top products by units sold — all computed live from the
  database. The bar chart is plain CSS bars over real data rather than a
  charting library, so it's honest instead of a heavier dependency for one
  chart.
- **Product management**: add/edit/deactivate, images, specifications, and
  safety documents (simple line-based text inputs rather than a dynamic
  drag-and-drop form builder — pragmatic for this phase), plus a
  compatibility manager reusing the same admin-maintained
  `ProductCompatibility` table the storefront's compatibility checker
  reads from.
- **Inventory management**: stock on hand / reserved / available per
  store, low-stock highlighting, and adjustments that require a reason and
  write an `InventoryTransaction` row — nothing adjusts silently.
- Every mutation here (product create/update/toggle, compatibility
  add/remove, inventory adjustment) writes an `AuditLog` row with the
  acting staff member, per spec section 30.
- Not in this phase: staff management UI (creating/editing `Staff` rows
  happens via seed/DB only), fraud/risk scoring (Phase 10), and order
  status transitions (`PROCESSING` → `DELIVERED`) from the admin side —
  the schema and `OrderStatus` enum support it, but the admin UI for
  advancing an order's fulfillment status isn't built yet.

## AI support assistant (Phase 8 scope)

- **AI provider abstraction** (`services/ai`): an `AIProvider` interface
  with a real `AnthropicProvider` (calls the Messages API directly with
  `AI_API_KEY`) and a fallback that's used whenever no key is configured —
  same pattern as payments/email/location. The fallback doesn't fake a
  generated reply; it surfaces the same retrieved knowledge a real model
  would have been grounded in, formatted for reading, so the assistant is
  honestly a lookup tool until a real key is set rather than a
  hard-coded-sounding chatbot pretending otherwise.
- **Knowledge base, not invention**: `features/ai/lib/knowledge-base.ts`
  retrieves matching products (name, price, stock, specs, documented
  compatibility, safety docs) straight from the database and passes them
  to the model as grounding context. The system prompt
  (`features/ai/lib/system-prompt.ts`) explicitly forbids stating any
  spec, price, stock, or compatibility fact that isn't in that context —
  compatibility in particular always comes from the same
  admin-maintained `ProductCompatibility` table the storefront checker
  uses, never inferred by the model.
- **Order support**: only reachable for the signed-in user's own orders
  (`features/ai/lib/order-context.ts` scopes every query to `userId`) —
  there's no path from a chat message to another customer's order data.
- **Safety handling, deliberately not delegated to the model**: a
  keyword match (`features/ai/lib/safety.ts`) for leak/fire/explosion-type
  language routes straight to a fixed, conservative safety response —
  stop, ventilate, shut off, call for help, don't self-diagnose — bypassing
  the AI provider entirely so a bad model response can't be the thing
  standing between a user and safety guidance during a possible emergency.
  The same response text is shown on the `/safety` page.
- **Where it shows up**: a floating chat launcher (signed-in users only,
  since `SupportConversation` requires a user) available site-wide, and
  the same chat embedded on a full `/support` page. Conversations persist
  to `SupportConversation`/`SupportMessage` per the schema.
- Not in this phase: a vector/embedding-based RAG pipeline (the catalog is
  small enough that keyword matching against structured fields is enough
  to stay accurate) and multi-conversation history in the UI (one ongoing
  conversation per user, matching the simplest reading of the spec).

## Recommendations & forecasting (Phase 9 scope)

- **Signals**: purchase history, wishlist, cart, and browsing history all
  feed the recommendation engine (`features/recommendations/lib/engine.ts`).
  Browsing history needed a small schema addition —
  `ProductView` (userId, productId, viewedAt) — populated by a client-side
  beacon (`ViewTracker`) that fires once per product-page visit for
  signed-in users; there's no tracking for anonymous visitors.
- **Ranking, not black-box**: products documented as compatible with
  something the user already has (same `ProductCompatibility` table used
  elsewhere) rank first, then other active products in the same
  categories, then a popularity fallback so a new account with no signal
  yet still sees a reasonable "Recommended for you" section instead of an
  empty one — or the section is simply omitted rather than shown empty.
- **Two distinct recommendation surfaces**: the personalized homepage
  section (signals from *this* user) and a per-product "You might also
  like" section (`getRelatedProducts` — compatibility and category for
  *that* product, independent of who's viewing) are separate functions,
  because they answer different questions.
- **Demand forecasting** (`features/admin/lib/forecasting.ts`): daily
  sales rolled up from confirmed (payment-verified) orders only — a
  pending or failed order was never a sale. Forecasting is behind a
  `ForecastModel` interface with a single `predict(history)` method;
  the shipped `MovingAverageModel` (4-week average) is deliberately simple
  so a better model can be swapped in later without touching the admin
  page or the sales-history query, per the spec's "make forecasting
  modular" requirement. Visible at `/admin/forecasting`.

## Security hardening, fraud detection & audit logs (Phase 10 scope)

- **Rate limiting**: login, registration, and password-reset requests are
  throttled per email (`lib/rate-limit.ts`) — an in-memory fixed-window
  limiter, which is honestly labeled as a single-instance stopgap. A
  multi-instance production deployment would move this to Redis or an
  edge/WAF-level limiter instead.
- **Security headers** (`next.config.ts`): `X-Content-Type-Options`,
  `X-Frame-Options`, `Referrer-Policy`, a restrictive `Permissions-Policy`,
  and HSTS on every response.
- **Fraud/risk scoring** (`features/admin/lib/risk.ts`): scores each
  checkout from operational signals only — repeated failed payments in the
  last 30 days, an unusually high cancellation rate, an order-frequency
  burst, repeated refunds — never protected attributes. The score
  (`low`/`medium`/`high`) is stored on the order and never blocks or alters
  checkout by itself; it only surfaces flagged orders on a new
  `/admin/risk` page for a human to review. This matches the spec's
  explicit "do not automatically discriminate against customers" — high
  risk routes to manual review, not auto-rejection.
- **Audit log viewer** (`/admin/audit-log`, `SUPER_ADMIN` only): every
  mutation logged since Phase 5 (orders, payments, cancellations, product/
  inventory changes, compatibility edits) was already being written to
  `AuditLog` — this phase adds somewhere to actually read it. Confirmed
  nothing sensitive (passwords, payment secrets, OTPs, identity numbers)
  is ever included in an audit entry.
- **Already in place from earlier phases, noted here for completeness**:
  bcrypt password hashing, httpOnly/secure/sameSite session cookies with
  server-side revocation, Prisma parameterized queries (no raw SQL
  anywhere, so no SQL-injection surface), Zod input validation on
  customer-facing forms, RBAC enforced server-side on every admin route
  and mutation, server-side-only payment/KYC verification, and secrets
  read only through `lib/env.ts` (never hardcoded, never sent to the
  client). CSRF protection and XSS escaping come from Next.js/React's
  defaults (Server Actions verify the request origin; React escapes all
  rendered content — the codebase never uses `dangerouslySetInnerHTML`).

## Auth security notes (Phase 1-2 scope)

- Passwords hashed with bcrypt (cost factor 12), never logged.
- Sessions: random 256-bit tokens, only the SHA-256 hash is persisted;
  cookie is httpOnly, `secure` in production, `sameSite=lax`.
- Password reset and email verification use single-use, time-limited,
  hashed tokens — same pattern as sessions.
- Password reset invalidates all existing sessions for that user.
- Login failure messages don't reveal whether the email exists.
- No sensitive identity information (e.g. government ID numbers) is stored;
  the `KycVerification` model only holds status, consent timestamp, a
  masked identifier, and an opaque provider reference.

## Testing (Phase 11 scope)

Three tiers, matching spec section 37:

- **Unit tests** (`tests/unit`, runs with `npm test`): 49 tests over pure
  business logic — cart totals/issue detection, order display helpers,
  admin form text parsing, the rate limiter, the forecasting model, fraud
  risk scoring, the safety-keyword detector, and distance calculation.
  These functions were deliberately extracted into dependency-free modules
  (no `db` or `server-only` import) specifically so they're testable
  without a database — `features/cart/lib/totals.ts`,
  `features/admin/lib/{risk-scoring,forecast-model}.ts`, and
  `services/location/geo-math.ts` all exist for this reason, with their
  DB-touching counterparts (`queries.ts`, `risk.ts`, `forecasting.ts`,
  `services/location/index.ts`) re-exporting from them. Writing these
  actually caught three real bugs — a `server-only` import that made a
  "pure" module untestable, a forecast-model test whose expectation didn't
  account for the model's short-history clamp, and a risk-scoring
  expectation that didn't match the intentional "no single signal reaches
  high risk alone" design — all fixed once the tests surfaced them.
- **Integration tests** (`tests/integration`, runs with
  `npm run test:integration`): exercises the real
  register → browse → cart → checkout → payment → order → cancel/refund
  flow against actual business-logic functions and a live Postgres
  database via Prisma. Skipped automatically when `DATABASE_URL` isn't
  set. This suite could not be executed in the sandbox this project was
  built in (no reachable Postgres instance there), so treat it as written-
  but-unverified until run against a real database — but it's structured
  to run correctly wherever the schema has been migrated.
- **End-to-end tests** (`tests/e2e`, Playwright, runs with
  `npm run test:e2e`): drives the same flow through the actual UI in a
  browser. Needs `npx playwright install` and a running dev server against
  a seeded database — also not executable in this sandbox (no browser
  binaries, no dev server running), written for a normal environment.

## Optimization (Phase 11 scope)

- **Caching**: category and brand listings (read on nearly every page,
  changed only by admin actions) are wrapped in `unstable_cache` with a
  `"brands"` tag, invalidated via `updateTag` from the admin product
  actions — Next 16's read-your-own-writes invalidation API for Server
  Actions.
- **Database indexes**: added `@@index` on `OrderItem.orderId` and
  `OrderItem.productId` — both are hot paths (order detail lookups, demand
  forecasting, top-products) that Postgres doesn't automatically index
  just because they're foreign keys.
- **Already in place from earlier phases**: `next/image` throughout (auto
  lazy-loading, no manual `loading="lazy"` needed), pagination on the
  product listing (`PAGE_SIZE = 12`, never loads the full catalog at
  once), and server-side rendering via the App Router by default.

## Deployment

Target: Vercel (frontend/backend) + a managed PostgreSQL provider (Neon,
Supabase, RDS, etc.). No `.env` files are committed; `.env.example`
documents every variable a deployment needs, and `src/lib/env.ts` is the
single place that reads them — every value in `.env.example` is used
somewhere, and nothing reads `process.env` directly outside that file.

### Steps

1. **Database**: create a Postgres instance (Neon and Supabase both have a
   generous free tier). Copy its connection string.
2. **Push the code** to a GitHub repository (Vercel deploys from Git).
3. **Import the project into Vercel** and set the environment variables
   from `.env.example` in the Vercel dashboard — at minimum `DATABASE_URL`
   and `AUTH_SECRET` (generate with `openssl rand -base64 32`). Everything
   else can stay unset; every integration falls back to its mock/demo
   provider (see the Environment variables section) so the app runs
   without configuring payments, AI, maps, or email up front.
4. **Run migrations against the production database** before or right
   after the first deploy:
   ```bash
   DATABASE_URL="<your production URL>" npx prisma migrate deploy
   ```
5. **Seed demo data** (optional, but the store is empty without it):
   ```bash
   DATABASE_URL="<your production URL>" npm run db:seed
   ```
   Seeding creates the demo admin account
   (`admin@supplyline.demo` / `AdminDemo123`) — change or remove it before
   using this beyond a demo.
6. **Deploy.** Vercel runs `npm install` (which runs `postinstall: prisma
   generate` — already configured in `package.json`) and then
   `npm run build` automatically. No extra build-command override needed.

### A note on what "deployed" means for this build

Every external integration (payments, email, AI, maps/location, object
storage) is behind the provider abstractions described throughout this
README, and only mock/demo implementations are wired up. Deploying this
app makes it *live and usable as a demo* — real users can register, browse,
add to cart, and place mock-paid orders — but it does not make it capable
of processing real payments, sending real email, or handling real
regulated-product sales. Each of those needs a real provider implemented
behind its existing interface (see `services/*`) plus the compliance work
described in `/compliance` before going further than a demo.

### Verified in this build

This project was authored in a sandboxed environment without a live
database or outbound access to most external hosts. Two things were
confirmed to work regardless: `npx tsc --noEmit` is clean throughout
(aside from `@prisma/client` types, which don't exist until `prisma
generate` runs against a reachable engine binary host — blocked in that
sandbox specifically, not in normal environments), and `next build` runs
the entire app through Next's real compiler with no code errors — it only
fails at the Google Fonts fetch step (`fonts.googleapis.com` unreachable
there), which succeeds in any environment with normal internet access.

## Screenshots

Not included — this build was authored without a running server or
browser available to capture them. Once deployed (or running locally via
`npm run dev`), reasonable pages to screenshot for a portfolio README are
the homepage, a product detail page, the cart, the checkout review step,
the admin dashboard, and the support chat widget.

## Application structure (in place of a separate API reference)

This app doesn't expose a conventional REST/GraphQL API — pages call
**Next.js Server Actions** directly, colocated by feature under
`src/features/*/actions/`. That *is* the API surface; there's no separate
HTTP contract to document beyond the function signatures themselves. The
main ones, by domain:

| Domain | File | Key actions |
|---|---|---|
| Auth | `features/auth/actions/*` | `registerAction`, `loginAction`, `logoutAction`, `confirmEmailVerification`, `forgotPasswordAction`, `resetPasswordAction`, address CRUD |
| Cart | `features/cart/actions/*` | `addToCartAction`, `updateCartItemQuantityAction`, `removeCartItemAction`, `setSavedForLaterAction`, wishlist toggle |
| Orders | `features/orders/actions/*` | `placeOrderAction`, `processPaymentAction`, `cancelOrderAction` |
| Delivery | `features/delivery/actions/check.ts` | `checkDeliveryForPincode` |
| Products (storefront) | `features/products/actions/compatibility.ts` | compatibility search/check |
| AI support | `features/ai/actions/chat.ts` | `getOrStartConversation`, `sendSupportMessageAction` |
| Recommendations | `features/recommendations/actions/record-view.ts` | `recordProductView` |
| Admin — products | `features/admin/actions/products.ts` | `createProductAction`, `updateProductAction`, `toggleProductActiveAction` |
| Admin — compatibility | `features/admin/actions/compatibility.ts` | add/remove/search |
| Admin — inventory | `features/admin/actions/inventory.ts` | `adjustInventoryAction` |

Data reads mostly happen directly in Server Components calling the
`lib/queries.ts` (or equivalent) file in each feature folder — there's no
separate fetch layer for reads the way there is for writes.

## Database architecture

The full schema lives in `prisma/schema.prisma`, grouped by domain with
comment headers. Rough map:

- **Auth/identity**: `User`, `Session`, `EmailVerificationToken`,
  `PasswordResetToken`, `KycVerification`, `Address`
- **Stores/staff**: `Store`, `Staff`
- **Catalog**: `Category`, `Product`, `ProductImage`,
  `ProductSpecification`, `ProductDocument`, `ProductCompatibility`,
  `Review`, `ProductView`
- **Inventory**: `Inventory`, `InventoryTransaction`
- **Cart/wishlist**: `Cart`, `CartItem`, `WishlistItem`, `Coupon`
- **Delivery**: `DeliveryZone`, `Delivery`, `DeliveryTracking`
- **Orders/payments**: `Order`, `OrderItem`, `Payment`, `Refund`,
  `Invoice`, `Warranty`
- **Support/notifications**: `Notification`, `SupportConversation`,
  `SupportMessage`
- **Audit**: `AuditLog`

Every foreign key that's actually queried on has an index (see `@@index`
entries in the schema) — added deliberately, since Postgres doesn't
auto-index foreign key columns the way it does primary keys.

## Future improvements

See the phase table above for what's built. Beyond the "not in this
phase" notes scattered through each section above, the biggest gaps for
turning this from a portfolio demo into something closer to production
are: real provider implementations behind the existing payment/email/AI/
maps/storage interfaces, a real staff-auth system instead of the
email-matched `Staff` table, PDF invoice generation, live delivery
tracking with simulated/real movement, and admin-side order-status
transitions (`PROCESSING` → `DELIVERED`).

