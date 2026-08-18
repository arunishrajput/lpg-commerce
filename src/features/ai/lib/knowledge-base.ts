import "server-only";
import { db } from "@/lib/db";

/**
 * Keyword search over the product catalog, reusing the same fields the
 * storefront search uses. Nothing here is generated — every fact returned
 * to the assistant comes straight from the database rows an admin entered,
 * so the assistant has no way to invent specs or compatibility even if
 * asked to.
 */
export async function retrieveProductContext(query: string, limit = 3): Promise<string> {
  const products = await db.product.findMany({
    where: {
      isActive: true,
      OR: [
        { name: { contains: query, mode: "insensitive" } },
        { brand: { contains: query, mode: "insensitive" } },
        { description: { contains: query, mode: "insensitive" } },
        { category: { name: { contains: query, mode: "insensitive" } } },
      ],
    },
    include: {
      category: true,
      specifications: true,
      documents: true,
      compatibleWith: { include: { compatible: { select: { name: true } } } },
      inventory: { select: { stockOnHand: true, stockReserved: true } },
    },
    take: limit,
  });

  if (products.length === 0) return "";

  return products
    .map((p) => {
      const stock = p.inventory.reduce(
        (sum, inv) => sum + Math.max(0, inv.stockOnHand - inv.stockReserved),
        0
      );
      const specs = p.specifications.map((s) => `${s.label}: ${s.value}`).join("; ");
      const compat = p.compatibleWith
        .filter((c) => c.isCompatible)
        .map((c) => c.compatible.name)
        .join(", ");
      const docs = p.documents.map((d) => `${d.title} (${d.url})`).join("; ");

      return [
        `Product: ${p.name} (${p.brand ?? "no brand"}, ${p.category.name})`,
        `Price: ₹${Number(p.price).toFixed(0)}${p.discountPercent > 0 ? ` (${p.discountPercent}% off)` : ""}`,
        `Eligibility: ${p.eligibility}`,
        `Stock: ${stock > 0 ? `${stock} available` : "out of stock"}`,
        `Warranty: ${p.warrantyMonths > 0 ? `${p.warrantyMonths} months` : "none listed"}`,
        specs ? `Specifications: ${specs}` : null,
        compat ? `Documented compatible with: ${compat}` : "No documented compatibility on file.",
        docs ? `Documentation: ${docs}` : null,
      ]
        .filter(Boolean)
        .join("\n");
    })
    .join("\n\n");
}
