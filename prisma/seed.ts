import "dotenv/config";
import { PrismaClient } from "@prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import bcrypt from "bcryptjs";

const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL });
const db = new PrismaClient({ adapter });

const CATEGORIES = [
  { name: "Burners", slug: "burners" },
  { name: "Lighters", slug: "lighters" },
  { name: "Regulators", slug: "regulators" },
  { name: "Hoses", slug: "hoses" },
  { name: "Stands", slug: "stands" },
  { name: "Kitchen Accessories", slug: "kitchen-accessories" },
  { name: "Safety Accessories", slug: "safety-accessories" },
];

interface SeedProduct {
  sku: string;
  name: string;
  slug: string;
  brand: string;
  description: string;
  category: string;
  price: number;
  discountPercent?: number;
  eligibility: "STANDARD" | "REGULATED";
  warrantyMonths?: number;
  image: string;
  specs: Record<string, string>;
  documents?: { title: string; url: string }[];
  stock: number;
}

const PRODUCTS: SeedProduct[] = [
  {
    sku: "BRN-001",
    name: "Twin Burner Gas Stove — Brass Body",
    slug: "twin-burner-gas-stove-brass-body",
    brand: "Prestige",
    description:
      "A two-burner stainless steel gas stove with brass burners for even heat distribution and faster cooking.",
    category: "burners",
    price: 3499,
    discountPercent: 10,
    eligibility: "STANDARD",
    warrantyMonths: 24,
    image: "https://images.unsplash.com/photo-1556909114-44e3e70034e2?w=800",
    specs: {
      "Burner count": "2",
      "Burner material": "Brass",
      "Body material": "Stainless steel",
      Ignition: "Manual",
    },
    documents: [{ title: "Installation & safety manual", url: "https://example.com/docs/brn-001.pdf" }],
    stock: 42,
  },
  {
    sku: "BRN-002",
    name: "Single Burner Compact Gas Stove",
    slug: "single-burner-compact-gas-stove",
    brand: "Sunflame",
    description:
      "A compact single-burner stove suited to small kitchens and outdoor use, with an auto-ignition mechanism.",
    category: "burners",
    price: 1299,
    eligibility: "STANDARD",
    warrantyMonths: 12,
    image: "https://images.unsplash.com/photo-1585237017125-24baf8d7406f?w=800",
    specs: {
      "Burner count": "1",
      "Burner material": "Alloy steel",
      Ignition: "Auto",
    },
    stock: 76,
  },
  {
    sku: "BRN-003",
    name: "Four Burner Glass-Top Gas Stove",
    slug: "four-burner-glass-top-gas-stove",
    brand: "Prestige",
    description:
      "A four-burner stove with a toughened glass top, designed for busy kitchens that need multiple pans going at once.",
    category: "burners",
    price: 6999,
    discountPercent: 15,
    eligibility: "STANDARD",
    warrantyMonths: 24,
    image: "https://images.unsplash.com/photo-1556910103-1c02745aae4d?w=800",
    specs: {
      "Burner count": "4",
      "Top material": "Toughened glass",
      Ignition: "Auto",
    },
    stock: 18,
  },
  {
    sku: "LTR-001",
    name: "Electric Arc Gas Lighter",
    slug: "electric-arc-gas-lighter",
    brand: "Pigeon",
    description:
      "A rechargeable electric arc lighter for stovetops — no flint, no butane, safe indoor use.",
    category: "lighters",
    price: 399,
    eligibility: "STANDARD",
    warrantyMonths: 6,
    image: "https://images.unsplash.com/photo-1621905251189-08b45d6a269e?w=800",
    specs: {
      Type: "Electric arc",
      Rechargeable: "Yes",
      "Battery life": "~1000 ignitions per charge",
    },
    stock: 120,
  },
  {
    sku: "LTR-002",
    name: "Long-Neck Refillable Gas Lighter",
    slug: "long-neck-refillable-gas-lighter",
    brand: "Generic",
    description:
      "A refillable long-neck lighter for reaching back burners and outdoor grills safely.",
    category: "lighters",
    price: 149,
    eligibility: "STANDARD",
    image: "https://images.unsplash.com/photo-1517245386807-bb43f82c33c4?w=800",
    specs: { Type: "Refillable flame", "Neck length": "20 cm" },
    stock: 200,
  },
  {
    sku: "REG-001",
    name: "Standard LPG Pressure Regulator",
    slug: "standard-lpg-pressure-regulator",
    brand: "SafeFlow",
    description:
      "A single-stage pressure regulator for domestic LPG cylinders, rated for standard household burner loads. Sold as an accessory only — installation on an actual cylinder must follow local gas-safety regulations.",
    category: "regulators",
    price: 549,
    eligibility: "REGULATED",
    warrantyMonths: 12,
    image: "https://images.unsplash.com/photo-1621905252472-943afaa20e20?w=800",
    specs: {
      Type: "Single-stage",
      "Rated pressure": "28-30 mbar",
      Certification: "ISI-marked (reference only in this demo)",
    },
    documents: [
      { title: "Safety & installation manual", url: "https://example.com/docs/reg-001.pdf" },
    ],
    stock: 30,
  },
  {
    sku: "REG-002",
    name: "High-Capacity Commercial Regulator",
    slug: "high-capacity-commercial-regulator",
    brand: "SafeFlow",
    description:
      "A higher-flow regulator intended for multi-burner commercial ranges. Regulated product — subject to eligibility checks.",
    category: "regulators",
    price: 899,
    eligibility: "REGULATED",
    warrantyMonths: 12,
    image: "https://images.unsplash.com/photo-1622480916113-9000ac49b79d?w=800",
    specs: { Type: "High-flow single-stage", "Rated pressure": "37 mbar" },
    stock: 12,
  },
  {
    sku: "HOS-001",
    name: "Reinforced Rubber Gas Hose — 1.5m",
    slug: "reinforced-rubber-gas-hose-1-5m",
    brand: "SafeFlow",
    description:
      "A flexible, reinforced rubber hose rated for domestic LPG connections between regulator and stove.",
    category: "hoses",
    price: 249,
    eligibility: "REGULATED",
    warrantyMonths: 6,
    image: "https://images.unsplash.com/photo-1581092160607-ee22621dd758?w=800",
    specs: { Length: "1.5 m", Material: "Reinforced rubber", "Max pressure": "50 mbar" },
    stock: 55,
  },
  {
    sku: "HOS-002",
    name: "Braided Steel Gas Hose — 1m",
    slug: "braided-steel-gas-hose-1m",
    brand: "SafeFlow",
    description:
      "A steel-braided hose for a more durable, kink-resistant connection, suited to fixed installations.",
    category: "hoses",
    price: 399,
    eligibility: "REGULATED",
    warrantyMonths: 12,
    image: "https://images.unsplash.com/photo-1581092335878-3e0f5d5b1d0e?w=800",
    specs: { Length: "1 m", Material: "Braided steel", "Max pressure": "50 mbar" },
    stock: 20,
  },
  {
    sku: "STD-001",
    name: "Adjustable Cylinder Trolley Stand",
    slug: "adjustable-cylinder-trolley-stand",
    brand: "HomePro",
    description:
      "A wheeled steel trolley for safely storing and moving a gas cylinder within the kitchen.",
    category: "stands",
    price: 799,
    eligibility: "STANDARD",
    warrantyMonths: 12,
    image: "https://images.unsplash.com/photo-1600585152220-90363fe7e115?w=800",
    specs: { Material: "Powder-coated steel", Wheels: "4, lockable", "Max load": "20 kg" },
    stock: 25,
  },
  {
    sku: "STD-002",
    name: "Wall-Mount Burner Stand",
    slug: "wall-mount-burner-stand",
    brand: "HomePro",
    description: "A compact wall-mounted stand for a single-burner stove, ideal for tight kitchens.",
    category: "stands",
    price: 599,
    eligibility: "STANDARD",
    image: "https://images.unsplash.com/photo-1600607687644-c7e2d6c3e8d0?w=800",
    specs: { Material: "Stainless steel", "Max load": "8 kg" },
    stock: 40,
  },
  {
    sku: "KAC-001",
    name: "Non-Stick Tawa — 28cm",
    slug: "non-stick-tawa-28cm",
    brand: "Prestige",
    description: "A 28cm non-stick tawa suited to any of our burner stoves, with a riveted handle.",
    category: "kitchen-accessories",
    price: 649,
    eligibility: "STANDARD",
    warrantyMonths: 12,
    image: "https://images.unsplash.com/photo-1584990347449-a0a4de5a1c5f?w=800",
    specs: { Diameter: "28 cm", Coating: "Non-stick, PFOA-free" },
    stock: 60,
  },
  {
    sku: "KAC-002",
    name: "Stainless Steel Pressure Cooker — 5L",
    slug: "stainless-steel-pressure-cooker-5l",
    brand: "Prestige",
    description: "A 5-litre stainless steel pressure cooker compatible with all gas burner stoves in this catalog.",
    category: "kitchen-accessories",
    price: 2199,
    discountPercent: 8,
    eligibility: "STANDARD",
    warrantyMonths: 24,
    image: "https://images.unsplash.com/photo-1590794056226-79ef3a8147e1?w=800",
    specs: { Capacity: "5 L", Material: "Stainless steel" },
    stock: 33,
  },
  {
    sku: "SAF-001",
    name: "LPG Gas Leak Detector Alarm",
    slug: "lpg-gas-leak-detector-alarm",
    brand: "SafeFlow",
    description:
      "A plug-in gas leak detector with an audible alarm, for early warning of LPG leaks in the kitchen.",
    category: "safety-accessories",
    price: 899,
    eligibility: "STANDARD",
    warrantyMonths: 12,
    image: "https://images.unsplash.com/photo-1631049035182-249067d7618e?w=800",
    specs: { Detects: "LPG, natural gas", Power: "Plug-in, mains" },
    documents: [{ title: "User & safety guide", url: "https://example.com/docs/saf-001.pdf" }],
    stock: 28,
  },
  {
    sku: "SAF-002",
    name: "Fire Safety Blanket — Kitchen Size",
    slug: "fire-safety-blanket-kitchen-size",
    brand: "SafeFlow",
    description: "A fibreglass fire blanket for smothering small kitchen fires, wall-mountable in a quick-release case.",
    category: "safety-accessories",
    price: 549,
    eligibility: "STANDARD",
    image: "https://images.unsplash.com/photo-1584634731339-252c581abfc5?w=800",
    specs: { Size: "1.2m x 1.2m", Material: "Fibreglass" },
    stock: 50,
  },
];

const COMPATIBILITY: { from: string; to: string; note?: string }[] = [
  { from: "REG-001", to: "HOS-001", note: "Standard fit for domestic regulator-to-stove runs." },
  { from: "REG-001", to: "BRN-001" },
  { from: "REG-001", to: "BRN-002" },
  { from: "REG-002", to: "HOS-002", note: "Steel-braided hose recommended for the high-capacity regulator." },
  { from: "REG-002", to: "BRN-003" },
  { from: "HOS-001", to: "BRN-001" },
  { from: "HOS-002", to: "BRN-003" },
  { from: "KAC-001", to: "BRN-001" },
  { from: "KAC-001", to: "BRN-002" },
  { from: "KAC-002", to: "BRN-001" },
  { from: "KAC-002", to: "BRN-003" },
  { from: "STD-002", to: "BRN-002", note: "Wall stand is sized for the compact single-burner stove only." },
];

async function main() {
  console.log("Seeding categories…");
  const categoryBySlug = new Map<string, string>();
  for (const c of CATEGORIES) {
    const created = await db.category.upsert({
      where: { slug: c.slug },
      update: { name: c.name },
      create: c,
    });
    categoryBySlug.set(c.slug, created.id);
  }

  console.log("Seeding products…");
  const productIdBySku = new Map<string, string>();

  for (const p of PRODUCTS) {
    const categoryId = categoryBySlug.get(p.category);
    if (!categoryId) throw new Error(`Unknown category slug: ${p.category}`);

    const product = await db.product.upsert({
      where: { sku: p.sku },
      update: {},
      create: {
        sku: p.sku,
        name: p.name,
        slug: p.slug,
        brand: p.brand,
        description: p.description,
        categoryId,
        price: p.price,
        discountPercent: p.discountPercent ?? 0,
        eligibility: p.eligibility,
        warrantyMonths: p.warrantyMonths ?? 0,
        images: { create: [{ url: p.image, altText: p.name, sortOrder: 0 }] },
        specifications: {
          create: Object.entries(p.specs).map(([label, value]) => ({ label, value })),
        },
        documents: { create: p.documents ?? [] },
      },
    });

    productIdBySku.set(p.sku, product.id);
  }

  console.log("Seeding a demo store + inventory…");
  const store = await db.store.upsert({
    where: { id: "demo-store" },
    update: {},
    create: {
      id: "demo-store",
      name: "Supply Line — Flagship Store",
      latitude: 28.6139,
      longitude: 77.209,
    },
  });

  for (const p of PRODUCTS) {
    const productId = productIdBySku.get(p.sku)!;
    await db.inventory.upsert({
      where: { storeId_productId: { storeId: store.id, productId } },
      update: { stockOnHand: p.stock },
      create: { storeId: store.id, productId, stockOnHand: p.stock, stockReserved: 0 },
    });
  }

  console.log("Seeding product compatibility…");
  for (const link of COMPATIBILITY) {
    const fromId = productIdBySku.get(link.from);
    const toId = productIdBySku.get(link.to);
    if (!fromId || !toId) continue;

    await db.productCompatibility.upsert({
      where: { productId_compatibleId: { productId: fromId, compatibleId: toId } },
      update: { note: link.note },
      create: {
        productId: fromId,
        compatibleId: toId,
        isCompatible: true,
        note: link.note,
      },
    });
  }

  console.log("Seeding delivery zones…");
  const ZONES: {
    name: string;
    tier: "ZONE_A" | "ZONE_B" | "ZONE_C";
    pincodePrefix: string;
    baseFee: number;
    etaMinMinutes: number;
    etaMaxMinutes: number;
  }[] = [
    { name: "Central Delhi — fast zone", tier: "ZONE_A", pincodePrefix: "110", baseFee: 0, etaMinMinutes: 30, etaMaxMinutes: 45 },
    { name: "Delhi NCR — standard zone", tier: "ZONE_B", pincodePrefix: "11", baseFee: 40, etaMinMinutes: 45, etaMaxMinutes: 90 },
    { name: "Mumbai — extended zone", tier: "ZONE_C", pincodePrefix: "400", baseFee: 80, etaMinMinutes: 90, etaMaxMinutes: 150 },
  ];

  for (const zone of ZONES) {
    const existing = await db.deliveryZone.findFirst({
      where: { storeId: store.id, pincodePrefix: zone.pincodePrefix },
    });
    if (existing) {
      await db.deliveryZone.update({ where: { id: existing.id }, data: zone });
    } else {
      await db.deliveryZone.create({ data: { ...zone, storeId: store.id } });
    }
  }

  console.log("Seeding demo coupons…");
  await db.coupon.upsert({
    where: { code: "WELCOME10" },
    update: {},
    create: { code: "WELCOME10", discountPercent: 10, isActive: true },
  });
  await db.coupon.upsert({
    where: { code: "SAVE20" },
    update: {},
    create: { code: "SAVE20", discountPercent: 20, isActive: true },
  });

  console.log("Seeding demo admin account…");
  const adminPasswordHash = await bcrypt.hash("AdminDemo123", 12);
  await db.user.upsert({
    where: { email: "admin@supplyline.demo" },
    update: {},
    create: {
      email: "admin@supplyline.demo",
      fullName: "Demo Admin",
      passwordHash: adminPasswordHash,
      emailVerifiedAt: new Date(),
    },
  });
  await db.staff.upsert({
    where: { email: "admin@supplyline.demo" },
    update: {},
    create: {
      storeId: store.id,
      name: "Demo Admin",
      email: "admin@supplyline.demo",
      role: "SUPER_ADMIN",
    },
  });

  console.log("Seed complete.");
}

main()
  .catch((err) => {
    console.error(err);
    process.exit(1);
  })
  .finally(async () => {
    await db.$disconnect();
  });
