"use client";

import { useActionState } from "react";
import { createProductAction, type ProductFormState } from "@/features/admin/actions/products";
import { ProductForm } from "@/features/admin/components/product-form";
import type { Category } from "@prisma/client";

const initialState: ProductFormState = {};

const EMPTY_DEFAULTS = {
  name: "",
  slug: "",
  sku: "",
  brand: "",
  categoryId: "",
  description: "",
  price: 0,
  discountPercent: 0,
  warrantyMonths: 0,
  eligibility: "STANDARD" as const,
  isActive: true,
  imagesText: "",
  specsText: "",
  documentsText: "",
};

export function NewProductForm({ categories }: { categories: Category[] }) {
  const [state, formAction, pending] = useActionState(createProductAction, initialState);

  return (
    <ProductForm
      categories={categories}
      defaults={EMPTY_DEFAULTS}
      formAction={formAction}
      pending={pending}
      state={state}
      submitLabel="Create product"
    />
  );
}
