"use server";

import { revalidatePath } from "next/cache";
import { db } from "@/lib/db";
import { requireUser } from "@/features/auth/lib/session";
import { completeChat } from "@/services/ai";
import { SUPPORT_SYSTEM_PROMPT } from "@/features/ai/lib/system-prompt";
import { retrieveProductContext } from "@/features/ai/lib/knowledge-base";
import { retrieveOrderContext, mentionsOrder } from "@/features/ai/lib/order-context";
import { isSafetyCritical, SAFETY_ESCALATION_RESPONSE } from "@/features/ai/lib/safety";

const MAX_MESSAGE_LENGTH = 1000;

export async function getOrStartConversation(): Promise<{ id: string; messages: { id: string; role: string; content: string }[] }> {
  const user = await requireUser();

  let conversation = await db.supportConversation.findFirst({
    where: { userId: user.id },
    orderBy: { createdAt: "desc" },
    include: { messages: { orderBy: { createdAt: "asc" } } },
  });

  if (!conversation) {
    conversation = await db.supportConversation.create({
      data: { userId: user.id, category: "general" },
      include: { messages: true },
    });
  }

  return {
    id: conversation.id,
    messages: conversation.messages.map((m) => ({ id: m.id, role: m.role, content: m.content })),
  };
}

export async function sendSupportMessageAction(
  conversationId: string,
  rawMessage: string
): Promise<{ error?: string; messages?: { id: string; role: string; content: string }[] }> {
  const user = await requireUser();
  const message = rawMessage.trim().slice(0, MAX_MESSAGE_LENGTH);

  if (!message) {
    return { error: "Type a message first." };
  }

  const conversation = await db.supportConversation.findFirst({
    where: { id: conversationId, userId: user.id },
    include: { messages: { orderBy: { createdAt: "asc" } } },
  });
  if (!conversation) {
    return { error: "Conversation not found." };
  }

  await db.supportMessage.create({
    data: { conversationId, role: "user", content: message },
  });

  let replyContent: string;

  if (isSafetyCritical(message)) {
    replyContent = SAFETY_ESCALATION_RESPONSE;
  } else {
    const [productContext, orderContext] = await Promise.all([
      retrieveProductContext(message),
      mentionsOrder(message) ? retrieveOrderContext(user.id) : Promise.resolve(""),
    ]);

    const context = [
      productContext ? `Product catalog matches:\n${productContext}` : "",
      orderContext ? `This customer's recent orders:\n${orderContext}` : "",
    ]
      .filter(Boolean)
      .join("\n\n");

    const history = [...conversation.messages, { role: "user" as const, content: message }].map((m) => ({
      role: m.role === "assistant" ? ("assistant" as const) : ("user" as const),
      content: m.content,
    }));

    try {
      replyContent = await completeChat({
        system: SUPPORT_SYSTEM_PROMPT,
        context,
        messages: history,
      });
    } catch {
      replyContent =
        "Sorry, I couldn't reach the support assistant just now. Please try again in a moment, or reach out through order support directly.";
    }
  }

  await db.supportMessage.create({
    data: { conversationId, role: "assistant", content: replyContent },
  });

  const updated = await db.supportMessage.findMany({
    where: { conversationId },
    orderBy: { createdAt: "asc" },
  });

  revalidatePath("/support");

  return { messages: updated.map((m) => ({ id: m.id, role: m.role, content: m.content })) };
}
