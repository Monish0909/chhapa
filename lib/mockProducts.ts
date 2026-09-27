export interface SizeMeasurement {
  size: string;
  measurements: Record<string, string | number>;
}

export interface MockProduct {
  id: string;
  slug: string;
  name: string;
  tagline?: string;
  price: number;
  originalPrice?: number;
  images: string[];
  sizes: string[];
  sizeChart: SizeMeasurement[];
  shipsInDays: string;
  sold: boolean;
  fabricCare: string;
  details: string;
  shippingReturns: string;
  category: "women" | "kids" | "accessories";
  createdAt: string; // ISO date string for "Newest" sort
}

export const mockProducts: MockProduct[] = [
  {
    id: "prod-indigo-bloom",
    slug: "indigo-bloom-silk-cotton-shirt",
    name: "Hand-Painted Indigo Bloom Silk-Cotton Shirt",
    tagline: "Freehand brush-painted on handspun organic cotton with natural indigo",
    price: 3499,
    originalPrice: 4200,
    images: [
      "/frames/home/frame_0001.jpg",
      "/frames/home/frame_0015.jpg",
      "/frames/home/frame_0035.jpg",
      "/frames/home/frame_0055.jpg",
      "/frames/home/frame_0080.jpg",
    ],
    sizes: ["S", "M", "L", "XL"],
    sizeChart: [
      { size: "S", measurements: { Chest: '38"', Waist: '34"', Shoulder: '15.5"', Length: '28"' } },
      { size: "M", measurements: { Chest: '40"', Waist: '36"', Shoulder: '16.5"', Length: '29"' } },
      { size: "L", measurements: { Chest: '42"', Waist: '38"', Shoulder: '17.5"', Length: '30"' } },
      { size: "XL", measurements: { Chest: '44"', Waist: '40"', Shoulder: '18.5"', Length: '31"' } },
    ],
    shipsInDays: "7-10 days",
    sold: false,
    fabricCare:
      "Crafted from 100% certified handspun organic cotton. Hand-wash separately in cold water with mild or pH-neutral liquid detergent. Do not soak, wring, or bleach. Line dry in shade away from direct sunlight to preserve the botanical indigo depth. Warm iron on reverse.",
    details:
      "One-of-one silhouette handcrafted in Dhamadka, Kutch. Artfully painted freehand with fine squirrel-hair and bamboo brushes using living fermented indigo. Features mother-of-pearl buttons, french seams throughout, a relaxed notched band collar, and subtle brush stroke variations inherent to true artisanal hand-painting.",
    shippingReturns:
      "Complimentary express insured shipping across India. Standard dispatch within 7-10 working days as each piece is cut and assembled to order. As each garment is an artisan one-of-one creation, we accept size exchanges or store credits within 7 days of delivery in pristine, unworn condition with original tags intact.",
    category: "women",
    createdAt: "2026-09-24T10:00:00.000Z",
  },
  {
    id: "prod-terracotta-kurta",
    slug: "terracotta-brush-kurta",
    name: "Hand-Painted Mineral Terracotta Kurta",
    tagline: "Freehand brush stroke motifs rendered in mineral terracotta dye & harda",
    price: 4199,
    originalPrice: 4800,
    images: [
      "/frames/craft/frame_0001.jpg",
      "/frames/craft/frame_0012.jpg",
      "/frames/craft/frame_0025.jpg",
      "/frames/craft/frame_0040.jpg",
      "/frames/craft/frame_0060.jpg",
    ],
    sizes: ["XS", "S", "M", "L"],
    sizeChart: [
      { size: "XS", measurements: { Bust: '34"', Waist: '32"', Hip: '38"', Length: '44"' } },
      { size: "S", measurements: { Bust: '36"', Waist: '34"', Hip: '40"', Length: '44.5"' } },
      { size: "M", measurements: { Bust: '38"', Waist: '36"', Hip: '42"', Length: '45"' } },
      { size: "L", measurements: { Bust: '40"', Waist: '38"', Hip: '44"', Length: '45.5"' } },
    ],
    shipsInDays: "5-8 days",
    sold: false,
    fabricCare:
      "100% fine Chanderi cotton with mineral clay pigments and harda mordant. Dry clean recommended for the first two cleans. Subsequent washes in cold water with eco-friendly detergent. Natural mineral dye may release a subtle tint in initial washes, enriching its patina over time.",
    details:
      "Artfully painted by hand in Rajasthan using natural earth pigments and plant gum binders applied with freehand brushwork. Features side slits reinforced with hand-tacking, subtle kantha embroidery along the boat neckline, and deep concealed inseam pockets. Tailored for effortless movement and breathability.",
    shippingReturns:
      "Ships within 5-8 business days. Delivered in sustainable biodegradable cloth pouches crafted from workshop offcuts. Free returns and size exchanges within 7 days.",
    category: "women",
    createdAt: "2026-09-22T14:30:00.000Z",
  },
  {
    id: "prod-little-play-vest",
    slug: "little-quilted-play-vest",
    name: "Little Chhapa Hand-Painted Quilted Play Vest",
    tagline: "Ultra-soft mulmul cotton quilted with hypoallergenic organic cotton batting",
    price: 2499,
    originalPrice: 2899,
    images: [
      "/frames/lookbook/frame_0001.jpg",
      "/frames/lookbook/frame_0015.jpg",
      "/frames/lookbook/frame_0030.jpg",
      "/frames/lookbook/frame_0045.jpg",
      "/frames/lookbook/frame_0060.jpg",
    ],
    sizes: ["2-3Y", "4-5Y", "6-7Y", "8-9Y"],
    sizeChart: [
      { size: "2-3Y", measurements: { Chest: '24"', Length: '14"', Armhole: '11"' } },
      { size: "4-5Y", measurements: { Chest: '26"', Length: '15.5"', Armhole: '12"' } },
      { size: "6-7Y", measurements: { Chest: '28"', Length: '17"', Armhole: '13"' } },
      { size: "8-9Y", measurements: { Chest: '30"', Length: '18.5"', Armhole: '14"' } },
    ],
    shipsInDays: "3-5 days",
    sold: false,
    fabricCare:
      "100% breathable organic Mulmul cotton with pure natural plant dyes, completely chemical-free and gentle on delicate skin. Gentle machine wash in cold cycle inside out with organic baby detergent. Lay flat to dry.",
    details:
      "Hand-quilted reversible Nehru vest designed for Little Chhapa. Reverses from indigo celestial strokes to warm terracotta brush foliage. Features wooden bead toggle buttons, fabric loop closures, and tagless neckline to prevent itching for sensory-sensitive little ones.",
    shippingReturns:
      "Prompt dispatch in 3-5 days. Comes with a complimentary handmade watercolor palette card for little explorers. Hassle-free exchange policy within 10 days.",
    category: "kids",
    createdAt: "2026-09-25T08:00:00.000Z",
  },
  {
    id: "prod-little-indigo-frock",
    slug: "little-indigo-brush-frock",
    name: "Little Chhapa Hand-Painted Flora Frock",
    tagline: "Breathable hand-painted flared frock tailored with soft gathers for play",
    price: 2799,
    originalPrice: 3200,
    images: [
      "/frames/lookbook/frame_0010.jpg",
      "/frames/lookbook/frame_0025.jpg",
      "/frames/lookbook/frame_0040.jpg",
      "/frames/lookbook/frame_0055.jpg",
    ],
    sizes: ["2-3Y", "4-5Y", "6-7Y"],
    sizeChart: [
      { size: "2-3Y", measurements: { Chest: '23"', Length: '20"' } },
      { size: "4-5Y", measurements: { Chest: '25"', Length: '23"' } },
      { size: "6-7Y", measurements: { Chest: '27"', Length: '26"' } },
    ],
    shipsInDays: "3-5 days",
    sold: false,
    fabricCare:
      "100% lightweight organic handspun cotton with natural indigo dye. Handwash gently in cold water.",
    details:
      "Delicate hand-gathered waist with wooden button back placket, flutter sleeves, and freehand botanical vine brushwork.",
    shippingReturns:
      "Free express shipping. Delivery in 3-5 working days.",
    category: "kids",
    createdAt: "2026-09-23T11:00:00.000Z",
  },
  {
    id: "prod-botanical-linen-dress",
    slug: "botanical-linen-dress",
    name: "Hand-Painted Botanical Linen Dress",
    tagline: "Pure European breathable linen painted with freehand botanical floral motifs",
    price: 5299,
    originalPrice: 5999,
    images: [
      "/frames/craft/frame_0010.jpg",
      "/frames/craft/frame_0020.jpg",
      "/frames/craft/frame_0035.jpg",
      "/frames/craft/frame_0050.jpg",
      "/frames/craft/frame_0070.jpg",
    ],
    sizes: ["S", "M", "L"],
    sizeChart: [
      { size: "S", measurements: { Bust: '36"', Waist: '30"', Hip: '40"', Length: '48"' } },
      { size: "M", measurements: { Bust: '38"', Waist: '32"', Hip: '42"', Length: '49"' } },
      { size: "L", measurements: { Bust: '40"', Waist: '34"', Hip: '44"', Length: '50"' } },
    ],
    shipsInDays: "7-10 days",
    sold: true,
    fabricCare:
      "100% pure European flax linen. Machine wash cold on delicate gentle cycle or hand wash. Hang to dry in shade; linen softens gorgeously with every wash. Steam or iron damp for a crisp look, or leave naturally crinkled for relaxed elegance.",
    details:
      "This archival one-of-one silhouette has been acquired by a collector. Cut with tiered gathered skirt panels, delicate mother-of-pearl buttons along the front placket, elbow-length blouson sleeves, and hidden side seam pockets. Painted freehand with turmeric, pomegranate rind, and alum.",
    shippingReturns:
      "This piece is sold out and archival. Made-to-order bespoke requests can be placed via our concierge. Archived pieces carry our signature authenticity seal.",
    category: "women",
    createdAt: "2026-09-18T09:15:00.000Z",
  },
  {
    id: "prod-kalamkari-silk-stole",
    slug: "kalamkari-silk-stole",
    name: "Kalamkari Botanical Silk Stole",
    tagline: "Pen and brush drawn natural dyed mulberry silk with peacock and vine motifs",
    price: 2899,
    originalPrice: 3500,
    images: [
      "/frames/home/frame_0020.jpg",
      "/frames/home/frame_0040.jpg",
      "/frames/home/frame_0060.jpg",
    ],
    sizes: ["Free Size"],
    sizeChart: [
      { size: "Free Size", measurements: { Width: '22"', Length: '78"' } },
    ],
    shipsInDays: "4-6 days",
    sold: false,
    fabricCare:
      "100% pure Mulberry silk. Dry clean only to preserve raw plant pigment luster and fine line detailing.",
    details:
      "Handcrafted by master artisans in Srikalahasti using bamboo kalam pens, soft brushes, and natural alum mordants.",
    shippingReturns:
      "Insured dispatch in 4-6 business days in gift packaging.",
    category: "accessories",
    createdAt: "2026-09-20T16:45:00.000Z",
  },
];

export function getProductBySlug(slug: string): MockProduct | undefined {
  return mockProducts.find((p) => p.slug === slug);
}
