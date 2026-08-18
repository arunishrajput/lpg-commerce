import type { NextConfig } from "next";

const securityHeaders = [
  // Prevents the browser from guessing content types away from what the
  // server declared — blocks a class of MIME-sniffing based XSS.
  { key: "X-Content-Type-Options", value: "nosniff" },
  // Blocks the site from being framed by another origin (clickjacking).
  { key: "X-Frame-Options", value: "DENY" },
  // Limits how much referrer info leaks to other origins on navigation.
  { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
  // Opts out of browser features this app doesn't use.
  { key: "Permissions-Policy", value: "camera=(), microphone=(), geolocation=()" },
  // HSTS — only meaningful once actually served over HTTPS in production.
  { key: "Strict-Transport-Security", value: "max-age=63072000; includeSubDomains" },
];

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      // Seed data uses Unsplash placeholder photography. A real deployment
      // would point this at its object storage domain (see src/services/storage).
      { protocol: "https", hostname: "images.unsplash.com" },
    ],
  },
  async headers() {
    return [{ source: "/:path*", headers: securityHeaders }];
  },
};

export default nextConfig;
