import { readFileSync, writeFileSync, mkdirSync, existsSync } from 'node:fs';
import { resolve, dirname } from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';

import { getProductSchemaCondition } from '../src/utils/productSeo.js';

const __dirname = dirname(fileURLToPath(import.meta.url));
const DIST = resolve(__dirname, '..', 'dist');
const SITE_URL = 'https://thecollectorsexchange.in';
const ROOT_URL = `${SITE_URL}/`;
const ORGANIZATION_ID = `${ROOT_URL}#organization`;
const WEBSITE_ID = `${ROOT_URL}#website`;
const API_URL =
  process.env.API_URL || 'https://uinie5uugg.execute-api.ap-south-1.amazonaws.com/api';

/* ------------------------------------------------------------------ */
/*  Read Vite's built dist/index.html to extract script/style refs     */
/* ------------------------------------------------------------------ */
let VITE_HEAD_EXTRA = '';
let VITE_BODY_EXTRA = '';

function loadViteTemplate() {
  const viteIndex = readFileSync(resolve(DIST, 'index.html'), 'utf-8');
  VITE_HEAD_EXTRA =
    viteIndex
      .split('<head>')[1]
      ?.split('</head>')[0]
      ?.replace(/<title>[\s\S]*?<\/title>/gi, '')
      ?.replace(/<meta charset="UTF-8"\s*\/>/gi, '')
      ?.replace(/<meta name="viewport"[\s\S]*?\/>/gi, '')
      ?.replace(/<meta name="theme-color"[\s\S]*?\/>/gi, '')
      ?.replace(/<meta[^>]*>/gi, '')
      ?.replace(/<link rel="canonical"[^>]*>/gi, '')
      ?.replace(/<link rel="icon"[^>]*>/gi, '')
      ?.trim() ?? '';
  VITE_BODY_EXTRA =
    viteIndex
      .split('<body>')[1]
      ?.split('</body>')[0]
      ?.replace(/<div id="root">[\s\S]*?<\/div>/gi, '')
      ?.trim() ?? '';
}

// Cloudflare Pages 308-redirects directory-style paths without a trailing
// slash to the slash version. Canonical/sitemap URLs must match what
// actually serves 200, or Google flags a redirect/canonical mismatch.
function withTrailingSlash(path) {
  return path.endsWith('/') ? path : `${path}/`;
}

function escapeHtml(str) {
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

function serializeJsonLd(value) {
  return JSON.stringify(value).replace(/[<>&\u2028\u2029]/g, (character) => {
    switch (character) {
      case '<':
        return '\\u003C';
      case '>':
        return '\\u003E';
      case '&':
        return '\\u0026';
      case '\u2028':
        return '\\u2028';
      case '\u2029':
        return '\\u2029';
      default:
        return character;
    }
  });
}

function stripHtml(html) {
  return html
    .replace(/<[^>]*>/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

/* ------------------------------------------------------------------ */
/*  CORE PAGE PRERENDER                                                */
/* ------------------------------------------------------------------ */

const DEFAULT_NAV = [
  { name: 'About Us', path: '/about' },
  { name: 'The Exchange', path: '/category' },
  { name: 'Contact', path: '/contact' },
  { name: 'The Archive', path: '/archive' },
  { name: 'Vision', path: '/vision' },
];

const CORE_PAGES = {
  '/': {
    title: 'Vintage Watches & Rare Collectibles',
    description:
      "India's trusted marketplace for authenticated vintage watches and rare pre-owned collectibles. Every piece verified, every seller vetted, every sale secure.",
    ogImage: '/og-image.png',
    schemaType: null,
    breadcrumb: null,
    navLinks: DEFAULT_NAV,
    video: {
      name: 'The Collectors Exchange — Authenticated Vintage Watches & Rare Collectibles',
      description:
        "Discover authenticated vintage watches, rare collectibles, and expert-verified antiques at The Collectors Exchange. India's trusted marketplace for heritage timepieces.",
      thumbnail: '/og-image.png',
      uploadDate: '2026-01-01T00:00:00+05:30',
      contentUrl: 'https://thecollectorsexchange.in/assets/hero_section-compressed-BX0s--ub.mp4',
      duration: 'PT30S',
    },
  },
  '/about': {
    title: 'About Us',
    description:
      'The story behind The Collectors Exchange — how we source, verify, and authenticate vintage watches and heritage collectibles across India.',
    ogImage: '/og-image.png',
    schemaType: 'AboutPage',
    breadcrumb: [
      { name: 'Home', url: '/' },
      { name: 'About Us', url: '/about' },
    ],
    navLinks: DEFAULT_NAV,
  },
  '/category': {
    title: 'The Exchange',
    description:
      'Browse authenticated vintage watches, timepieces, antiques, jewelry, and collectibles at The Exchange. Mid-range to rare pieces, every listing expert-verified.',
    ogImage: '/og-image.png',
    schemaType: 'CollectionPage',
    breadcrumb: [
      { name: 'Home', url: '/' },
      { name: 'The Exchange', url: '/category' },
    ],
    navLinks: DEFAULT_NAV,
  },
  '/contact': {
    title: 'Contact Us',
    description:
      'Contact The Collectors Exchange for buying, selling, or partnership inquiries. Email support@thecollectorsexchange.in. We respond within 24 to 48 hours.',
    ogImage: '/og-image.png',
    schemaType: 'ContactPage',
    breadcrumb: [
      { name: 'Home', url: '/' },
      { name: 'Contact Us', url: '/contact' },
    ],
    navLinks: DEFAULT_NAV,
  },
  '/faq': {
    title: 'FAQ',
    description:
      'Answers about buying, selling, shipping, payments, and account security on The Collectors Exchange. Learn how authentication, returns, and payouts work.',
    ogImage: '/og-image.png',
    schemaType: 'FAQPage',
    breadcrumb: [
      { name: 'Home', url: '/' },
      { name: 'FAQ', url: '/faq' },
    ],
    navLinks: DEFAULT_NAV,
  },
  '/vision': {
    title: 'Our Vision',
    description:
      'The Collectors Exchange vision: a trusted global archive where heritage, authenticity, and expert verification define how collectors buy and sell.',
    ogImage: '/og-image.png',
    schemaType: 'AboutPage',
    breadcrumb: [
      { name: 'Home', url: '/' },
      { name: 'Our Vision', url: '/vision' },
    ],
    navLinks: DEFAULT_NAV,
  },
  '/returns': {
    title: 'Returns & Refunds',
    description:
      'Return policy for The Collectors Exchange. Items may be returned within 48 hours of delivery if condition does not match the listing description.',
    ogImage: '/og-image.png',
    schemaType: 'WebPage',
    breadcrumb: [
      { name: 'Home', url: '/' },
      { name: 'Returns & Refunds', url: '/returns' },
    ],
    navLinks: DEFAULT_NAV,
  },
  '/privacy': {
    title: 'Privacy Policy',
    description:
      'Privacy Policy for The Collectors Exchange. How we collect, use, and protect your personal data when you buy, sell, or browse our marketplace.',
    ogImage: '/og-image.png',
    schemaType: 'WebPage',
    breadcrumb: [
      { name: 'Home', url: '/' },
      { name: 'Privacy Policy', url: '/privacy' },
    ],
    navLinks: DEFAULT_NAV,
  },
  '/terms': {
    title: 'Terms & Conditions',
    description:
      'Terms and Conditions for using The Collectors Exchange marketplace, including buyer inspection periods, seller obligations, and platform fees.',
    ogImage: '/og-image.png',
    schemaType: 'WebPage',
    breadcrumb: [
      { name: 'Home', url: '/' },
      { name: 'Terms & Conditions', url: '/terms' },
    ],
    navLinks: DEFAULT_NAV,
  },
  '/founders-note': {
    title: "Founder's Note",
    description:
      "A personal note from the founder of The Collectors Exchange on building India's trusted marketplace for authenticated collectibles and vintage watches.",
    ogImage: '/og-image.png',
    schemaType: 'WebPage',
    breadcrumb: [
      { name: 'Home', url: '/' },
      { name: "Founder's Note", url: '/founders-note' },
    ],
    navLinks: DEFAULT_NAV,
  },
  '/seller-agreement': {
    title: 'Seller Agreement',
    description:
      'Seller Agreement for listing on The Collectors Exchange. KYC requirements, listing limits, commission structure, and payout terms for vendors.',
    ogImage: '/og-image.png',
    schemaType: 'WebPage',
    breadcrumb: [
      { name: 'Home', url: '/' },
      { name: 'Seller Agreement', url: '/seller-agreement' },
    ],
    navLinks: DEFAULT_NAV,
  },
};

const CATEGORY_LANDINGS = [
  {
    slug: 'timepieces',
    name: 'Timepieces',
    tagline: 'The Mechanical Heartbeat',
    intro:
      'Your phone tells the time. A mechanical watch tells a story. In a world of flickering screens and disposable tech, we choose the "Mechanical Truth." We don\'t sell battery-powered fashion; we rescue 17-jewel heartbeats that never need a plug or an algorithm to live.',
    description:
      'Shop authenticated vintage watches and timepieces at The Collectors Exchange. Rolex, Omega, HMT, Seiko and more — expert-verified, mid-range to rare, with secure transactions across India.',
  },
  {
    slug: 'accessories',
    name: 'Accessories',
    tagline: 'The Perfect Finish',
    intro:
      'An outfit is a statement. The right accessory makes it iconic. In a world of fast fashion and disposable trends, we choose the "Enduring Truth." We rescue the definitive finishing pieces — the cufflinks, bags, belts, and heirlooms that transform the ordinary into the extraordinary.',
    description:
      'Shop authenticated vintage accessories at The Collectors Exchange, including cufflinks, bags, belts, and heirloom pieces.',
  },
  {
    slug: 'collectibles',
    name: 'Collectibles',
    tagline: 'The Curated Pulse',
    intro:
      'A trend lasts a season. A collectible lasts a lifetime. In a world of digital clutter and fast consumption, we choose the "Physical Truth." We rescue the rare, nostalgic, and culturally significant objects worth preserving.',
    description:
      'Shop rare, curated collectibles at The Collectors Exchange, including nostalgic and culturally significant pieces.',
  },
  {
    slug: 'antiques',
    name: 'Antiques',
    tagline: 'The Ancestral Anchor',
    intro:
      'A replica fills a space. An antique commands it. In a world of mass-produced vintage-look decor, we choose the "Ancestral Truth." We rescue weathered survivors of history that carry their craft and generations with them.',
    description:
      'Shop authenticated antiques at The Collectors Exchange, including heritage furniture, decor, and historical pieces.',
  },
  {
    slug: 'toys-and-pop-culture',
    name: 'Toys & Pop Culture',
    tagline: 'The Nostalgic Truth',
    intro:
      'A plaything is for a moment. A pop icon is for the ages. We rescue definitive action figures, limited figurines, and media artifacts that shaped childhoods and culture.',
    description:
      'Shop vintage toys and pop culture collectibles at The Collectors Exchange, including action figures, limited figurines, and media artifacts.',
  },
  {
    slug: 'jewelry',
    name: 'Jewelry',
    tagline: 'The TCE Original',
    intro:
      'A brand sells status. A TCE Original is designed as a legacy. After years of studying master artisans, The Collectors Exchange now creates pieces informed by the craftsmanship it preserves.',
    description:
      'Shop authenticated vintage jewelry and TCE Original pieces at The Collectors Exchange.',
  },
];

function buildHomeEntityGraph() {
  return {
    '@context': 'https://schema.org',
    '@graph': [
      {
        '@type': 'Organization',
        '@id': ORGANIZATION_ID,
        name: 'The Collectors Exchange',
        url: ROOT_URL,
        logo: `${SITE_URL}/favicon.png`,
        description:
          "India's trusted marketplace for authenticated vintage watches and rare pre-owned collectibles. Every piece verified, every seller vetted, every sale secure.",
        foundingDate: '2024',
        email: 'support@thecollectorsexchange.in',
        sameAs: [
          'https://www.instagram.com/the_collectors_exchange/',
          'https://www.facebook.com/share/18mue4rLC4/',
          'https://x.com/TCE_store',
          'https://www.linkedin.com/company/thecollectorsexchange',
        ],
        address: {
          '@type': 'PostalAddress',
          streetAddress: 'New Guruppanapalya',
          addressLocality: 'Bengaluru',
          addressRegion: 'Karnataka',
          postalCode: '560029',
          addressCountry: 'IN',
        },
      },
      {
        '@type': 'WebSite',
        '@id': WEBSITE_ID,
        name: 'The Collectors Exchange',
        url: ROOT_URL,
        publisher: { '@id': ORGANIZATION_ID },
        potentialAction: {
          '@type': 'SearchAction',
          target: {
            '@type': 'EntryPoint',
            urlTemplate: `${SITE_URL}/category/?q={search_term_string}`,
          },
          'query-input': 'required name=search_term_string',
        },
        description:
          "India's trusted marketplace for authenticated vintage watches and rare pre-owned collectibles. Every piece verified, every seller vetted, every sale secure.",
      },
    ],
  };
}

function buildCorePageSchemas(path, page) {
  const schemas = [];

  if (path === '/') {
    schemas.push(buildHomeEntityGraph());
  }

  if (page.schemaType) {
    schemas.push({
      '@context': 'https://schema.org',
      '@type': page.schemaType,
      name: page.title,
      description: page.description,
      url: `${SITE_URL}${withTrailingSlash(path)}`,
      isPartOf: {
        '@type': 'WebSite',
        name: 'The Collectors Exchange',
        url: SITE_URL,
      },
      publisher: {
        '@context': 'https://schema.org',
        '@type': 'Organization',
        name: 'The Collectors Exchange',
        url: SITE_URL,
        logo: `${SITE_URL}/favicon.png`,
      },
    });
  }

  if (page.video) {
    schemas.push({
      '@context': 'https://schema.org',
      '@type': 'VideoObject',
      name: page.video.name,
      description: page.video.description,
      thumbnailUrl: `${SITE_URL}${page.video.thumbnail}`,
      uploadDate: page.video.uploadDate,
      contentUrl: page.video.contentUrl,
      duration: page.video.duration,
    });
  }

  if (page.breadcrumb) {
    schemas.push({
      '@context': 'https://schema.org',
      '@type': 'BreadcrumbList',
      itemListElement: page.breadcrumb.map((item, i) => ({
        '@type': 'ListItem',
        position: i + 1,
        name: item.name,
        item: item.url ? `${SITE_URL}${withTrailingSlash(item.url)}` : undefined,
      })),
    });
  }

  return schemas;
}

function buildCorePageMetaTags(path, page) {
  const title = escapeHtml(page.title);
  const desc = escapeHtml(page.description);
  const image = `${SITE_URL}${page.ogImage}`;
  const canonical = `${SITE_URL}${withTrailingSlash(path)}`;
  const schemas = buildCorePageSchemas(path, page);

  const schemaTags = schemas
    .map((s) => `<script type="application/ld+json">${serializeJsonLd(s)}</script>`)
    .join('\n    ');

  return `
    <title>${title} — The Collectors Exchange</title>
    <meta name="description" content="${desc}" />
    <link rel="canonical" href="${canonical}" />
    <meta name="robots" content="index, follow, max-snippet:-1, max-image-preview:large, max-video-preview:-1" />

    <meta property="og:site_name" content="The Collectors Exchange" />
    <meta property="og:title" content="${title}" />
    <meta property="og:description" content="${desc}" />
    <meta property="og:image" content="${image}" />
    <meta property="og:image:width" content="1200" />
    <meta property="og:image:height" content="630" />
    <meta property="og:type" content="website" />
    <meta property="og:url" content="${canonical}" />
    <meta property="og:locale" content="en_IN" />

    <meta name="twitter:card" content="summary_large_image" />
    <meta name="twitter:site" content="@TCE_store" />
    <meta name="twitter:creator" content="@TCE_store" />
    <meta name="twitter:title" content="${title}" />
    <meta name="twitter:description" content="${desc}" />
    <meta name="twitter:image" content="${image}" />

    <!-- Facebook / Meta domain ownership verification -->
    <meta name="facebook-domain-verification" content="pc03600zuo2z6e3bwn0i3vj7nbz6j8" />

    ${schemaTags}`;
}

function buildCorePageHtml(path, page, metaTags) {
  const isHome = path === '/';
  const navLinks = page.navLinks || [];

  const navHtml = navLinks
    .map(
      (l) =>
        `<a href="${l.path}" style="color:#1C1C1C;text-decoration:none;font-size:11px;font-weight:500;text-transform:uppercase;letter-spacing:0.15em;white-space:nowrap">${escapeHtml(l.name)}</a>`,
    )
    .join('');

  return `<!DOCTYPE html>
<html lang="en-IN">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <meta name="theme-color" content="#000000" />
  <meta name="robots" content="index, follow, max-snippet:-1, max-image-preview:large, max-video-preview:-1" />
  <link rel="icon" type="image/png" href="/favicon.png" />
  <link rel="preconnect" href="https://fonts.googleapis.com" />
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin />
  <link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600&family=Playfair+Display:wght@400;600;700&display=swap" media="print" onload="this.media='all'" />
  <noscript><link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600&family=Playfair+Display:wght@400;600;700&display=swap" /></noscript>
  ${metaTags}
  ${VITE_HEAD_EXTRA}
  <style>
    body{margin:0;padding:0;font-family:'Inter',system-ui,-apple-system,sans-serif;background:#fff;color:#1C1C1C;-webkit-font-smoothing:antialiased}
    h1,h2,h3,h4,h5,h6{font-family:'Playfair Display',Georgia,serif}
    .nav-bar{position:fixed;top:0;left:0;right:0;z-index:50;background:#fff;border-bottom:1px solid #f0f0f0;padding:12px 24px;display:flex;align-items:center;justify-content:space-between}
    .nav-brand{font-family:'Playfair Display',Georgia,serif;font-weight:700;font-size:16px;letter-spacing:0.05em;color:#1C1C1C;text-decoration:none}
    .nav-links{display:flex;gap:32px;align-items:center}
    .spinner{width:40px;height:40px;border:2px solid #D4AF37;border-top-color:transparent;border-radius:50%;animation:spin .6s linear infinite;margin:4rem auto}
    @keyframes spin{to{transform:rotate(360deg)}}
    .loading{text-align:center;padding:4rem 1.5rem;color:#999;font-style:italic}
    .footer{background:#000;color:#fff;padding:48px 24px;text-align:center;margin-top:auto}
    .footer a{color:#D4AF37;text-decoration:none;font-size:12px;text-transform:uppercase;letter-spacing:0.15em}
    .skip-link{position:absolute;top:-40px;left:0;background:#000;color:#fff;padding:8px 16px;z-index:100;font-size:12px;text-transform:uppercase;letter-spacing:0.15em;text-decoration:none}
    .skip-link:focus{top:0}
    .min-h-screen{min-height:100vh;display:flex;flex-direction:column}
    .flex-grow{flex:1}
  </style>
</head>
<body>
  <div id="root">
  <div class="min-h-screen">
    <a href="#main-content" class="skip-link">Skip to main content</a>
    <nav class="nav-bar" aria-label="Main navigation">
      <a href="/" class="nav-brand">THE COLLECTORS EXCHANGE</a>
      <div class="nav-links">
        ${navHtml}
      </div>
    </nav>
    <main id="main-content" class="flex-grow" style="padding-top:60px">
      ${isHome ? '<div style="background:#1C1C1C;color:#fff;min-height:80vh;display:flex;align-items:center;justify-content:center;text-align:center;padding:4rem 1.5rem"><div><h1 style="font-family:\'Playfair Display\',Georgia,serif;font-size:clamp(2rem,5vw,4rem);margin:0 0 1rem">Authenticated Vintage Watches & Rare Collectibles</h1><p style="color:rgba(255,255,255,.6);max-width:600px;margin:0 auto 2rem;font-size:1rem;line-height:1.7">India\'s curated marketplace for verified pre-owned collectibles, antiques, and limited-edition timepieces. Every item is authenticated before listing.</p><a href="/category" style="display:inline-block;background:#000;color:#fff;border:1px solid #D4AF37;padding:14px 32px;font-size:11px;text-transform:uppercase;letter-spacing:0.15em;text-decoration:none;transition:background .3s">Browse The Exchange</a></div></div>' : `<div style="padding:4rem 1.5rem;text-align:center"><h1 style="font-family:'Playfair Display',Georgia,serif;font-size:clamp(1.5rem,5vw,3rem)">${escapeHtml(page.title)}</h1><p style="color:#666;max-width:600px;margin:1rem auto;line-height:1.7">${escapeHtml(page.description)}</p></div>`}
      <div class="loading">
        <div class="spinner"></div>
        <p>Loading content...</p>
      </div>
    </main>
    <footer class="footer">
      <a href="/about">About</a> &middot;
      <a href="/category">The Exchange</a> &middot;
      <a href="/contact">Contact</a> &middot;
      <a href="/faq">FAQ</a> &middot;
      <a href="/archive">The Archive</a>
      <p style="color:#666;font-size:11px;margin-top:16px">&copy; ${new Date().getFullYear()} The Collectors Exchange. All rights reserved.</p>
    </footer>
  </div>
  </div>
  ${VITE_BODY_EXTRA}
</body>
</html>`;
}

/* ------------------------------------------------------------------ */
/*  SHARED NAV / FOOTER SHELL                                          */
/* ------------------------------------------------------------------ */

const NAV_HTML = DEFAULT_NAV.map(
  (l) =>
    `<a href="${l.path}" style="color:#1C1C1C;text-decoration:none;font-size:11px;font-weight:500;text-transform:uppercase;letter-spacing:0.15em;white-space:nowrap">${escapeHtml(l.name)}</a>`,
).join('');

const SHELL_HEAD = `
  <link rel="preconnect" href="https://fonts.googleapis.com" />
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin />
  <link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600&family=Playfair+Display:wght@400;600;700&display=swap" media="print" onload="this.media='all'" />
  <noscript><link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600&family=Playfair+Display:wght@400;600;700&display=swap" /></noscript>
  <style>
    .nav-bar{position:fixed;top:0;left:0;right:0;z-index:50;background:#fff;border-bottom:1px solid #f0f0f0;padding:12px 24px;display:flex;align-items:center;justify-content:space-between}
    .nav-brand{font-family:'Playfair Display',Georgia,serif;font-weight:700;font-size:16px;letter-spacing:0.05em;color:#1C1C1C;text-decoration:none}
    .nav-links{display:flex;gap:32px;align-items:center}
    .site-footer{background:#000;color:#fff;padding:48px 24px;text-align:center;margin-top:auto}
    .site-footer a{color:#D4AF37;text-decoration:none;font-size:12px;text-transform:uppercase;letter-spacing:0.15em}
    .skip-link{position:absolute;top:-40px;left:0;background:#000;color:#fff;padding:8px 16px;z-index:100;font-size:12px;text-transform:uppercase;letter-spacing:0.15em;text-decoration:none}
    .skip-link:focus{top:0}
  </style>`;

const SHELL_NAV = `
    <a href="#main-content" class="skip-link">Skip to main content</a>
    <nav class="nav-bar" aria-label="Main navigation">
      <a href="/" class="nav-brand">THE COLLECTORS EXCHANGE</a>
      <div class="nav-links">${NAV_HTML}</div>
    </nav>`;

const SHELL_FOOTER = `
    <footer class="site-footer">
      <a href="/about">About</a> &middot;
      <a href="/category">The Exchange</a> &middot;
      <a href="/contact">Contact</a> &middot;
      <a href="/faq">FAQ</a> &middot;
      <a href="/archive">The Archive</a>
      <p style="color:#666;font-size:11px;margin-top:16px">&copy; ${new Date().getFullYear()} The Collectors Exchange. All rights reserved.</p>
    </footer>`;

/* ------------------------------------------------------------------ */
/*  BLOG PRERENDER                                                     */
/* ------------------------------------------------------------------ */

function buildMetaTags(post) {
  const title = escapeHtml(post.metaTitle || post.title);
  const desc = escapeHtml(post.metaDescription || post.excerpt || '');
  const image = post.coverImage || `${SITE_URL}/og-image.png`;
  const canonical = `${SITE_URL}/archive/${post.slug}/`;
  const published =
    post.publishedAt || post.createdAt
      ? new Date(post.publishedAt || post.createdAt).toISOString()
      : '';
  const modified =
    post.updatedAt || post.publishedAt || post.createdAt
      ? new Date(post.updatedAt || post.publishedAt || post.createdAt).toISOString()
      : '';

  const articleSchema = {
    '@context': 'https://schema.org',
    '@type': 'Article',
    headline: post.title,
    image: image,
    datePublished: published,
    dateModified: modified,
    author: {
      '@type': 'Person',
      name: post.author || 'The Collectors Exchange',
    },
    publisher: {
      '@type': 'Organization',
      name: 'The Collectors Exchange',
      logo: { '@type': 'ImageObject', url: `${SITE_URL}/favicon.png` },
    },
  };

  const breadcrumbSchema = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: [
      { '@type': 'ListItem', position: 1, name: 'Home', item: SITE_URL },
      { '@type': 'ListItem', position: 2, name: 'The Archive', item: `${SITE_URL}/archive/` },
      {
        '@type': 'ListItem',
        position: 3,
        name: post.title,
        item: canonical,
      },
    ],
  };

  return `
    <title>${title} — The Collectors Exchange</title>
    <meta name="description" content="${desc}" />
    <link rel="canonical" href="${canonical}" />
    <meta name="robots" content="index, follow, max-snippet:-1, max-image-preview:large, max-video-preview:-1" />

    <meta property="og:site_name" content="The Collectors Exchange" />
    <meta property="og:title" content="${title}" />
    <meta property="og:description" content="${desc}" />
    <meta property="og:image" content="${escapeHtml(image)}" />
    <meta property="og:image:width" content="1200" />
    <meta property="og:image:height" content="630" />
    <meta property="og:type" content="article" />
    <meta property="og:url" content="${canonical}" />
    <meta property="og:locale" content="en_IN" />
    ${published ? `<meta property="article:published_time" content="${published}" />` : ''}
    ${modified ? `<meta property="article:modified_time" content="${modified}" />` : ''}

    <meta name="twitter:card" content="summary_large_image" />
    <meta name="twitter:site" content="@TCE_store" />
    <meta name="twitter:creator" content="@TCE_store" />
    <meta name="twitter:title" content="${title}" />
    <meta name="twitter:description" content="${desc}" />
    <meta name="twitter:image" content="${escapeHtml(image)}" />

    <script type="application/ld+json">${serializeJsonLd(articleSchema)}</script>
    <script type="application/ld+json">${serializeJsonLd(breadcrumbSchema)}</script>`;
}

function buildBlogHtml(post, metaTags) {
  const excerpt = escapeHtml(stripHtml(post.excerpt || ''));
  const coverImage = post.coverImage || '';
  const readingTime =
    post.readingTime ||
    Math.max(1, Math.ceil(stripHtml(post.content || '').split(/\s+/).length / 200));
  const published =
    post.publishedAt || post.createdAt
      ? new Date(post.publishedAt || post.createdAt).toLocaleDateString('en-US', {
          year: 'numeric',
          month: 'long',
          day: 'numeric',
        })
      : '';
  const contentHtml = post.content || '';

  return `<!DOCTYPE html>
<html lang="en-IN">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <meta name="theme-color" content="#000000" />
  <link rel="icon" type="image/png" href="/favicon.png" />
  ${metaTags}
  ${SHELL_HEAD}
  ${VITE_HEAD_EXTRA}
  <style>
    body{margin:0;padding:0;font-family:'Inter',system-ui,-apple-system,sans-serif;background:#fff;color:#1C1C1C;-webkit-font-smoothing:antialiased}
    .blog-hero{position:relative;height:50vh;min-height:300px;overflow:hidden}
    .blog-hero img{width:100%;height:100%;object-fit:cover}
    .blog-hero .overlay{position:absolute;inset:0;background:linear-gradient(to top,rgba(0,0,0,.7),rgba(0,0,0,.2) 60%,transparent)}
    .blog-hero .content{position:absolute;bottom:0;left:0;right:0;padding:2rem}
    .blog-hero .container{max-width:800px;margin:0 auto}
    .blog-hero .category{display:inline-block;font-size:.65rem;text-transform:uppercase;letter-spacing:.2em;font-weight:700;color:#D4AF37;background:rgba(0,0,0,.3);padding:.35rem .75rem;border-radius:9999px;margin-bottom:.75rem}
    .blog-hero h1{font-family:'Playfair Display',Georgia,serif;font-size:clamp(1.5rem,5vw,3rem);color:#fff;line-height:1.15;margin:0 0 .5rem}
    .meta-bar{border-bottom:1px solid #f0f0f0;padding:1rem 0;font-size:.85rem;color:#888;display:flex;gap:1rem;flex-wrap:wrap}
    .meta-bar .container{max-width:800px;margin:0 auto;padding:0 1.5rem}
    .article-body{max-width:800px;margin:0 auto;padding:2rem 1.5rem}
    .article-body h2{font-family:'Playfair Display',Georgia,serif;font-size:1.75rem;color:#1C1C1C;margin:2.5rem 0 1rem;padding-bottom:.5rem;border-bottom:1px solid #f0f0f0}
    .article-body p{line-height:1.8;color:#1C1C1Ccc;margin-bottom:1.25rem}
    .article-body img{max-width:100%;height:auto;border-radius:2px;margin:1.5rem 0}
    .article-body blockquote{border-left:3px solid #D4AF37;background:#FAF8F5;padding:1.25rem 1.5rem;margin:1.5rem 0;font-style:italic;border-radius:0 2px 2px 0}
    .article-body a{color:#D4AF37;text-decoration:none}
    .article-body a:hover{text-decoration:underline}
    .author-box{max-width:800px;margin:3rem auto;padding:0 1.5rem;padding-top:2rem;border-top:1px solid #f0f0f0}
    .author-box .label{font-size:.7rem;text-transform:uppercase;letter-spacing:.15em;font-weight:700;color:#D4AF37;margin-bottom:.5rem}
    .author-box .name{font-family:'Playfair Display',Georgia,serif;font-weight:700;color:#1C1C1C}
    .author-box .bio{font-size:.85rem;color:#888;line-height:1.6;margin-top:.35rem}
    .cta{text-align:center;padding:3rem 1.5rem}
    .cta a{display:inline-block;background:#000;color:#fff;padding:.85rem 2rem;font-size:.75rem;text-transform:uppercase;letter-spacing:.15em;text-decoration:none}
    .cta a:hover{background:#D4AF37}
    .back-link{display:inline-flex;align-items:center;gap:.5rem;color:rgba(255,255,255,.6);font-size:.75rem;text-transform:uppercase;letter-spacing:.15em;text-decoration:none;margin-bottom:1rem}
    .back-link:hover{color:#D4AF37}
  </style>
</head>
<body>
  <div id="root">
  <div style="min-height:100vh;display:flex;flex-direction:column">
    ${SHELL_NAV}
    <main id="main-content" style="flex:1;padding-top:60px">
  ${
    coverImage
      ? `
  <div class="blog-hero">
    <img src="${escapeHtml(coverImage)}" alt="${escapeHtml(post.title)}" fetchpriority="high" />
    <div class="overlay"></div>
    <div class="content">
      <div class="container">
        <a href="/archive" class="back-link">&larr; Back to Archive</a>
        <span class="category">${escapeHtml(post.category || '')}</span>
        <h1>${escapeHtml(post.title)}</h1>
        <div style="color:rgba(255,255,255,.6);font-size:.85rem;margin-top:.5rem">
          ${escapeHtml(post.author || '')} &middot; ${published} &middot; ${readingTime} min read
        </div>
      </div>
    </div>
  </div>`
      : `
  <div style="background:#1C1C1C;padding:4rem 1.5rem;text-align:center">
    <div style="max-width:800px;margin:0 auto">
      <a href="/archive" class="back-link" style="color:rgba(255,255,255,.6)">&larr; Back to Archive</a>
      <span class="category" style="display:inline-block;font-size:.65rem;text-transform:uppercase;letter-spacing:.2em;font-weight:700;color:#D4AF37;margin-bottom:1rem">${escapeHtml(post.category || '')}</span>
      <h1 style="font-family:'Playfair Display',Georgia,serif;font-size:clamp(1.5rem,5vw,3rem);color:#fff;line-height:1.15;margin:0 0 .5rem">${escapeHtml(post.title)}</h1>
      <div style="color:rgba(255,255,255,.6);font-size:.85rem">
        ${escapeHtml(post.author || '')} &middot; ${published} &middot; ${readingTime} min read
      </div>
    </div>
  </div>`
  }

  <div class="meta-bar">
    <div class="container">
      <span>${escapeHtml(post.author || '')}</span>
      <span>${published}</span>
      <span>${readingTime} min read</span>
    </div>
  </div>

  <article class="article-body">
    ${contentHtml}
  </article>

  <div class="author-box">
    <div class="label">Written by</div>
    <div class="name">${escapeHtml(post.author || 'The Collectors Exchange')}</div>
    <div class="bio">The Collectors Exchange is a curated marketplace for verified pre-owned collectibles and antiques.</div>
  </div>

  <div class="cta">
    <a href="/archive">Browse The Archive &rarr;</a>
  </div>
    </main>
    ${SHELL_FOOTER}
  </div>
  </div>
  ${VITE_BODY_EXTRA}
</body>
</html>`;
}

/**
 * Cloudflare Pages serves this automatically for any request that matches
 * neither a static asset nor a rule in _redirects — giving genuine HTTP 404s
 * for typos, dead links and probe traffic instead of a 200 SPA shell.
 */
function build404Html() {
  return `<!DOCTYPE html>
<html lang="en-IN">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <meta name="theme-color" content="#000000" />
  <link rel="icon" type="image/png" href="/favicon.png" />
  <title>Page Not Found — The Collectors Exchange</title>
  <meta name="robots" content="noindex, follow" />
  <meta name="description" content="This page could not be found. Browse authenticated vintage watches and rare collectibles at The Collectors Exchange." />
  ${SHELL_HEAD}
  <style>
    body{margin:0;padding:0;font-family:'Inter',system-ui,-apple-system,sans-serif;background:#0A0A0A;color:#FAF8F5;-webkit-font-smoothing:antialiased}
    .wrap{min-height:100vh;display:flex;flex-direction:column;align-items:center;justify-content:center;text-align:center;padding:6rem 1.5rem}
    .code{font-family:'Playfair Display',Georgia,serif;font-size:clamp(4rem,14vw,7rem);color:#D4AF37;line-height:1;margin:0}
    .rule{width:120px;height:2px;background:linear-gradient(90deg,transparent,#D4AF37,transparent);margin:1.75rem 0}
    h1{font-family:'Playfair Display',Georgia,serif;font-size:clamp(1.4rem,4vw,2.1rem);font-weight:600;margin:0 0 .9rem;color:#fff}
    p{color:rgba(245,240,232,.62);max-width:520px;line-height:1.65;margin:0 0 2.4rem;font-size:1rem}
    .links{display:flex;flex-wrap:wrap;gap:.9rem;justify-content:center}
    .btn{display:inline-block;padding:15px 34px;font-size:11px;text-transform:uppercase;letter-spacing:.18em;text-decoration:none;border-radius:999px;transition:all .3s}
    .primary{background:#D4AF37;color:#0A0A0A;font-weight:600}
    .secondary{border:1px solid rgba(212,175,55,.45);color:#D4AF37}
  </style>
</head>
<body>
  <div class="wrap">
    <p class="code">404</p>
    <div class="rule"></div>
    <h1>This record could not be located.</h1>
    <p>The page you're looking for may have been moved, or the listing may have already found its collector.</p>
    <div class="links">
      <a class="btn primary" href="/category/">Browse The Exchange</a>
      <a class="btn secondary" href="/">Return Home</a>
    </div>
  </div>
</body>
</html>`;
}

function formatDate(value) {
  if (!value) return '';

  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return '';

  return date.toLocaleDateString('en-IN', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });
}

function formatPrice(value) {
  if (value == null || value === '') return '';

  const numericValue = Number(value);
  return Number.isFinite(numericValue) ? `₹${numericValue.toLocaleString('en-IN')}` : String(value);
}

function buildArchiveIndexHtml(posts = []) {
  const publishedPosts = posts.filter(
    (post) => post?.slug && (!post.status || post.status === 'PUBLISHED'),
  );
  const articleCards = publishedPosts
    .map((post) => {
      const published = formatDate(post.publishedAt || post.createdAt);
      const excerpt = stripHtml(post.excerpt || '');

      return `<article class="archive-card">
        ${
          post.coverImage
            ? `<a href="/archive/${encodeURIComponent(post.slug)}/" aria-label="Read ${escapeHtml(post.title)}"><img src="${escapeHtml(post.coverImage)}" alt="" loading="lazy" /></a>`
            : ''
        }
        <div class="archive-card-content">
          ${post.category ? `<p class="archive-category">${escapeHtml(post.category)}</p>` : ''}
          <h2><a href="/archive/${encodeURIComponent(post.slug)}/">${escapeHtml(post.title)}</a></h2>
          ${excerpt ? `<p>${escapeHtml(excerpt)}</p>` : ''}
          ${published ? `<time datetime="${escapeHtml(post.publishedAt || post.createdAt)}">${escapeHtml(published)}</time>` : ''}
        </div>
      </article>`;
    })
    .join('\n');

  return `<!DOCTYPE html>
<html lang="en-IN">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <meta name="theme-color" content="#000000" />
  <link rel="icon" type="image/png" href="/favicon.png" />
  <title>The Archive — The Collectors Exchange</title>
  <meta name="description" content="Explore The Collectors Exchange Archive. Curated articles on horology, gemology, collecting, and the stories behind rare artifacts." />
  <link rel="canonical" href="${SITE_URL}/archive/" />
  <meta name="robots" content="index, follow, max-snippet:-1, max-image-preview:large, max-video-preview:-1" />
  <meta property="og:site_name" content="The Collectors Exchange" />
  <meta property="og:title" content="The Archive — The Collectors Exchange" />
  <meta property="og:description" content="Explore The Collectors Exchange Archive. Curated articles on horology, gemology, collecting, and the stories behind rare artifacts." />
  <meta property="og:image" content="${SITE_URL}/og-image.png" />
  <meta property="og:image:width" content="1200" />
  <meta property="og:image:height" content="630" />
  <meta property="og:type" content="website" />
  <meta property="og:url" content="${SITE_URL}/archive/" />
  <meta property="og:locale" content="en_IN" />
  <meta name="twitter:card" content="summary_large_image" />
  <meta name="twitter:site" content="@TCE_store" />
  <meta name="twitter:title" content="The Archive — The Collectors Exchange" />
  <meta name="twitter:description" content="Explore The Collectors Exchange Archive. Curated articles on horology, gemology, collecting, and the stories behind rare artifacts." />
  <meta name="twitter:image" content="${SITE_URL}/og-image.png" />
  <script type="application/ld+json">${serializeJsonLd({
    '@context': 'https://schema.org',
    '@type': 'CollectionPage',
    name: 'The Archive',
    description:
      'Curated articles on horology, gemology, collecting, and the stories behind rare artifacts.',
    url: `${SITE_URL}/archive/`,
    isPartOf: {
      '@type': 'WebSite',
      name: 'The Collectors Exchange',
      url: SITE_URL,
    },
  })}</script>
  <script type="application/ld+json">${serializeJsonLd({
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: [
      { '@type': 'ListItem', position: 1, name: 'Home', item: SITE_URL },
      { '@type': 'ListItem', position: 2, name: 'The Archive', item: `${SITE_URL}/archive/` },
    ],
  })}</script>
  ${SHELL_HEAD}
  ${VITE_HEAD_EXTRA}
  <style>
    body{margin:0;padding:0;font-family:'Inter',system-ui,sans-serif;background:#fff;color:#1C1C1C}
    .hero{background:#1C1C1C;padding:5rem 1.5rem;text-align:center}
    .hero h1{font-family:'Playfair Display',Georgia,serif;font-size:clamp(1.8rem,5vw,3.5rem);color:#fff;margin:0 0 1rem}
    .hero p{color:rgba(255,255,255,.6);max-width:600px;margin:0 auto;font-size:1rem;line-height:1.7}
    .archive-grid{display:grid;grid-template-columns:repeat(auto-fit,minmax(260px,1fr));gap:2rem;max-width:1100px;margin:0 auto;padding:4rem 1.5rem}
    .archive-card{border:1px solid #eee;background:#fff}
    .archive-card img{display:block;width:100%;aspect-ratio:16/9;object-fit:cover;background:#f5f5f5}
    .archive-card-content{padding:1.25rem}
    .archive-category{font-size:.68rem;text-transform:uppercase;letter-spacing:.18em;color:#9a7a22;font-weight:700;margin:0 0 .65rem}
    .archive-card h2{font-family:'Playfair Display',Georgia,serif;font-size:1.35rem;line-height:1.3;margin:0 0 .75rem}
    .archive-card h2 a{color:#1C1C1C;text-decoration:none}
    .archive-card p{color:#666;line-height:1.65}
    .archive-card time{display:block;color:#888;font-size:.8rem;margin-top:1rem}
    .archive-empty{max-width:700px;margin:0 auto;padding:4rem 1.5rem;text-align:center;color:#666}
  </style>
</head>
<body>
  <div id="root">
  <div style="min-height:100vh;display:flex;flex-direction:column">
    ${SHELL_NAV}
    <main id="main-content" style="flex:1;padding-top:60px">
      <div class="hero">
        <h1>The Archive</h1>
        <p>Stories behind the artifacts. Curated insights on horology, gemology, collecting, and the art of preservation.</p>
      </div>
      ${
        articleCards
          ? `<section class="archive-grid" aria-label="Archive articles">${articleCards}</section>`
          : '<p class="archive-empty">No published articles are currently available.</p>'
      }
    </main>
    ${SHELL_FOOTER}
  </div>
  </div>
  ${VITE_BODY_EXTRA}
</body>
</html>`;
}

function buildCategoryHtml(products = [], categorySlug = null) {
  const hubPage = CORE_PAGES['/category'];
  const landing = CATEGORY_LANDINGS.find((category) => category.slug === categorySlug) || null;
  const path = landing ? `/category/${landing.slug}` : '/category';
  const visibleProducts = landing
    ? products.filter((product) => product.category?.toLowerCase() === landing.name.toLowerCase())
    : products;
  const page = landing
    ? {
        ...hubPage,
        title: `${landing.name} — The Exchange`,
        description: landing.description,
        breadcrumb: [
          ...hubPage.breadcrumb,
          { name: landing.name, url: `/category/${landing.slug}` },
        ],
      }
    : hubPage;
  const metaTags = buildCorePageMetaTags(path, page);
  const itemListSchema = {
    '@context': 'https://schema.org',
    '@type': 'ItemList',
    '@id': `${SITE_URL}${withTrailingSlash(path)}#item-list`,
    name: landing ? `${landing.name} listings` : 'The Exchange listings',
    numberOfItems: visibleProducts.length,
    itemListElement: visibleProducts.map((product, index) => ({
      '@type': 'ListItem',
      position: index + 1,
      url: `${SITE_URL}/product/${product.id}/`,
      item: {
        '@type': 'Product',
        '@id': `${SITE_URL}/product/${product.id}/#product`,
        name: product.title,
        ...(product.images?.[0] || product.image
          ? { image: product.images?.[0] || product.image }
          : {}),
      },
    })),
  };
  const categoryLinks = CATEGORY_LANDINGS.map((category) => {
    const count = products.filter(
      (product) => product.category?.toLowerCase() === category.name.toLowerCase(),
    ).length;
    return `<a href="/category/${category.slug}/">${escapeHtml(category.name)} <span>(${count})</span></a>`;
  }).join('\n');
  const productCards = visibleProducts
    .filter((product) => product?.id && product?.title)
    .map((product) => {
      const image = product.images?.[0] || product.image || '';
      const price = formatPrice(product.price);

      return `<article class="catalogue-card">
        ${
          image
            ? `<a href="/product/${encodeURIComponent(String(product.id))}/" aria-label="View ${escapeHtml(product.title)}"><img src="${escapeHtml(image)}" alt="${escapeHtml(product.title)}" loading="lazy" /></a>`
            : ''
        }
        <div class="catalogue-card-content">
          ${product.category ? `<p class="catalogue-category">${escapeHtml(product.category)}</p>` : ''}
          <h2><a href="/product/${encodeURIComponent(String(product.id))}/">${escapeHtml(product.title)}</a></h2>
          ${product.condition ? `<p>Condition: ${escapeHtml(product.condition)}</p>` : ''}
          ${price ? `<p class="catalogue-price">${escapeHtml(price)}</p>` : ''}
          ${product.status === 'Sold' ? '<p class="catalogue-status">Sold</p>' : ''}
        </div>
      </article>`;
    })
    .join('\n');

  return `<!DOCTYPE html>
<html lang="en-IN">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <meta name="theme-color" content="#000000" />
  <link rel="icon" type="image/png" href="/favicon.png" />
  ${metaTags}
  <script type="application/ld+json">${serializeJsonLd(itemListSchema)}</script>
  ${SHELL_HEAD}
  ${VITE_HEAD_EXTRA}
  <style>
    body{margin:0;padding:0;font-family:'Inter',system-ui,-apple-system,sans-serif;background:#FAF8F5;color:#1C1C1C;-webkit-font-smoothing:antialiased}
    .catalogue-hero{background:#fff;border-bottom:1px solid #e8e2d8;padding:5rem 1.5rem 3rem;text-align:center}
    .catalogue-hero h1{font-family:'Playfair Display',Georgia,serif;font-size:clamp(2rem,5vw,3.5rem);margin:0 0 1rem}
    .catalogue-hero p{max-width:700px;margin:0 auto;color:#666;line-height:1.7}
    .category-links{display:flex;flex-wrap:wrap;justify-content:center;gap:.75rem;max-width:1100px;margin:0 auto;padding:2rem 1.5rem 0}
    .category-links a{border:1px solid #d8d0c2;color:#1C1C1C;padding:.7rem 1rem;text-decoration:none;font-size:.72rem;text-transform:uppercase;letter-spacing:.12em;background:#fff}
    .category-links span{color:#777}
    .catalogue-grid{display:grid;grid-template-columns:repeat(auto-fit,minmax(230px,1fr));gap:1.5rem;max-width:1100px;margin:0 auto;padding:3rem 1.5rem 5rem}
    .catalogue-card{border:1px solid #e8e2d8;background:#fff}
    .catalogue-card img{display:block;width:100%;aspect-ratio:1/1;object-fit:cover;background:#f3f3f3}
    .catalogue-card-content{padding:1.15rem}
    .catalogue-category{font-size:.65rem;text-transform:uppercase;letter-spacing:.18em;color:#9a7a22;font-weight:700;margin:0 0 .6rem}
    .catalogue-card h2{font-family:'Playfair Display',Georgia,serif;font-size:1.2rem;line-height:1.35;margin:0 0 .75rem}
    .catalogue-card h2 a{color:#1C1C1C;text-decoration:none}
    .catalogue-card p{color:#666;font-size:.85rem;margin:.35rem 0}
    .catalogue-card .catalogue-price{font-size:1rem;color:#1C1C1C}
    .catalogue-card .catalogue-status{color:#8a3b2f;text-transform:uppercase;letter-spacing:.12em;font-size:.7rem}
    .catalogue-empty{max-width:700px;margin:0 auto;padding:4rem 1.5rem;text-align:center;color:#666}
  </style>
</head>
<body>
  <div id="root">
  <div style="min-height:100vh;display:flex;flex-direction:column">
    ${SHELL_NAV}
    <main id="main-content" style="flex:1;padding-top:60px">
      <header class="catalogue-hero">
        <h1>${escapeHtml(landing ? `Shop ${landing.name}` : 'The Exchange')}</h1>
      </header>
      ${categoryLinks ? `<nav class="category-links" aria-label="Product categories">${categoryLinks}</nav>` : ''}
      ${
        productCards
          ? `<section class="catalogue-grid" aria-label="Current product listings">${productCards}</section>`
          : `<p class="catalogue-empty">No current ${escapeHtml(landing?.name || 'product')} listings are available.</p>`
      }
    </main>
    ${SHELL_FOOTER}
  </div>
  </div>
  ${VITE_BODY_EXTRA}
</body>
</html>`;
}

/* ------------------------------------------------------------------ */
/*  PRODUCT PRERENDER                                                  */
/* ------------------------------------------------------------------ */

function buildProductMetaTags(product) {
  const title = escapeHtml(product.title || 'Product listing');
  const plainDesc = stripHtml(product.description || '');
  const fallbackDescription = [
    product.title,
    product.category ? `Category: ${product.category}` : '',
    product.condition ? `Condition: ${product.condition}` : '',
    product.price != null ? `Price: ${formatPrice(product.price)}` : '',
  ]
    .filter(Boolean)
    .join('. ');
  const desc = escapeHtml((plainDesc || fallbackDescription).slice(0, 160));
  const image = product.images?.[0] || product.image || `${SITE_URL}/og-image.png`;
  const canonical = `${SITE_URL}/product/${product.id}/`;

  const offer = {};
  if (product.price != null) {
    offer.price = String(product.price);
    offer.priceCurrency = 'INR';
  }
  if (product.status) {
    offer.availability =
      product.status === 'Sold' ? 'https://schema.org/SoldOut' : 'https://schema.org/InStock';
  }
  if (Object.keys(offer).length > 0) {
    offer['@type'] = 'Offer';
    offer.url = canonical;
  }

  const productSchema = {
    '@context': 'https://schema.org',
    '@type': 'Product',
    name: product.title || 'Product listing',
    ...(plainDesc && { description: plainDesc.slice(0, 200) }),
    image: product.images?.length > 0 ? product.images : product.image ? [product.image] : [],
    sku: String(product.id),
    ...(product.brand && { brand: { '@type': 'Brand', name: product.brand } }),
    ...(product.category && { category: product.category }),
    ...(Object.keys(offer).length > 0 && { offers: offer }),
    ...(product.condition && {
      itemCondition: getProductSchemaCondition(product.condition),
    }),
  };

  const breadcrumbSchema = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: [
      { '@type': 'ListItem', position: 1, name: 'Home', item: SITE_URL },
      { '@type': 'ListItem', position: 2, name: 'The Exchange', item: `${SITE_URL}/category/` },
      { '@type': 'ListItem', position: 3, name: product.title, item: canonical },
    ],
  };

  return `
    <title>${title} — The Collectors Exchange</title>
    <meta name="description" content="${desc}" />
    <link rel="canonical" href="${canonical}" />
    <meta name="robots" content="index, follow, max-snippet:-1, max-image-preview:large, max-video-preview:-1" />

    <meta property="og:site_name" content="The Collectors Exchange" />
    <meta property="og:title" content="${title}" />
    <meta property="og:description" content="${desc}" />
    <meta property="og:image" content="${escapeHtml(image)}" />
    <meta property="og:image:width" content="1200" />
    <meta property="og:image:height" content="630" />
    <meta property="og:type" content="product" />
    <meta property="og:url" content="${canonical}" />
    <meta property="og:locale" content="en_IN" />

    <meta name="twitter:card" content="summary_large_image" />
    <meta name="twitter:site" content="@TCE_store" />
    <meta name="twitter:creator" content="@TCE_store" />
    <meta name="twitter:title" content="${title}" />
    <meta name="twitter:description" content="${desc}" />
    <meta name="twitter:image" content="${escapeHtml(image)}" />

    <script type="application/ld+json">${serializeJsonLd(productSchema)}</script>
    <script type="application/ld+json">${serializeJsonLd(breadcrumbSchema)}</script>`;
}

function normalizeSpecs(value) {
  let specs = value;
  if (typeof specs === 'string') {
    try {
      specs = JSON.parse(specs);
    } catch {
      return [];
    }
  }

  if (!Array.isArray(specs)) return [];

  return specs.filter(
    (spec) =>
      spec &&
      typeof spec === 'object' &&
      spec.key != null &&
      String(spec.key).trim() &&
      spec.value != null &&
      String(spec.value).trim(),
  );
}

function renderPlainText(value) {
  if (!value) return '';

  return String(value)
    .trim()
    .split(/\r?\n\s*\r?\n/)
    .filter(Boolean)
    .map((paragraph) => `<p>${escapeHtml(paragraph.trim()).replace(/\r?\n/g, '<br />')}</p>`)
    .join('\n');
}

function buildProductHtml(product, metaTags = buildProductMetaTags(product)) {
  const image = product.images?.[0] || product.image || '';
  const price = formatPrice(product.price);
  const specs = normalizeSpecs(product.specs);
  const description = renderPlainText(product.description);
  const facts = [
    product.condition ? ['Condition', product.condition] : null,
    product.brand ? ['Brand', product.brand] : null,
    product.status ? ['Listing status', product.status] : null,
    product.authenticityStatus ? ['Authentication status', product.authenticityStatus] : null,
    product.seller?.name ? ['Seller', product.seller.name] : null,
  ].filter(Boolean);
  const factList = facts
    .map(
      ([label, value]) => `<div><dt>${escapeHtml(label)}</dt><dd>${escapeHtml(value)}</dd></div>`,
    )
    .join('\n');
  const specsTable = specs
    .map(
      (spec) =>
        `<tr><th scope="row">${escapeHtml(spec.key)}</th><td>${escapeHtml(spec.value)}</td></tr>`,
    )
    .join('\n');

  return `<!DOCTYPE html>
<html lang="en-IN">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <meta name="theme-color" content="#000000" />
  <link rel="icon" type="image/png" href="/favicon.png" />
  ${metaTags}
  ${SHELL_HEAD}
  ${VITE_HEAD_EXTRA}
  <style>
    body{margin:0;padding:0;font-family:'Inter',system-ui,-apple-system,sans-serif;background:#fff;color:#1C1C1C;-webkit-font-smoothing:antialiased}
    .product-hero{display:flex;flex-wrap:wrap;gap:2rem;max-width:1000px;margin:0 auto;padding:5rem 1.5rem 2rem}
    .product-hero img{width:100%;max-width:420px;height:auto;object-fit:cover;background:#f5f5f5}
    .product-info{flex:1;min-width:260px}
    .product-info .category{font-size:.7rem;text-transform:uppercase;letter-spacing:.2em;font-weight:700;color:#D4AF37}
    .product-info .category a{color:inherit;text-decoration:none}
    .product-info h1{font-family:'Playfair Display',Georgia,serif;font-size:clamp(1.5rem,4vw,2.5rem);margin:.5rem 0}
    .product-info .price{font-size:1.5rem;font-weight:300}
    .product-facts{margin:1.5rem 0 0;border-top:1px solid #eee}
    .product-facts div{display:grid;grid-template-columns:minmax(120px,1fr) 2fr;gap:1rem;padding:.75rem 0;border-bottom:1px solid #eee}
    .product-facts dt{font-size:.7rem;text-transform:uppercase;letter-spacing:.14em;color:#777}
    .product-facts dd{margin:0;color:#333}
    .product-body{max-width:800px;margin:0 auto;padding:1rem 1.5rem 5rem}
    .product-section{margin-top:2.5rem}
    .product-section h2{font-family:'Playfair Display',Georgia,serif;font-size:1.65rem;margin:0 0 1rem}
    .description p{color:#555;line-height:1.8;margin:0 0 1rem}
    .specs{width:100%;border-collapse:collapse;border:1px solid #e8e8e8}
    .specs th,.specs td{text-align:left;padding:.85rem 1rem;border-bottom:1px solid #e8e8e8;vertical-align:top}
    .specs th{width:34%;font-weight:600;background:#fafafa}
    .verification{border:1px solid #d8c47a;background:#fffdf5;padding:1.25rem}
    .verification h2{font-size:1.25rem;margin:0 0 .5rem}
    .verification p{color:#555;line-height:1.65;margin:0}
  </style>
</head>
<body>
  <div id="root">
  <div style="min-height:100vh;display:flex;flex-direction:column">
    ${SHELL_NAV}
    <main id="main-content" style="flex:1">
      <div class="product-hero">
        ${image ? `<img src="${escapeHtml(image)}" alt="${escapeHtml(product.title)}" fetchpriority="high" />` : ''}
        <div class="product-info">
          ${
            product.category
              ? `<p class="category"><a href="/category/?cat=${encodeURIComponent(product.category)}">${escapeHtml(product.category)}</a></p>`
              : ''
          }
          <h1>${escapeHtml(product.title || 'Product listing')}</h1>
          ${price ? `<p class="price">${escapeHtml(price)}</p>` : ''}
          ${factList ? `<dl class="product-facts">${factList}</dl>` : ''}
        </div>
      </div>
      <div class="product-body">
        ${
          description
            ? `<section class="product-section description"><h2>Description</h2>${description}</section>`
            : ''
        }
        ${
          specsTable
            ? `<section class="product-section"><h2>Specifications</h2><table class="specs"><tbody>${specsTable}</tbody></table></section>`
            : ''
        }
        ${
          product.isVerified === true
            ? `<aside class="product-section verification" aria-label="Listing verification"><h2>Verified Authentic</h2><p>This listing is marked Verified Authentic by The Collectors Exchange.</p></aside>`
            : ''
        }
      </div>
    </main>
    ${SHELL_FOOTER}
  </div>
  </div>
  ${VITE_BODY_EXTRA}
</body>
</html>`;
}

/* ------------------------------------------------------------------ */
/*  FETCH & MAIN                                                      */
/* ------------------------------------------------------------------ */

async function fetchAllProducts() {
  const allProducts = [];
  let page = 1;
  const limit = 200;

  while (true) {
    const res = await fetch(`${API_URL}/products?limit=${limit}&page=${page}`);
    if (!res.ok) throw new Error(`Failed to fetch products: ${res.status}`);
    const data = await res.json();
    const batch = data.products || [];
    allProducts.push(...batch);
    if (page >= (data.totalPages || 1) || batch.length === 0) break;
    page++;
  }

  return allProducts;
}

async function fetchAllBlogs() {
  const allPosts = [];
  let page = 1;
  const limit = 100;

  while (true) {
    const res = await fetch(`${API_URL}/blog?limit=${limit}&page=${page}`);
    if (!res.ok) throw new Error(`Failed to fetch blogs: ${res.status}`);
    const data = await res.json();
    allPosts.push(...data.posts);
    if (page >= data.totalPages) break;
    page++;
  }

  return allPosts;
}

async function main() {
  console.log('[prerender] Starting build-time prerender...');
  loadViteTemplate();

  // --- Core marketing pages ---
  let coreWritten = 0;
  for (const [path, page] of Object.entries(CORE_PAGES)) {
    if (path === '/category') continue;

    const dir = resolve(DIST, path === '/' ? '.' : path.slice(1));
    if (!existsSync(dir)) {
      mkdirSync(dir, { recursive: true });
    }
    const metaTags = buildCorePageMetaTags(path, page);
    const html = buildCorePageHtml(path, page, metaTags);
    writeFileSync(resolve(dir, 'index.html'), html, 'utf-8');
    coreWritten++;
    console.log(`[prerender] Wrote ${path}/index.html`);
  }

  const categoryDir = resolve(DIST, 'category');
  if (!existsSync(categoryDir)) {
    mkdirSync(categoryDir, { recursive: true });
  }
  writeFileSync(resolve(categoryDir, 'index.html'), buildCategoryHtml(), 'utf-8');
  coreWritten++;
  console.log('[prerender] Wrote /category/index.html (fallback)');
  for (const category of CATEGORY_LANDINGS) {
    const landingDir = resolve(categoryDir, category.slug);
    if (!existsSync(landingDir)) {
      mkdirSync(landingDir, { recursive: true });
    }
    writeFileSync(resolve(landingDir, 'index.html'), buildCategoryHtml([], category.slug), 'utf-8');
    console.log(`[prerender] Wrote /category/${category.slug}/index.html (fallback)`);
  }
  console.log(`[prerender] Prerendered ${coreWritten} core marketing pages.`);

  // 404 page — Cloudflare Pages serves this for unmatched routes.
  writeFileSync(resolve(DIST, '404.html'), build404Html(), 'utf-8');
  console.log('[prerender] Wrote 404.html');

  // --- Blog posts ---
  let posts;
  try {
    posts = await fetchAllBlogs();
  } catch (err) {
    console.error('[prerender] Could not reach API at', API_URL);
    console.error('[prerender] Skipping blog prerender. Core pages are already written.');
    console.error('[prerender] Error:', err.message);
    posts = [];
  }

  const published = posts.filter((p) => p.status === 'PUBLISHED' && p.slug);
  console.log(`[prerender] Found ${published.length} published blog posts.`);

  // Prerender /archive index
  const archiveDir = resolve(DIST, 'archive');
  if (!existsSync(archiveDir)) {
    mkdirSync(archiveDir, { recursive: true });
  }
  writeFileSync(resolve(archiveDir, 'index.html'), buildArchiveIndexHtml(published), 'utf-8');
  console.log('[prerender] Wrote /archive/index.html');

  // Prerender each blog post
  let written = 0;
  for (const post of published) {
    const dir = resolve(archiveDir, post.slug);
    if (!existsSync(dir)) {
      mkdirSync(dir, { recursive: true });
    }
    const metaTags = buildMetaTags(post);
    const html = buildBlogHtml(post, metaTags);
    writeFileSync(resolve(dir, 'index.html'), html, 'utf-8');
    written++;
  }

  console.log(`[prerender] Wrote ${written} prerendered blog post(s) to dist/archive/*/index.html`);

  // --- Products ---
  let products;
  try {
    products = await fetchAllProducts();
  } catch (err) {
    console.error('[prerender] Could not fetch products for prerender:', err.message);
    console.log('[prerender] Done.');
    return;
  }

  const publishedProducts = products.filter((p) => p.id && p.isPublished !== false);
  console.log(`[prerender] Found ${publishedProducts.length} published product(s).`);

  writeFileSync(resolve(categoryDir, 'index.html'), buildCategoryHtml(publishedProducts), 'utf-8');
  console.log('[prerender] Wrote /category/index.html with current product listings');
  for (const category of CATEGORY_LANDINGS) {
    writeFileSync(
      resolve(categoryDir, category.slug, 'index.html'),
      buildCategoryHtml(publishedProducts, category.slug),
      'utf-8',
    );
    console.log(`[prerender] Wrote /category/${category.slug}/index.html`);
  }

  const productDir = resolve(DIST, 'product');
  let productsWritten = 0;
  for (const product of publishedProducts) {
    const dir = resolve(productDir, String(product.id));
    if (!existsSync(dir)) {
      mkdirSync(dir, { recursive: true });
    }
    const metaTags = buildProductMetaTags(product);
    const html = buildProductHtml(product, metaTags);
    writeFileSync(resolve(dir, 'index.html'), html, 'utf-8');
    productsWritten++;
  }

  console.log(
    `[prerender] Wrote ${productsWritten} prerendered product page(s) to dist/product/*/index.html`,
  );
  console.log('[prerender] Done.');
}

const isDirectExecution =
  process.argv[1] && import.meta.url === pathToFileURL(resolve(process.argv[1])).href;

if (isDirectExecution) {
  main();
}

export {
  buildArchiveIndexHtml,
  buildCategoryHtml,
  buildHomeEntityGraph,
  buildProductHtml,
  buildProductMetaTags,
};
