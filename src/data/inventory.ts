// ─── Mock Inventory ──────────────────────────────────────────
// Deterministic, per-product stock levels so the UI never flashes
// or re-randomizes between renders. Levels are derived from a hash
// of the product handle (salted to spread nicely across the catalog)
// and intentionally cover all four states: in stock, "Only N left",
// low stock, and out of stock.
//
// Swap for a real inventory API when a backend is wired up.

export type InventoryStatus =
  'in-stock' | 'only-n-left' | 'low-stock' | 'out-of-stock';

export interface InventoryInfo {
  /** Remaining units */
  quantity: number;
  /** Display state */
  status: InventoryStatus;
  /** Short human-readable label */
  label: string;
}

/** FNV-1a style hash with a fixed salt, mapped to 0–100. */
function rollFor(handle: string): number {
  let h = 2166136261 ^ 0xdeadbeef;
  for (let i = 0; i < handle.length; i++) {
    h ^= handle.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return (h >>> 0) % 100;
}

/**
 * Resolve the mock stock level for a product handle.
 *
 * ── Mapping (roll 0–100) ──────────────────────────────────
 * • 0–1    → out of stock (0 units)
 * • 2–15   → 1–5 units remaining ("Only N left")
 * • 16–30  → 6–15 units remaining ("Low stock")
 * • 31+    → 40+ units (comfortably "In stock")
 */
export function getInventoryInfo(handle: string): InventoryInfo {
  const roll = rollFor(handle);

  let quantity: number;
  if (roll <= 1) quantity = 0;
  else if (roll <= 15) quantity = ((roll - 2) % 5) + 1;
  else if (roll <= 30) quantity = roll - 16 + 6;
  else quantity = 40 + (roll - 31) * 3;

  let status: InventoryStatus;
  if (quantity === 0) status = 'out-of-stock';
  else if (quantity <= 5) status = 'only-n-left';
  else if (quantity <= 15) status = 'low-stock';
  else status = 'in-stock';

  const label =
    status === 'in-stock'
      ? 'In Stock'
      : status === 'only-n-left'
        ? `Only ${quantity} left`
        : status === 'low-stock'
          ? 'Low Stock'
          : 'Out of Stock';

  return { quantity, status, label };
}

/** Whether a product can currently be added to cart. */
export function isInStock(handle: string): boolean {
  return getInventoryInfo(handle).quantity > 0;
}
