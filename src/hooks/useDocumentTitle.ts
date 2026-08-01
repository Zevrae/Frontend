import { useEffect } from 'react';

const SITE_NAME = 'ZEVRAE';

/**
 * Sets document.title (and, optionally, the meta description) for the
 * current page, restoring the previous values on unmount. This is a
 * deliberately minimal substitute for react-helmet — enough to give each
 * route a distinct title for browser tabs/history/bookmarks and for
 * crawlers that execute JS (Googlebot does; most social-share scrapers
 * don't, which is why index.html also carries static Open Graph tags for
 * the homepage as a fallback).
 */
export function useDocumentTitle(title?: string, description?: string) {
  useEffect(() => {
    const prevTitle = document.title;
    let prevDescription: string | null = null;
    let descTag: HTMLMetaElement | null = null;

    if (title) {
      document.title = `${title} | ${SITE_NAME}`;
    }

    if (description) {
      descTag = document.querySelector('meta[name="description"]');
      if (descTag) {
        prevDescription = descTag.getAttribute('content');
        descTag.setAttribute('content', description);
      }
    }

    return () => {
      document.title = prevTitle;
      if (descTag && prevDescription !== null) {
        descTag.setAttribute('content', prevDescription);
      }
    };
  }, [title, description]);
}
