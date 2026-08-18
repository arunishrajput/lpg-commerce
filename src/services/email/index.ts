import "server-only";
import { env } from "@/lib/env";

interface EmailMessage {
  to: string;
  subject: string;
  body: string;
}

interface EmailProvider {
  send(message: EmailMessage): Promise<{ success: boolean; providerRef?: string }>;
}

/** Demo/dev provider — never sends real email, just records intent. */
class MockEmailProvider implements EmailProvider {
  async send(message: EmailMessage) {
    console.log(`[mock-email] to=${message.to} subject="${message.subject}"`);
    console.log(message.body);
    return { success: true, providerRef: `mock_${Date.now()}` };
  }
}

// Real providers (Resend, SendGrid, SES, ...) would implement EmailProvider
// and get selected here based on env.EMAIL_PROVIDER(). Only the mock is
// wired up for this demo build.
function getProvider(): EmailProvider {
  const provider = env.EMAIL_PROVIDER();
  switch (provider) {
    case "mock":
    default:
      return new MockEmailProvider();
  }
}

export async function sendEmail(message: EmailMessage) {
  return getProvider().send(message);
}

export function verificationEmailBody(link: string) {
  return `Confirm your email to finish setting up your Supply Line account.\n\nVerify: ${link}\n\nThis link expires in 24 hours. If you didn't create this account, you can ignore this email.`;
}

export function passwordResetEmailBody(link: string) {
  return `We received a request to reset your Supply Line password.\n\nReset it: ${link}\n\nThis link expires in 1 hour. If you didn't request this, you can ignore this email.`;
}
