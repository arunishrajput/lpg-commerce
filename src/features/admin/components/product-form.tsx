"use client";

import type { Category } from "@prisma/client";
import { Field, TextInput } from "@/components/ui/field";
import { Button } from "@/components/ui/button";
import type { ProductFormState } from "@/features/admin/actions/products";

export interface ProductFormDefaults {
  name: string;
  slug: string;
  sku: string;
  brand: string;
  categoryId: string;
  description: string;
  price: number;
  discountPercent: number;
  warrantyMonths: number;
  eligibility: "STANDARD" | "REGULATED";
  isActive: boolean;
  imagesText: string;
  specsText: string;
  documentsText: string;
}

export function ProductForm({
  categories,
  defaults,
  formAction,
  pending,
  state,
  submitLabel,
}: {
  categories: Category[];
  defaults: ProductFormDefaults;
  formAction: (formData: FormData) => void;
  pending: boolean;
  state: ProductFormState;
  submitLabel: string;
}) {
  return (
    <form action={formAction} className="space-y-5">
      {state.error && (
        <p className="rounded-lg bg-danger/10 px-3 py-2 text-sm text-danger" role="alert">
          {state.error}
        </p>
      )}

      <div className="grid gap-4 sm:grid-cols-2">
        <Field label="Name" htmlFor="name">
          <TextInput id="name" name="name" required defaultValue={defaults.name} />
        </Field>
        <Field label="Slug (auto if left blank)" htmlFor="slug">
          <TextInput id="slug" name="slug" defaultValue={defaults.slug} />
        </Field>
        <Field label="SKU" htmlFor="sku" error={state.fieldErrors?.sku}>
          <TextInput id="sku" name="sku" required defaultValue={defaults.sku} />
        </Field>
        <Field label="Brand" htmlFor="brand">
          <TextInput id="brand" name="brand" defaultValue={defaults.brand} />
        </Field>
      </div>

      <Field label="Category" htmlFor="categoryId">
        <select
          id="categoryId"
          name="categoryId"
          required
          defaultValue={defaults.categoryId}
          className="w-full rounded-lg border border-line bg-surface px-3.5 py-2.5 text-sm text-ink"
        >
          <option value="">Select a category</option>
          {categories.map((c) => (
            <option key={c.id} value={c.id}>
              {c.name}
            </option>
          ))}
        </select>
      </Field>

      <Field label="Description" htmlFor="description">
        <textarea
          id="description"
          name="description"
          required
          rows={3}
          defaultValue={defaults.description}
          className="w-full rounded-lg border border-line bg-surface px-3.5 py-2.5 text-sm text-ink focus:border-brand focus:outline-none"
        />
      </Field>

      <div className="grid gap-4 sm:grid-cols-3">
        <Field label="Price (₹)" htmlFor="price">
          <TextInput id="price" name="price" type="number" step="0.01" min={0} required defaultValue={defaults.price} />
        </Field>
        <Field label="Discount (%)" htmlFor="discountPercent">
          <TextInput
            id="discountPercent"
            name="discountPercent"
            type="number"
            min={0}
            max={90}
            defaultValue={defaults.discountPercent}
          />
        </Field>
        <Field label="Warranty (months)" htmlFor="warrantyMonths">
          <TextInput
            id="warrantyMonths"
            name="warrantyMonths"
            type="number"
            min={0}
            defaultValue={defaults.warrantyMonths}
          />
        </Field>
      </div>

      <Field label="Eligibility" htmlFor="eligibility">
        <select
          id="eligibility"
          name="eligibility"
          defaultValue={defaults.eligibility}
          className="w-full rounded-lg border border-line bg-surface px-3.5 py-2.5 text-sm text-ink"
        >
          <option value="STANDARD">Standard</option>
          <option value="REGULATED">Regulated</option>
        </select>
      </Field>

      <label className="flex items-center gap-2 text-sm text-ink-soft">
        <input type="checkbox" name="isActive" defaultChecked={defaults.isActive} className="rounded border-line" />
        Active (visible in the store)
      </label>

      <Field label="Image URLs (one per line)" htmlFor="imagesText">
        <textarea
          id="imagesText"
          name="imagesText"
          rows={3}
          defaultValue={defaults.imagesText}
          placeholder="https://…"
          className="w-full rounded-lg border border-line bg-surface px-3.5 py-2.5 font-mono text-xs text-ink focus:border-brand focus:outline-none"
        />
      </Field>

      <Field label="Specifications (one per line, Label: Value)" htmlFor="specsText">
        <textarea
          id="specsText"
          name="specsText"
          rows={4}
          defaultValue={defaults.specsText}
          placeholder="Burner count: 2"
          className="w-full rounded-lg border border-line bg-surface px-3.5 py-2.5 font-mono text-xs text-ink focus:border-brand focus:outline-none"
        />
      </Field>

      <Field label="Documents (one per line, Title | URL)" htmlFor="documentsText">
        <textarea
          id="documentsText"
          name="documentsText"
          rows={3}
          defaultValue={defaults.documentsText}
          placeholder="Safety manual | https://…"
          className="w-full rounded-lg border border-line bg-surface px-3.5 py-2.5 font-mono text-xs text-ink focus:border-brand focus:outline-none"
        />
      </Field>

      <Button type="submit" disabled={pending}>
        {pending ? "Saving…" : submitLabel}
      </Button>
    </form>
  );
}
