import { z } from "zod";

export const SORT_OPTIONS = [
  "popular",
  "newest",
  "price_asc",
  "price_desc",
  "rating",
] as const;

export type SortOption = (typeof SORT_OPTIONS)[number];

export const productSearchSchema = z.object({
  q: z.string().trim().optional(),
  category: z.string().trim().optional(),
  brand: z.string().trim().optional(),
  minPrice: z.coerce.number().nonnegative().optional(),
  maxPrice: z.coerce.number().nonnegative().optional(),
  minRating: z.coerce.number().min(0).max(5).optional(),
  inStockOnly: z
    .union([z.literal("1"), z.literal("0")])
    .optional()
    .transform((v) => v === "1"),
  sort: z.enum(SORT_OPTIONS).optional().default("popular"),
  page: z.coerce.number().int().positive().optional().default(1),
});

export type ProductSearchParams = z.infer<typeof productSearchSchema>;

export const PAGE_SIZE = 12;
