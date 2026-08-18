import "server-only";
import { env } from "@/lib/env";

export interface AIMessage {
  role: "user" | "assistant";
  content: string;
}

export interface AICompletionParams {
  /** Assistant persona and behavior rules. */
  system: string;
  /** Retrieved knowledge (product data, order info) to ground the answer in. */
  context: string;
  messages: AIMessage[];
}

export interface AIProvider {
  complete(params: AICompletionParams): Promise<string>;
}

/**
 * Real provider — calls the Anthropic Messages API directly. Requires
 * AI_API_KEY to be set; never call this with the key exposed to the
 * frontend, and never log the key.
 */
class AnthropicProvider implements AIProvider {
  constructor(private apiKey: string, private model: string) {}

  async complete({ system, context, messages }: AICompletionParams): Promise<string> {
    const fullSystem = context ? `${system}\n\nRelevant information:\n${context}` : system;

    const response = await fetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      headers: {
        "content-type": "application/json",
        "x-api-key": this.apiKey,
        "anthropic-version": "2023-06-01",
      },
      body: JSON.stringify({
        model: this.model,
        max_tokens: 800,
        system: fullSystem,
        messages: messages.map((m) => ({ role: m.role, content: m.content })),
      }),
    });

    if (!response.ok) {
      throw new Error(`AI provider request failed: ${response.status}`);
    }

    const data = await response.json();
    const textBlock = data.content?.find((b: { type: string }) => b.type === "text");
    return textBlock?.text ?? "I wasn't able to generate a response — please try again.";
  }
}

/**
 * Fallback used whenever no AI_API_KEY is configured, so the support
 * assistant still works out of the box in the demo. Rather than faking a
 * generated answer, it surfaces the same retrieved knowledge a real LLM
 * would have been grounded in, formatted for reading — honest about being
 * a lookup, not a conversation, until a real key is configured.
 */
class MockAIProvider implements AIProvider {
  async complete({ context }: AICompletionParams): Promise<string> {
    if (context) {
      return (
        "AI_API_KEY isn't configured, so here's the relevant information from " +
        "the store's knowledge base directly, rather than a generated answer:\n\n" +
        context
      );
    }

    return (
      "AI_API_KEY isn't configured, so I can't generate a free-form answer. " +
      "I can look up product details, compatibility, order status, delivery, " +
      "payment, and cancellation questions — try naming a product or an order."
    );
  }
}

function getProvider(): AIProvider {
  const apiKey = env.AI_API_KEY();
  const model = env.AI_MODEL();

  // Falls back to the mock even when AI_PROVIDER=anthropic if no key is
  // configured — the same pattern used by payments/email/location so the
  // demo runs without any provider setup.
  if (!apiKey) return new MockAIProvider();

  switch (env.AI_PROVIDER()) {
    case "anthropic":
    default:
      return new AnthropicProvider(apiKey, model);
  }
}

export async function completeChat(params: AICompletionParams): Promise<string> {
  return getProvider().complete(params);
}

export function isMockAIActive(): boolean {
  return !env.AI_API_KEY();
}
