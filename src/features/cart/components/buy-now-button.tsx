"use client";

import { useTransition } from "react";
import { useRouter } from "next/navigation";
import { addToCartAction } from "@/features/cart/actions/cart";
import { Button } from "@/components/ui/button";

export function BuyNowButton({ productId, disabled }: { productId: string; disabled?: boolean }) {
  const [pending, startTransition] = useTransition();
  const router = useRouter();

  return (
    <Button
      variant="secondary"
      disabled={disabled || pending}
      onClick={() =>
        startTransition(async () => {
          await addToCartAction(productId, 1);
          router.push("/checkout");
        })
      }
    >
      {pending ? "Preparing…" : "Buy now"}
    </Button>
  );
}
