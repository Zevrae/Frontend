/**
 * Category → theme mapping.
 *
 * Only routes that actually *define* a category set the theme. Everything
 * else — a product detail page, the cart, checkout, profile, policy pages,
 * etc. — has no category of its own, so it must NOT reset the palette.
 * `getThemeForPath` returns `null` for those routes, and `ThemeProvider`
 * simply leaves whatever theme is already active in place. The palette
 * only ever changes when the person actually lands on (or scrolls into,
 * via the homepage slider) a different category.
 *
 * Matching is on the top-level path segment only, so anything nested under
 * a category root still counts as that category, no matter what follows:
 *   /accessories/keychains  -> "accessories"
 *   /accessories/soft-toys  -> "accessories"
 *   /jewellery/men/rings    -> "jewellery"
 *   /men/tshirts            -> "clothing"
 *   /product/64f2c1         -> null (persist current theme)
 *   /bag, /checkout, /profile, /admin/*, policy pages, etc. -> null
 */
export type ThemeName = 'clothing' | 'jewellery' | 'accessories';

export const DEFAULT_THEME: ThemeName = 'clothing';

export function getThemeForPath(pathname: string): ThemeName | null {
  const segment = pathname.split('/').filter(Boolean)[0]?.toLowerCase();

  switch (segment) {
    case 'jewellery':
      return 'jewellery';
    case 'accessories':
      return 'accessories';
    case undefined: // "/"
    case 'men':
    case 'women':
      return 'clothing';
    default:
      // product/:id, bag, checkout, profile, admin*, ai-wardrobe, policy
      // pages, verify-email, etc. — none of these belong to a category,
      // so don't touch the currently active theme.
      return null;
  }
}

