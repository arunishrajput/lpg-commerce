import type { Metadata } from "next";

import "./globals.css";
import { SiteHeader } from "@/components/layout/site-header";
import { SiteFooter } from "@/components/layout/site-footer";
import { SupportWidget } from "@/features/ai/components/support-widget";
import { getCurrentUser } from "@/features/auth/lib/session";

export const metadata: Metadata = {
  title: "Supply Line — LPG & Kitchen Equipment",
  description:
    "Burners, regulators, hoses and kitchen equipment, delivered with checked compatibility and tracked delivery.",
};

export default async function RootLayout({ children }: LayoutProps<"/">) {
  const user = await getCurrentUser();

  return (
    <html lang="en" className="h-full antialiased">
      <body className="min-h-full flex flex-col bg-paper text-ink">
        <SiteHeader />
        <main className="flex-1">{children}</main>
        <SiteFooter />
        {user && <SupportWidget />}
      </body>
    </html>
  );
}