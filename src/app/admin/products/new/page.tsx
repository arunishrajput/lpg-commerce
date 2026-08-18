import { requireStaff } from "@/features/admin/lib/auth";
import { db } from "@/lib/db";
import { NewProductForm } from "./new-product-form";

export default async function NewProductPage() {
  await requireStaff(["SUPER_ADMIN", "STORE_MANAGER"]);
  const categories = await db.category.findMany({ orderBy: { name: "asc" } });

  return (
    <div>
      <h2 className="font-display text-xl font-semibold text-ink">Add product</h2>
      <div className="mt-4 max-w-2xl rounded-xl border border-line bg-surface p-6">
        <NewProductForm categories={categories} />
      </div>
    </div>
  );
}
