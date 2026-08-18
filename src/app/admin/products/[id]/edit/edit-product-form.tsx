"use client";

import { useActionState } from "react";
import { updateProductAction, type ProductFormState } from "@/features/admin/actions/products";
import { ProductForm, type ProductFormDefaults } from "@/features/admin/components/product-form";
import type { Category } from "@prisma/client";

const initialState: ProductFormState = {};

export function EditProductForm({
  productId,
  categories,
  defaults,
}: {
  productId: string;
  categories: Category[];
  defaults: ProductFormDefaults;
}) {
  const boundAction = updateProductAction.bind(null, productId);
  const [state, formAction, pending] = useActionState(boundAction, initialState);

  return (
    <ProductForm
      categories={categories}
      defaults={defaults}
      formAction={formAction}
      pending={pending}
      state={state}
      submitLabel="Save changes"
    />
  );
}
