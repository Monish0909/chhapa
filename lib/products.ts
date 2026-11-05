import { supabase } from './supabase';
import type { MockProduct, SizeMeasurement } from './mockProducts';

export type { MockProduct, SizeMeasurement };

export interface DbProduct {
  id: string;
  name: string;
  price: number;
  category: 'women' | 'boy' | 'girl' | 'accessories';
  images: string[];
  size_chart: SizeMeasurement[];
  ships_in_days: number;
  sold: boolean;
  fabric_care: string;
  details: string;
  shipping_returns: string;
  created_at: string;
}

// Convert a database product row to a normalized MockProduct shape
export function formatDbProduct(row: Record<string, unknown>): MockProduct {
  // Generate a URL-friendly slug if not directly provided
  const rawName = (row.name as string) || '';
  const rawId = (row.id as string) || '';
  const slug =
    (row.slug as string) ||
    rawName
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/(^-|-$)+/g, '') ||
    rawId;

  // Extract sizes from size_chart if available
  const rowSizes = row.sizes as string[] | undefined;
  const rowSizeChart = row.size_chart as Array<{ size?: string } | string> | undefined;
  const category = normalizeCategory(row.category as string);
  const chart = (Array.isArray(rowSizeChart) ? rowSizeChart : []) as Array<{ size?: string; price?: number } | string>;
  const isKids = category === 'boy' || category === 'girl';

  // Boy / Girl: sizes (and per-size prices) come from size_chart; Accessories: no sizes; Women: as saved.
  const sizePrices: Record<string, number> = {};
  if (isKids) {
    chart.forEach((c) => {
      if (typeof c !== 'string' && c.size && Number(c.price) > 0) sizePrices[c.size] = Number(c.price);
    });
  }
  const sizes = category === 'accessories'
    ? ['One Size']
    : isKids
    ? Object.keys(sizePrices).length > 0 ? Object.keys(sizePrices) : ['One Size']
    : Array.isArray(rowSizes) && rowSizes.length > 0
    ? rowSizes
    : chart.length > 0
    ? chart.map((s) => (typeof s === 'string' ? s : s.size || 'One Size'))
    : ['One Size'];
  const kidsMin = Object.values(sizePrices).length ? Math.min(...Object.values(sizePrices)) : 0;

  return {
    id: String(row.id || ''),
    slug,
    name: String(row.name || ''),
    tagline: typeof row.tagline === 'string' ? row.tagline : typeof row.details === 'string' ? row.details.slice(0, 90) + '...' : undefined,
    price: isKids && kidsMin ? kidsMin : Number(row.price || 0),
    originalPrice: row.original_price ? Number(row.original_price) : undefined,
    images: Array.isArray(row.images) && row.images.length > 0
      ? (row.images as string[])
      : ['/frames/home/frame_0001.jpg'],
    sizes,
    sizeChart: category === 'women' && Array.isArray(row.size_chart) ? (row.size_chart as SizeMeasurement[]) : [],
    sizePrices: isKids ? sizePrices : undefined,
    shipsInDays: row.ships_in_days ? `${row.ships_in_days} days` : '7-10 days',
    sold: Boolean(row.sold),
    fabricCare: (row.fabric_care as string) || 'Crafted from 100% natural organic cotton. Gentle cold handwash.',
    details: (row.details as string) || 'Handcrafted slow living piece with natural plant dyes.',
    shippingReturns: (row.shipping_returns as string) || 'Free insured shipping across India. Exchanges within 7 days.',
    category,
    createdAt: (row.created_at as string) || new Date().toISOString(),
  };
}

// Maps a raw DB category to the current set. Legacy "kids" rows show as "girl" until re-categorised in admin.
function normalizeCategory(raw: string | undefined): MockProduct['category'] {
  const c = (raw || '').toLowerCase();
  if (c === 'boy' || c === 'girl' || c === 'women' || c === 'accessories') return c;
  if (c === 'kids') return 'girl';
  return 'women';
}

/**
 * Fetch all products from Supabase products table.
 * Does NOT fall back to mock data: returns empty array if table is empty or error occurs.
 */
export async function getProducts(): Promise<MockProduct[]> {
  try {
    const { data, error } = await supabase
      .from('products')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) {
      console.error('[Supabase getProducts] Query error:', error);
      return [];
    }

    if (!data || data.length === 0) {
      console.log('[Supabase getProducts] Query succeeded but returned 0 products.');
      return [];
    }

    return data.map(formatDbProduct);
  } catch (err) {
    console.error('[Supabase getProducts] Exception during query:', err);
    return [];
  }
}

/**
 * Fetch a single product by slug or ID directly from Supabase.
 * Does NOT fall back to mock data: returns null if not found.
 */
export async function getProductBySlug(slug: string): Promise<MockProduct | null> {
  try {
    // 1. Try finding by ID if it's a UUID format
    const isUuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(slug);

    if (isUuid) {
      const { data, error } = await supabase
        .from('products')
        .select('*')
        .eq('id', slug)
        .maybeSingle();

      if (error) {
        console.error(`[Supabase getProductBySlug] Query by id error (${slug}):`, error);
        return null;
      }

      if (data) {
        return formatDbProduct(data);
      }
    }

    // 2. Fetch all from Supabase and match computed slug or name
    const { data, error } = await supabase.from('products').select('*');
    if (error) {
      console.error('[Supabase getProductBySlug] Query all products error:', error);
      return null;
    }

    if (data && data.length > 0) {
      const match = data.find((p) => {
        const itemSlug = p.name
          ?.toLowerCase()
          .replace(/[^a-z0-9]+/g, '-')
          .replace(/(^-|-$)+/g, '');
        return itemSlug === slug || p.id === slug;
      });
      if (match) return formatDbProduct(match);
    }

    console.warn(`[Supabase getProductBySlug] Product not found in database for slug/id: "${slug}"`);
    return null;
  } catch (err) {
    console.error('[Supabase getProductBySlug] Exception during query:', err);
    return null;
  }
}
