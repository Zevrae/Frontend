/**
 * Category → theme mapping.
 *
 * Only the *top-level* category segment of the path matters — whatever
 * comes after it (subcategory, product id, etc.) is ignored. e.g.
 *   /accessories/keychains  -> "accessories"
 *   /accessories/soft-toys  -> "accessories"
 *   /jewellery/men/rings    -> "jewellery"
 *   /men/tshirts            -> "clothing"
 *
 * Routes with no category in the URL (home, product page, bag, checkout,
 * profile, admin, policy pages, etc.) fall back to "clothing", which is
 * the site's original, unthemed look — nothing changes for them.
 */
export type ThemeName = 'clothing' | 'jewellery' | 'accessories';

export const DEFAULT_THEME: ThemeName = 'clothing';

export function getThemeForPath(pathname: string): ThemeName {
  const segment = pathname.split('/').filter(Boolean)[0]?.toLowerCase();

  switch (segment) {
    case 'jewellery':
      return 'jewellery';
    case 'accessories':
      return 'accessories';
    default:
      return DEFAULT_THEME;
  }
}
