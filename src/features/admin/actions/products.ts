"use server";

import { revalidatePath, updateTag } from "next/cache";
import { redirect } from "next/navigation";
import { db } from "@/lib/db";
import { requireStaff } from "@/features/admin/lib/auth";
import {
  parseSpecLines,
  parseDocumentLines,
  parseImageLines,
  slugify,
} from "@/features/admin/lib/product-form-parsing";

export interface ProductFormState {
  error?: string;
  fieldErrors?: Record<string, string>;
}

function readProductForm(formData: FormData) {
  return {
    name: String(formData.get("name") ?? "").trim(),
    slug: String(formData.get("slug") ?? "").trim() || slugify(String(formData.get("name") ?? "")),
    sku: String(formData.get("sku") ?? "").trim(),
    brand: String(formData.get("brand") ?? "").trim() || null,
    categoryId: String(formData.get("categoryId") ?? ""),
    description: String(formData.get("description") ?? "").trim(),
    price: Number(formData.get("price") ?? 0),
    discountPercent: Number(formData.get("discountPercent") ?? 0),
    warrantyMonths: Number(formData.get("warrantyMonths") ?? 0),
    eligibility: String(formData.get("eligibility") ?? "STANDARD") as "STANDARD" | "REGULATED",
    isActive: formData.get("isActive") === "on",
    images: parseImageLines(String(formData.get("imagesText") ?? "")),
    specs: parseSpecLines(String(formData.get("specsText") ?? "")),
    documents: parseDocumentLines(String(formData.get("documentsText") ?? "")),
  };
}

export async function createProductAction(
  _prev: ProductFormState,
  formData: FormData
): Promise<ProductFormState> {
  const { staff } = await requireStaff(["SUPER_ADMIN", "STORE_MANAGER"]);
  const data = readProductForm(formData);

  if (!data.name || !data.sku || !data.categoryId || !data.description) {
    return { error: "Name, SKU, category, and description are required." };
  }

  const existingSku = await db.product.findUnique({ where: { sku: data.sku } });
  if (existingSku) {
    return { fieldErrors: { sku: "A product with this SKU already exists." } };
  }

  const product = await db.product.create({
    data: {
      name: data.name,
      slug: data.slug,
      sku: data.sku,
      brand: data.brand,
      categoryId: data.categoryId,
      description: data.description,
      price: data.price,
      discountPercent: data.discountPercent,
      warrantyMonths: data.warrantyMonths,
      eligibility: data.eligibility,
      isActive: data.isActive,
      images: { create: data.images.map((url, i) => ({ url, sortOrder: i })) },
      specifications: { create: data.specs },
      documents: { create: data.documents },
    },
  });

  await db.auditLog.create({
    data: {
      staffId: staff.id,
      action: "product.created",
      resource: `product:${product.id}`,
      result: "success",
    },
  });

  revalidatePath("/admin/products");
  revalidatePath("/products");
  updateTag("brands");
  redirect(`/admin/products/${product.id}/edit`);
}

export async function updateProductAction(
  productId: string,
  _prev: ProductFormState,
  formData: FormData
): Promise<ProductFormState> {
  const { staff } = await requireStaff(["SUPER_ADMIN", "STORE_MANAGER"]);
  const data = readProductForm(formData);

  if (!data.name || !data.sku || !data.categoryId || !data.description) {
    return { error: "Name, SKU, category, and description are required." };
  }

  const existingSku = await db.product.findFirst({
    where: { sku: data.sku, id: { not: productId } },
  });
  if (existingSku) {
    return { fieldErrors: { sku: "Another product already uses this SKU." } };
  }

  await db.$transaction([
    db.product.update({
      where: { id: productId },
      data: {
        name: data.name,
        slug: data.slug,
        sku: data.sku,
        brand: data.brand,
        categoryId: data.categoryId,
        description: data.description,
        price: data.price,
        discountPercent: data.discountPercent,
        warrantyMonths: data.warrantyMonths,
        eligibility: data.eligibility,
        isActive: data.isActive,
      },
    }),
    db.productImage.deleteMany({ where: { productId } }),
    db.productImage.createMany({
      data: data.images.map((url, i) => ({ productId, url, sortOrder: i })),
    }),
    db.productSpecification.deleteMany({ where: { productId } }),
    db.productSpecification.createMany({
      data: data.specs.map((s) => ({ productId, ...s })),
    }),
    db.productDocument.deleteMany({ where: { productId } }),
    db.productDocument.createMany({
      data: data.documents.map((d) => ({ productId, ...d })),
    }),
    db.auditLog.create({
      data: {
        staffId: staff.id,
        action: "product.updated",
        resource: `product:${productId}`,
        result: "success",
      },
    }),
  ]);

  revalidatePath("/admin/products");
  revalidatePath(`/admin/products/${productId}/edit`);
  revalidatePath("/products");
  updateTag("brands");

  return {};
}

export async function toggleProductActiveAction(productId: string): Promise<void> {
  const { staff } = await requireStaff(["SUPER_ADMIN", "STORE_MANAGER"]);

  const product = await db.product.findUniqueOrThrow({ where: { id: productId } });
  await db.product.update({ where: { id: productId }, data: { isActive: !product.isActive } });

  await db.auditLog.create({
    data: {
      staffId: staff.id,
      action: product.isActive ? "product.deactivated" : "product.activated",
      resource: `product:${productId}`,
      result: "success",
    },
  });

  revalidatePath("/admin/products");
  revalidatePath("/products");
  updateTag("brands");
}
