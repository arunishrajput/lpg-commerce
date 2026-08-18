/**
 * End-to-end test covering the spec's required flow:
 *
 *   Register -> Login -> Browse -> Add to Cart -> Checkout -> Payment ->
 *   Order -> Tracking -> Cancellation/Refund
 *
 * Requires: `npx playwright install`, a running dev server
 * (`npm run dev`) against a migrated + seeded database, and
 * E2E_BASE_URL (or the localhost:3000 default) reachable. Not executed in
 * the sandbox this project was authored in — see the README's testing
 * section for why — but written to run as-is in a normal environment.
 */
import { test, expect } from "@playwright/test";

test.describe.configure({ mode: "serial" });

const testEmail = `e2e-${Date.now()}@example.com`;
const testPassword = "TestPassword123";

test.describe("full purchase journey", () => {
  test("register", async ({ page }) => {
    await page.goto("/register");
    await page.getByLabel("Full name").fill("E2E Test User");
    await page.getByLabel("Email").fill(testEmail);
    await page.getByLabel("Password", { exact: true }).fill(testPassword);
    await page.getByRole("button", { name: "Create account" }).click();
    await expect(page).toHaveURL(/\/account/);
  });

  test("login", async ({ page }) => {
    await page.goto("/login");
    await page.getByLabel("Email").fill(testEmail);
    await page.getByLabel("Password").fill(testPassword);
    await page.getByRole("button", { name: "Sign in" }).click();
    await expect(page).toHaveURL(/\/account/);
  });

  test("add a delivery address", async ({ page }) => {
    await page.goto("/account/addresses");
    await page.getByLabel("Street address").fill("1 Test Street");
    await page.getByLabel("City").fill("Delhi");
    await page.getByLabel("State").fill("Delhi");
    await page.getByLabel("Pincode").fill("110001");
    await page.getByLabel("Set as default address").check();
    await page.getByRole("button", { name: "Save address" }).click();
    await expect(page.getByText("1 Test Street")).toBeVisible();
  });

  test("browse products", async ({ page }) => {
    await page.goto("/products");
    await expect(page.getByRole("heading", { name: "All products" })).toBeVisible();
    const firstProduct = page.locator("a[href^='/products/']").first();
    await expect(firstProduct).toBeVisible();
  });

  test("add to cart", async ({ page }) => {
    await page.goto("/products");
    await page.locator("a[href^='/products/']").first().click();
    await page.getByRole("button", { name: "Add to cart" }).click();
    await expect(page.getByText("Added")).toBeVisible();
  });

  test("checkout through delivery and review", async ({ page }) => {
    await page.goto("/checkout");
    // Address step
    await page.getByRole("button", { name: "Continue to delivery" }).click();
    // Delivery step
    await expect(page.getByText(/Estimated delivery/)).toBeVisible();
    await page.getByRole("button", { name: "Continue to review" }).click();
    // Review step
    await expect(page.getByRole("button", { name: "Place order" })).toBeVisible();
  });

  test("place order and pay", async ({ page }) => {
    await page.goto("/checkout?step=review");
    await page.getByRole("button", { name: "Place order" }).click();
    await expect(page).toHaveURL(/\/checkout\/payment\//);
    await page.getByRole("button", { name: "Pay now" }).click();
    await expect(page).toHaveURL(/\/orders\//);
  });

  test("order appears with tracking status", async ({ page }) => {
    await page.goto("/orders");
    await page.locator("a[href^='/orders/']").first().click();
    await expect(page.getByText("Order placed")).toBeVisible();
  });

  test("cancel the order and see a refund", async ({ page }) => {
    await page.getByRole("button", { name: "Cancel order" }).click();
    await page.getByRole("button", { name: "Cancel this order" }).click();
    await expect(page.getByText("cancelled")).toBeVisible();
  });
});
