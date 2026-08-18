import { redirect } from "next/navigation";
import { getCurrentUser } from "@/features/auth/lib/session";
import { getOrStartConversation } from "@/features/ai/actions/chat";
import { ChatPanel } from "@/features/ai/components/chat-panel";
import { isMockAIActive } from "@/services/ai";

export default async function SupportPage() {
  const user = await getCurrentUser();
  if (!user) redirect("/login?next=/support");

  const conversation = await getOrStartConversation();
  const mockActive = isMockAIActive();

  return (
    <div className="mx-auto max-w-2xl px-4 py-10 sm:px-6">
      <h1 className="font-display text-2xl font-semibold text-ink">Support</h1>
      <p className="mt-1 text-sm text-ink-soft">
        Ask about products, compatibility, orders, delivery, payment, or cancellations.
      </p>

      {mockActive && (
        <p className="mt-3 rounded-lg bg-warn/10 px-3 py-2 text-xs text-warn">
          AI_API_KEY isn&apos;t configured, so answers are looked up directly from
          the product/order data rather than generated. Set AI_API_KEY to enable
          conversational answers.
        </p>
      )}

      <div className="mt-6 h-[32rem] overflow-hidden rounded-2xl border border-line bg-surface">
        <ChatPanel conversationId={conversation.id} initialMessages={conversation.messages} />
      </div>

      <p className="mt-4 text-xs text-ink-soft">
        For a suspected gas leak or other emergency, don&apos;t rely on chat —
        follow the safety steps on our{" "}
        <a href="/safety" className="text-brand hover:underline">
          safety page
        </a>{" "}
        and contact emergency services if needed.
      </p>
    </div>
  );
}
