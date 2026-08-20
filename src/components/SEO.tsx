import { useEffect } from 'react';

interface SEOProps {
  title: string;
  description: string;
  canonical?: string;
  noindex?: boolean;
}

const BASE_URL = 'https://zevrae.com';

export default function SEO({
  title,
  description,
  canonical,
  noindex = false,
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

  return null;
}