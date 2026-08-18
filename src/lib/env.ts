// Centralized, validated access to environment variables.
// Never read process.env directly elsewhere — import from here instead,
// so every required secret is documented and checked in one place.

function required(name: string): string {
  const value = process.env[name];
  if (!value) {
    throw new Error(
      `Missing required environment variable: ${name}. See .env.example.`
    );
  }
  return value;
}

function optional(name: string, fallback = ""): string {
  return process.env[name] ?? fallback;
}

export const env = {
  DATABASE_URL: () => required("DATABASE_URL"),
  AUTH_SECRET: () => required("AUTH_SECRET"),

  // Payments — provider-agnostic; falls back to mock mode when unset.
  PAYMENT_PROVIDER: () => optional("PAYMENT_PROVIDER", "mock"),
  PAYMENT_KEY: () => optional("PAYMENT_KEY"),
  PAYMENT_SECRET: () => optional("PAYMENT_SECRET"),

  // AI assistant
  AI_PROVIDER: () => optional("AI_PROVIDER", "anthropic"),
  AI_API_KEY: () => optional("AI_API_KEY"),
  AI_MODEL: () => optional("AI_MODEL", "claude-sonnet-4-5"),

  // Location / maps
  MAPS_PROVIDER: () => optional("MAPS_PROVIDER", "mock"),
  MAPS_API_KEY: () => optional("MAPS_API_KEY"),

  // Email
  EMAIL_PROVIDER: () => optional("EMAIL_PROVIDER", "mock"),
  EMAIL_API_KEY: () => optional("EMAIL_API_KEY"),

  // Object storage
  STORAGE_PROVIDER: () => optional("STORAGE_PROVIDER", "mock"),
  STORAGE_BUCKET: () => optional("STORAGE_BUCKET"),

  APP_URL: () => optional("APP_URL", "http://localhost:3000"),
};
