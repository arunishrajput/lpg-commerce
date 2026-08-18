import "server-only";
import { env } from "@/lib/env";

export interface PaymentInitiation {
  providerRef: string;
  /** What the client needs to complete payment. Mock provider returns a
   *  local confirmation URL; a real provider would return a redirect URL
   *  or client secret here instead. */
  redirectUrl: string;
}

export interface PaymentVerification {
  status: "success" | "failed" | "pending";
  providerRef: string;
}

export interface PaymentProvider {
  initiate(params: { orderId: string; amount: number; method: string }): Promise<PaymentInitiation>;
  /** Server-side verification — the only source of truth for payment status.
   *  Frontend-reported success is never trusted on its own. */
  verify(providerRef: string): Promise<PaymentVerification>;
}

/**
 * Demo/dev provider. Deterministic: succeeds unless the reference contains
 * "FAIL", so the failure path (see /checkout/payment) is reachable without
 * randomness making the demo flaky.
 */
class MockPaymentProvider implements PaymentProvider {
  async initiate({ orderId }: { orderId: string; amount: number; method: string }) {
    const providerRef = `mock_${orderId}_${Date.now()}`;
    return { providerRef, redirectUrl: `/checkout/payment/${orderId}?ref=${providerRef}` };
  }

  async verify(providerRef: string): Promise<PaymentVerification> {
    const status = providerRef.includes("FAIL") ? "failed" : "success";
    return { status, providerRef };
  }
}

// A real integration (Razorpay, Stripe, ...) would implement PaymentProvider
// and get selected here based on env.PAYMENT_PROVIDER(). Only the mock is
// wired up for this demo build — never expose provider secret keys to the
// frontend regardless of which provider is active.
function getProvider(): PaymentProvider {
  const provider = env.PAYMENT_PROVIDER();
  switch (provider) {
    case "mock":
    default:
      return new MockPaymentProvider();
  }
}

export async function initiatePayment(params: { orderId: string; amount: number; method: string }) {
  return getProvider().initiate(params);
}

export async function verifyPayment(providerRef: string) {
  return getProvider().verify(providerRef);
}
