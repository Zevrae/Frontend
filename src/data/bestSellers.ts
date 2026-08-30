/**
 * Best Sellers configuration for the homepage Best Sellers section.
 *
 * This is the ONLY new data introduced for this feature.
 * All product details (name, price, image, route) come from the existing
 * live product catalog — nothing is duplicated.
 *
 * Products are resolved at runtime by matching product names (case-insensitive
 * substring match) against the cached product catalog. This is intentionally
 * resilient: if a name is slightly different in the DB, the slot is silently
 * skipped rather than crashing.
 *
 * ORDER MATTERS — products are displayed in the order listed here.
 *
 * To configure best sellers:
 *   1. Add the exact (or partial) product name string for each entry.
 *   2. The resolver picks the FIRST product whose name includes the string.
 *   3. Up to 6 entries per category → enables 2 carousel slides of 3.
 */
export type CollectionKey = 'clothing' | 'jewellery' | 'accessories';

/**
 * Name-based best seller entries per collection.
 * Each string is matched case-insensitively as a substring of product.name.
 */
export const BEST_SELLER_NAMES: Record<CollectionKey, string[]> = {
  clothing: [
    'Shadow Ronin',      // Shadow Ronin Oversized Graphic Tee
    'Lunar Eclipse',     // ZEVRAE Lunar Eclipse Crop Tank
    'Nextmove',          // Nextmove Lower
  ],
  jewellery: [
    'Golden Rose',       // THE GOLDEN ROSE PENDANT
  ],
  accessories: [
    'Cocoa Moo',         // COCOA MOO
  ],
};
