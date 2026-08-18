"use client";

import { useState, useTransition } from "react";
import { getOrStartConversation } from "@/features/ai/actions/chat";
import { ChatPanel } from "@/features/ai/components/chat-panel";

export function SupportWidget() {
  const [open, setOpen] = useState(false);
  const [conversation, setConversation] = useState<Awaited<ReturnType<typeof getOrStartConversation>> | null>(
    null
  );
  const [pending, startTransition] = useTransition();

  function handleOpen() {
    setOpen(true);
    if (!conversation) {
      startTransition(async () => {
        setConversation(await getOrStartConversation());
      });
    }
  }

  return (
    <div className="fixed bottom-5 right-5 z-50">
      {open && (
        <div className="mb-3 flex h-[28rem] w-80 flex-col overflow-hidden rounded-2xl border border-line bg-surface shadow-lg">
          <div className="flex items-center justify-between border-b border-line px-4 py-3">
            <p className="text-sm font-medium text-ink">Support</p>
            <button
              type="button"
              onClick={() => setOpen(false)}
              aria-label="Close support chat"
              className="text-ink-soft hover:text-ink"
            >
              ✕
            </button>
          </div>
          <div className="flex-1 overflow-hidden">
            {pending || !conversation ? (
              <div className="flex h-full items-center justify-center text-sm text-ink-soft">
                Loading…
              </div>
            ) : (
              <ChatPanel conversationId={conversation.id} initialMessages={conversation.messages} />
            )}
          </div>
        </div>
      )}

      <button
        type="button"
        onClick={() => (open ? setOpen(false) : handleOpen())}
        aria-label={open ? "Close support chat" : "Open support chat"}
        className="flex h-14 w-14 items-center justify-center rounded-full bg-brand text-white shadow-lg transition-colors hover:bg-brand-deep"
      >
        {open ? "✕" : "💬"}
      </button>
    </div>
  );
}
