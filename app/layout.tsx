import type { Metadata, Viewport } from 'next';
import Script from 'next/script';
import '@/index.css';
import { Providers } from '@/components/Providers';

export const metadata: Metadata = {
  metadataBase: new URL('https://zevrae.com'),
  title: {
    default: 'ZEVRAE | Luxury Is A Matter of Choice',
    template: '%s | ZEVRAE',
  },
  description: "ZEVRAE — contemporary luxury apparel and jewellery. Shop men's and women's clothing, fine jewellery, and accessories, with virtual try-on powered by AI.",
  alternates: {
    canonical: '/',
  },
  icons: {
    icon: '/favicon.png',
  },
  openGraph: {
    type: 'website',
    siteName: 'ZEVRAE',
    title: 'ZEVRAE | Luxury Is A Matter of Choice',
    description: 'Contemporary luxury apparel and jewellery, with virtual try-on powered by AI.',
    url: 'https://zevrae.com/',
    images: [
      {
        url: 'https://zevrae.com/og-image.jpg',
        width: 1200,
        height: 630,
        alt: 'ZEVRAE Contemporary Luxury',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'ZEVRAE | Luxury Is A Matter of Choice',
    description: 'Contemporary luxury apparel and jewellery, with virtual try-on powered by AI.',
    images: ['https://zevrae.com/og-image.jpg'],
  },
};

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
};

const jsonLdWebsite = {
  '@context': 'https://schema.org',
  '@type': 'WebSite',
  name: 'ZEVRAE',
  alternateName: 'ZEVRAE',
  url: 'https://zevrae.com/',
};

const jsonLdOrganization = {
  '@context': 'https://schema.org',
  '@type': 'Organization',
  name: 'ZEVRAE',
  url: 'https://zevrae.com/',
  logo: 'https://zevrae.com/favicon.png',
  description: "ZEVRAE is a contemporary luxury fashion and jewellery brand offering men's and women's clothing, jewellery, and accessories with an AI-powered virtual try-on experience.",
  sameAs: [
    'https://www.instagram.com/zevrae.co/',
    'https://www.linkedin.com/company/zevrae/',
    'https://x.com/zevrae01',
  ],
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=Archivo:wdth,wght@125,700;125,800&family=IBM+Plex+Mono:wght@400;500;600&family=Inter:wght@400;500;600&family=Playfair+Display:ital,wght@0,400;0,600;1,400&display=swap"
          rel="stylesheet"
        />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLdWebsite) }}
        />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLdOrganization) }}
        />
      </head>
      <body>
        <Providers>
          {children}
        </Providers>
        <Script
          src="https://accounts.google.com/gsi/client"
          strategy="afterInteractive"
        />
      </body>
    </html>
  );
}
