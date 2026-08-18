"use client";

import { useState, useTransition, useRef, useEffect } from "react";
import { sendSupportMessageAction } from "@/features/ai/actions/chat";
import { Button } from "@/components/ui/button";

interface ChatMessage {
  id: string;
  role: string;
  content: string;
}

const CATEGORY_PROMPTS = [
  "What burner should I choose?",
  "Is this compatible with my stove?",
  "Where is my order?",
  "Do you deliver to my area?",
  "My payment failed.",
  "Can I cancel my order?",
];

export function ChatPanel({
  conversationId,
  initialMessages,
}: {
  conversationId: string;
  initialMessages: ChatMessage[];
}) {
  const [messages, setMessages] = useState(initialMessages);
  const [input, setInput] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight });
  }, [messages]);

  function send(text: string) {
    const trimmed = text.trim();
    if (!trimmed || pending) return;
    setError(null);
    setInput("");

    setMessages((prev) => [...prev, { id: `pending-${Date.now()}`, role: "user", content: trimmed }]);

    startTransition(async () => {
      const result = await sendSupportMessageAction(conversationId, trimmed);
      if (result.error) {
        setError(result.error);
      } else if (result.messages) {
        setMessages(result.messages);
      }
    });
  }

  return (
    <div className="flex h-full flex-col">
      <div ref={scrollRef} className="flex-1 space-y-3 overflow-y-auto p-4">
        {messages.length === 0 && (
          <div>
            <p className="text-sm text-ink-soft">
              Ask about products, compatibility, orders, delivery, payment, or cancellations.
            </p>
            <div className="mt-3 flex flex-wrap gap-2">
              {CATEGORY_PROMPTS.map((prompt) => (
                <button
                  key={prompt}
                  type="button"
                  onClick={() => send(prompt)}
                  className="rounded-full border border-line px-3 py-1.5 text-xs text-ink-soft hover:border-brand hover:text-ink"
                >
                  {prompt}
                </button>
              ))}
            </div>
          </div>
        )}

        {messages.map((m) => (
          <div
            key={m.id}
            className={`max-w-[85%] rounded-2xl px-3.5 py-2.5 text-sm whitespace-pre-wrap ${
              m.role === "user"
                ? "ml-auto bg-brand text-white"
                : "bg-paper text-ink border border-line"
            }`}
          >
            {m.content}
          </div>
        ))}

        {pending && (
          <div className="max-w-[85%] rounded-2xl border border-line bg-paper px-3.5 py-2.5 text-sm text-ink-soft">
            Thinking…
          </div>
        )}
      </div>

      {error && <p className="px-4 text-sm text-danger">{error}</p>}

      <form
        onSubmit={(e) => {
          e.preventDefault();
          send(input);
        }}
        className="flex gap-2 border-t border-line p-3"
      >
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Type a message…"
          className="w-full rounded-full border border-line bg-paper px-4 py-2 text-sm text-ink placeholder:text-ink-soft/60 focus:border-brand focus:outline-none"
        />
        <Button type="submit" disabled={pending || !input.trim()}>
          Send
        </Button>
      </form>
    </div>
  );
}
