import { notFound } from "next/navigation";
import { requireStaff } from "@/features/admin/lib/auth";
import { db } from "@/lib/db";
import { EditProductForm } from "./edit-product-form";
import { CompatibilityManager } from "@/features/admin/components/compatibility-manager";
import { specsToLines, documentsToLines } from "@/features/admin/lib/product-form-parsing";

export default async function EditProductPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  await requireStaff(["SUPER_ADMIN", "STORE_MANAGER"]);
  const { id } = await params;

  const [product, categories] = await Promise.all([
    db.product.findUnique({
      where: { id },
      include: {
        images: { orderBy: { sortOrder: "asc" } },
        specifications: true,
        documents: true,
        compatibleWith: { include: { compatible: { select: { name: true } } } },
      },
    }),
    db.category.findMany({ orderBy: { name: "asc" } }),
  ]);

  if (!product) notFound();

  const defaults = {
    name: product.name,
    slug: product.slug,
    sku: product.sku,
    brand: product.brand ?? "",
    categoryId: product.categoryId,
    description: product.description,
    price: Number(product.price),
    discountPercent: product.discountPercent,
    warrantyMonths: product.warrantyMonths,
    eligibility: product.eligibility,
    isActive: product.isActive,
    imagesText: product.images.map((i) => i.url).join("\n"),
    specsText: specsToLines(product.specifications),
    documentsText: documentsToLines(product.documents),
  };

  return (
    <div className="grid gap-6 lg:grid-cols-[1fr_320px]">
      <div>
        <h2 className="font-display text-xl font-semibold text-ink">Edit product</h2>
        <div className="mt-4 rounded-xl border border-line bg-surface p-6">
          <EditProductForm productId={product.id} categories={categories} defaults={defaults} />
        </div>
      </div>

      <div>
        <CompatibilityManager
          productId={product.id}
          initial={product.compatibleWith.map((c) => ({
            compatibleId: c.compatibleId,
            name: c.compatible.name,
            note: c.note,
          }))}
        />
      </div>
    </div>
  );
}
