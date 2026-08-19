import { Helmet } from 'react-helmet-async';
import {
  SITE_NAME,
  SITE_URL,
  DEFAULT_DESC,
  DEFAULT_OG_IMAGE,
  TWITTER_HANDLE,
  PRIMARY_NAV,
  buildPageTitle,
  buildCanonicalPath,
  resolveImageUrl,
} from '../config/seo-pages';
import { getProductSchemaCondition } from '../utils/productSeo.js';

const SEO = ({
  title,
  description,
  keywords,
  canonical,
  image,
  ogType = 'website',
  publishedTime,
  noindex = false,
  nofollow = noindex,
  structuredData,
}) => {
  const pageTitle = buildPageTitle(title);
  const pageDesc = description || DEFAULT_DESC;
  const pageImage = resolveImageUrl(image);
  const canonicalUrl = canonical ? `${SITE_URL}${buildCanonicalPath(canonical)}` : null;

  const schemas = Array.isArray(structuredData)
    ? structuredData
    : structuredData
      ? [structuredData]
      : [];

  return (
    <Helmet>
      <title>{pageTitle}</title>
      <meta name="description" content={pageDesc} />
      {keywords && <meta name="keywords" content={keywords} />}
      <meta name="application-name" content={SITE_NAME} />

      {canonicalUrl && <link rel="canonical" href={canonicalUrl} />}

      {noindex && <meta name="robots" content={`noindex, ${nofollow ? 'nofollow' : 'follow'}`} />}
      {!noindex && (
        <meta
          name="robots"
          content="index, follow, max-snippet:-1, max-image-preview:large, max-video-preview:-1"
        />
      )}

      <meta property="og:site_name" content={SITE_NAME} />
      <meta property="og:title" content={pageTitle} />
      <meta property="og:description" content={pageDesc} />
      <meta property="og:image" content={pageImage} />
      <meta property="og:image:width" content="1200" />
      <meta property="og:image:height" content="630" />
      <meta property="og:type" content={ogType} />
      <meta property="og:url" content={canonicalUrl || SITE_URL} />
      <meta property="og:locale" content="en_IN" />

      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:site" content={TWITTER_HANDLE} />
      <meta name="twitter:creator" content={TWITTER_HANDLE} />
      <meta name="twitter:title" content={pageTitle} />
      <meta name="twitter:description" content={pageDesc} />
      <meta name="twitter:image" content={pageImage} />

      {publishedTime && <meta property="article:published_time" content={publishedTime} />}

      {schemas.map((schema, index) => (
        <script key={index} type="application/ld+json">
          {JSON.stringify(schema)}
        </script>
      ))}
    </Helmet>
  );
};

const ROOT_URL = `${SITE_URL}/`;
const ORGANIZATION_ID = `${ROOT_URL}#organization`;
const WEBSITE_ID = `${ROOT_URL}#website`;

export const buildOrganizationSchema = () => ({
  '@context': 'https://schema.org',
  '@type': 'Organization',
  '@id': ORGANIZATION_ID,
  name: SITE_NAME,
  url: ROOT_URL,
  logo: `${SITE_URL}/favicon.png`,
  description: DEFAULT_DESC,
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
});

export const OrganizationSchema = () => (
  <Helmet>
    <script type="application/ld+json">{JSON.stringify(buildOrganizationSchema())}</script>
  </Helmet>
);

export const buildWebSiteSchema = () => ({
  '@context': 'https://schema.org',
  '@type': 'WebSite',
  '@id': WEBSITE_ID,
  name: SITE_NAME,
  url: ROOT_URL,
  publisher: {
    '@id': ORGANIZATION_ID,
  },
  potentialAction: {
    '@type': 'SearchAction',
    target: {
      '@type': 'EntryPoint',
      urlTemplate: `${SITE_URL}/category/?q={search_term_string}`,
    },
    'query-input': 'required name=search_term_string',
  },
  description: DEFAULT_DESC,
});

export const WebSiteSchema = () => (
  <Helmet>
    <script type="application/ld+json">{JSON.stringify(buildWebSiteSchema())}</script>
  </Helmet>
);

export const buildSiteNavigationSchema = () =>
  PRIMARY_NAV.map((item) => ({
    '@context': 'https://schema.org',
    '@type': 'SiteNavigationElement',
    name: item.name,
    url: `${SITE_URL}${buildCanonicalPath(item.path)}`,
  }));

export const SiteNavigationSchema = () => (
  <Helmet>
    {buildSiteNavigationSchema().map((schema, index) => (
      <script key={index} type="application/ld+json">
        {JSON.stringify(schema)}
      </script>
    ))}
  </Helmet>
);

export const buildPageSchema = ({ type = 'WebPage', name, description, path }) => {
  const pageUrl = `${SITE_URL}${buildCanonicalPath(path)}`;

  return {
    '@context': 'https://schema.org',
    '@type': type,
    '@id': `${pageUrl}#webpage`,
    name,
    description,
    url: pageUrl,
    isPartOf: {
      '@id': WEBSITE_ID,
    },
    publisher: {
      '@id': ORGANIZATION_ID,
    },
  };
};

export const PageSchema = ({ type = 'WebPage', name, description, path }) => {
  if (!path) return null;
  return (
    <Helmet>
      <script type="application/ld+json">
        {JSON.stringify(buildPageSchema({ type, name, description, path }))}
      </script>
    </Helmet>
  );
};

const OFFER_VALID_UNTIL = new Date(Date.now() + 365 * 24 * 60 * 60 * 1000)
  .toISOString()
  .split('T')[0];

export const ProductSchema = ({ product, reviews }) => {
  if (!product) return null;

  const productUrl = `${SITE_URL}${buildCanonicalPath(`/product/${product.id}`)}`;
  const reviewList = reviews?.data || [];
  const reviewCount = reviews?.total ?? reviewList.length;
  const aggregateRating =
    reviewCount > 0 && reviewList.length > 0
      ? {
          '@type': 'AggregateRating',
          ratingValue: (
            reviewList.reduce((sum, r) => sum + (r.rating || 0), 0) / reviewList.length
          ).toFixed(1),
          reviewCount,
        }
      : undefined;

  const schema = {
    '@context': 'https://schema.org',
    '@type': 'Product',
    '@id': `${productUrl}#product`,
    name: product.title,
    description: product.description?.replace(/<[^>]*>/g, '')?.substring(0, 200),
    image: product.images?.length > 0 ? product.images : product.image ? [product.image] : [],
    sku: product.id?.toString(),
    brand: product.brand ? { '@type': 'Brand', name: product.brand } : undefined,
    category: product.category,
    ...(aggregateRating && { aggregateRating }),
    offers: {
      '@type': 'Offer',
      price: product.price?.toString(),
      priceCurrency: 'INR',
      availability:
        product.status === 'Sold' ? 'https://schema.org/SoldOut' : 'https://schema.org/InStock',
      url: productUrl,
      priceValidUntil: OFFER_VALID_UNTIL,
    },
    itemCondition: getProductSchemaCondition(product.condition),
    ...(product.isVerified && {
      award: 'Verified Authentic by The Collectors Exchange',
    }),
  };
  return (
    <Helmet>
      <script type="application/ld+json">{JSON.stringify(schema)}</script>
    </Helmet>
  );
};

export const buildBreadcrumbSchema = (items) => {
  if (!items?.length) return null;
  return {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: items.map((item, i) => ({
      '@type': 'ListItem',
      position: i + 1,
      name: item.name,
      item: item.url ? `${SITE_URL}${buildCanonicalPath(item.url)}` : undefined,
    })),
  };
};

export const BreadcrumbSchema = ({ items }) => {
  const schema = buildBreadcrumbSchema(items);
  if (!schema) return null;
  return (
    <Helmet>
      <script type="application/ld+json">{JSON.stringify(schema)}</script>
    </Helmet>
  );
};

export const buildFAQSchema = (items) => {
  if (!items?.length) return null;
  return {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: items.map(({ q, a }) => ({
      '@type': 'Question',
      name: q,
      acceptedAnswer: {
        '@type': 'Answer',
        text: a,
      },
    })),
  };
};

export const FAQSchema = ({ items }) => {
  const schema = buildFAQSchema(items);
  if (!schema) return null;
  return (
    <Helmet>
      <script type="application/ld+json">{JSON.stringify(schema)}</script>
    </Helmet>
  );
};

export const ArticleSchema = ({ headline, image, datePublished, dateModified, author }) => {
  const schema = {
    '@context': 'https://schema.org',
    '@type': 'Article',
    headline,
    image: resolveImageUrl(image),
    datePublished: datePublished || new Date().toISOString(),
    dateModified: dateModified || datePublished || new Date().toISOString(),
    author: {
      '@type': 'Person',
      name: author || SITE_NAME,
    },
    publisher: {
      '@type': 'Organization',
      name: SITE_NAME,
      logo: {
        '@type': 'ImageObject',
        url: `${SITE_URL}/favicon.png`,
      },
    },
  };
  return (
    <Helmet>
      <script type="application/ld+json">{JSON.stringify(schema)}</script>
    </Helmet>
  );
};

export const VideoObjectSchema = ({
  name,
  description,
  thumbnail,
  uploadDate,
  contentUrl,
  duration,
}) => {
  const schema = {
    '@context': 'https://schema.org',
    '@type': 'VideoObject',
    name: name || 'The Collectors Exchange',
    description:
      description ||
      'Authenticated vintage watches and rare collectibles at The Collectors Exchange.',
    thumbnailUrl: resolveImageUrl(thumbnail),
    uploadDate: uploadDate || '2026-01-01T00:00:00+05:30',
    ...(contentUrl && { contentUrl }),
    ...(duration && { duration }),
  };
  return (
    <Helmet>
      <script type="application/ld+json">{JSON.stringify(schema)}</script>
    </Helmet>
  );
};

export default SEO;
