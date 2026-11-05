export const SIZE_OPTIONS = ['XS', 'S', 'M', 'L', 'XL', '2XL', '3XL'] as const;
export const KIDS_SIZES = ['1-5 years', '5-10 years'] as const;
export const DEFAULT_SIZES = ['S', 'M', 'L', 'XL'];

const ORDER: string[] = [...SIZE_OPTIONS, ...KIDS_SIZES];

export function sortSizes(sizes: string[]): string[] {
  return [...sizes].sort((a, b) => {
    const ia = ORDER.indexOf(a.toUpperCase());
    const ib = ORDER.indexOf(b.toUpperCase());
    return (ia === -1 ? 99 : ia) - (ib === -1 ? 99 : ib);
  });
}

// Starter measurements (inches) for each size; editable later.
const MEASUREMENTS: Record<string, { Chest: string; Waist: string; Length: string }> = {
  XS: { Chest: '36"', Waist: '32"', Length: '27"' },
  S: { Chest: '38"', Waist: '34"', Length: '28"' },
  M: { Chest: '40"', Waist: '36"', Length: '29"' },
  L: { Chest: '42"', Waist: '38"', Length: '30"' },
  XL: { Chest: '44"', Waist: '40"', Length: '31"' },
  '2XL': { Chest: '46"', Waist: '42"', Length: '32"' },
  '3XL': { Chest: '48"', Waist: '44"', Length: '33"' },
};

export function buildSizeChart(
  sizes: string[],
  existing: Array<{ size?: string; measurements?: Record<string, string> }> = []
) {
  return sortSizes(sizes).map((size) => {
    const kept = existing.find((e) => e.size === size);
    return {
      size,
      measurements: kept?.measurements ?? MEASUREMENTS[size] ?? { Chest: '-', Waist: '-', Length: '-' },
    };
  });
}

// Boy / Girl: each size carries its own price, stored inside size_chart (no database change needed).
export function buildKidsSizeChart(prices: Record<string, string>) {
  return KIDS_SIZES.filter((sz) => Number(prices[sz]) > 0).map((sz) => ({
    size: sz,
    price: Number(prices[sz]),
    measurements: {},
  }));
}
