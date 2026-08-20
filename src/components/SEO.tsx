import { useEffect } from 'react';

interface SEOProps {
  title: string;
  description: string;
  canonical?: string;
  noindex?: boolean;
  /** Optional JSON-LD structured data object. Injected as a managed
   *  <script type="application/ld+json"> tag; cleaned up on unmount so
   *  navigating between routes never leaves stale schema behind. */
  jsonLd?: Record<string, unknown>;
}

const BASE_URL = 'https://zevrae.com';

/** Attribute used to identify the dynamic JSON-LD script tag */
const JSON_LD_ATTR = 'data-seo-jsonld';

export default function SEO({
  title,
  description,
  canonical,
  noindex = false,
  jsonLd,
}: SEOProps) {
  useEffect(() => {
    document.title = title;

    // Helper to create/update meta tags
    const setMeta = (
      attribute: 'name' | 'property',
      key: string,
      content: string
    ) => {
      let element = document.head.querySelector(
        `meta[${attribute}="${key}"]`
      ) as HTMLMetaElement | null;

      if (!element) {
        element = document.createElement('meta');
        element.setAttribute(attribute, key);
        document.head.appendChild(element);
      }

      element.setAttribute('content', content);
    };

    // Basic SEO
    setMeta('name', 'description', description);

    // Robots
    setMeta(
      'name',
      'robots',
      noindex ? 'noindex, nofollow' : 'index, follow'
    );

    // Open Graph
    setMeta('property', 'og:title', title);
    setMeta('property', 'og:description', description);
    setMeta('property', 'og:url', canonical || `${BASE_URL}/`);
    setMeta('property', 'og:site_name', 'ZEVRAE');
    setMeta('property', 'og:type', 'website');

    // Canonical
    const canonicalUrl = canonical || `${BASE_URL}/`;

    let canonicalLink = document.head.querySelector(
      'link[rel="canonical"]'
    ) as HTMLLinkElement | null;

    if (!canonicalLink) {
      canonicalLink = document.createElement('link');
      canonicalLink.setAttribute('rel', 'canonical');
      document.head.appendChild(canonicalLink);
    }

    canonicalLink.setAttribute('href', canonicalUrl);
  }, [title, description, canonical, noindex]);

  // ── JSON-LD structured data management ────────────────────────────────────
  // A single [data-seo-jsonld] script tag is created/updated whenever jsonLd
  // changes, and removed on cleanup — prevents stale Product schema when the
  // user navigates between product pages or back to a non-product route.
  useEffect(() => {
    if (!jsonLd) return;

    let script = document.head.querySelector(
      `script[${JSON_LD_ATTR}]`
    ) as HTMLScriptElement | null;

    if (!script) {
      script = document.createElement('script');
      script.type = 'application/ld+json';
      script.setAttribute(JSON_LD_ATTR, 'true');
      document.head.appendChild(script);
    }

    script.textContent = JSON.stringify(jsonLd, null, 0);

    return () => {
      // Remove on unmount (route change) so no stale schema lingers
      const el = document.head.querySelector(`script[${JSON_LD_ATTR}]`);
      if (el) el.remove();
    };
  }, [jsonLd]);

  return null;
}