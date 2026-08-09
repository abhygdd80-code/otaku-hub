// ─── Size Guide Data ────────────────────────────────────────────────────
// Mock measurement charts for the Size Guide modal. Values are stored in
// centimetres and converted to inches on the client (`cm / 2.54`), so the
// two unit systems can never drift out of sync.

export type UnitSystem = 'cm' | 'in';

export interface SizeGuideColumn {
  key: string;
  label: string;
}

export interface SizeGuideSizeRow {
  label: string;
  /** Body measurements in centimetres, aligned to `columns` */
  values: number[];
}

export interface SizeGuideChart {
  /** Tab id used for routing / aria */
  id: string;
  /** Tab label (e.g. "Oversized Tee") */
  label: string;
  /** Measurement columns for this garment */
  columns: SizeGuideColumn[];
  /** One row per garment size */
  sizes: SizeGuideSizeRow[];
  /** Fit note shown beneath the table */
  note: string;
}

export const SIZE_GUIDE_CHARTS: SizeGuideChart[] = [
  {
    id: 'oversized-tee',
    label: 'Oversized Tee',
    columns: [
      { key: 'chest', label: 'Chest' },
      { key: 'length', label: 'Body Length' },
      { key: 'sleeve', label: 'Sleeve' },
    ],
    sizes: [
      { label: 'XS', values: [50, 66, 19] },
      { label: 'S', values: [53, 70, 20] },
      { label: 'M', values: [56, 74, 21] },
      { label: 'L', values: [60, 78, 22] },
      { label: 'XL', values: [64, 82, 23] },
      { label: '2XL', values: [68, 86, 24] },
    ],
    note: 'Designed with a boxy, oversized fit. Size down for a regular silhouette.',
  },
  {
    id: 'hoodie',
    label: 'Hoodie',
    columns: [
      { key: 'chest', label: 'Chest' },
      { key: 'length', label: 'Body Length' },
      { key: 'sleeve', label: 'Sleeve' },
    ],
    sizes: [
      { label: 'S', values: [56, 68, 60] },
      { label: 'M', values: [60, 72, 62] },
      { label: 'L', values: [64, 76, 64] },
      { label: 'XL', values: [68, 80, 66] },
      { label: '2XL', values: [72, 84, 68] },
    ],
    note: 'Heavyweight 420GSM fleece with a relaxed drop-shoulder cut.',
  },
  {
    id: 'jacket',
    label: 'Jacket',
    columns: [
      { key: 'chest', label: 'Chest' },
      { key: 'length', label: 'Body Length' },
      { key: 'sleeve', label: 'Sleeve' },
    ],
    sizes: [
      { label: 'S', values: [52, 66, 62] },
      { label: 'M', values: [56, 70, 64] },
      { label: 'L', values: [60, 74, 66] },
      { label: 'XL', values: [64, 78, 68] },
      { label: '2XL', values: [68, 82, 70] },
    ],
    note: 'Layered outerwear — true to size. Sizes run slightly trim through the chest.',
  },
  {
    id: 'joggers',
    label: 'Joggers',
    columns: [
      { key: 'waist', label: 'Waist' },
      { key: 'hips', label: 'Hips' },
      { key: 'inseam', label: 'Inseam' },
    ],
    sizes: [
      { label: 'S', values: [68, 98, 70] },
      { label: 'M', values: [72, 102, 72] },
      { label: 'L', values: [76, 106, 74] },
      { label: 'XL', values: [80, 110, 76] },
      { label: '2XL', values: [84, 114, 78] },
    ],
    note: 'Measure around your natural waist. Elastic cuffs allow a relaxed taper.',
  },
];

/** Convert centimetres to inches for display. */
export function cmToInches(cm: number): number {
  return cm / 2.54;
}

/**
 * Format a centimetre value for the active unit system.
 * cm → rounded integer; inches → one decimal place.
 */
export function formatSizeUnit(cm: number, unit: UnitSystem): string {
  if (unit === 'cm') return `${Math.round(cm)}`;
  return `${cmToInches(cm).toFixed(1)}`;
}
