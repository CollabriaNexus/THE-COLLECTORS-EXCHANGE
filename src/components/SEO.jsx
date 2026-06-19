import { Helmet } from 'react-helmet-async';

const SITE_NAME = 'The Collectors Exchange';
const SITE_URL = 'https://thecollectorsexchange.in';
const DEFAULT_DESC = 'India\'s curated marketplace for verified pre-owned collectibles, antiques, and limited-edition pieces. Every item authenticated. Trusted sellers. Secure transactions.';
const DEFAULT_IMG = '/og-image.png';

const SEO = ({
  title,
  description,
  canonical,
  image,
  ogType = 'website',
  publishedTime,
  noindex = false,
  structuredData,
}) => {
  const pageTitle = title ? `${title} — ${SITE_NAME}` : `${SITE_NAME} — Luxury Pre-Owned & Rare Collectibles`;
  const pageDesc = description || DEFAULT_DESC;
  const pageImage = image || DEFAULT_IMG;

  return (
    <Helmet>
      <title>{pageTitle}</title>
      <meta name="description" content={pageDesc} />
      <meta name="application-name" content={SITE_NAME} />

      {canonical && <link rel="canonical" href={`${SITE_URL}${canonical}`} />}

      {noindex && <meta name="robots" content="noindex, nofollow" />}
      {!noindex && <meta name="robots" content="index, follow, max-snippet:-1, max-image-preview:large, max-video-preview:-1" />}

      <meta property="og:site_name" content={SITE_NAME} />
      <meta property="og:title" content={pageTitle} />
      <meta property="og:description" content={pageDesc} />
      <meta property="og:image" content={pageImage} />
      <meta property="og:image:width" content="1200" />
      <meta property="og:image:height" content="630" />
      <meta property="og:type" content={ogType} />
      <meta property="og:url" content={canonical ? `${SITE_URL}${canonical}` : SITE_URL} />
      <meta property="og:locale" content="en_IN" />

      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:title" content={pageTitle} />
      <meta name="twitter:description" content={pageDesc} />
      <meta name="twitter:image" content={pageImage} />

      {publishedTime && <meta property="article:published_time" content={publishedTime} />}

      {structuredData && (
        <script type="application/ld+json">
          {JSON.stringify(structuredData)}
        </script>
      )}
    </Helmet>
  );
};

export const OrganizationSchema = () => {
  const schema = {
    '@context': 'https://schema.org',
    '@type': 'Organization',
    name: 'The Collectors Exchange',
    url: SITE_URL,
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
      addressCountry: 'IN',
    },
  };
  return (
    <Helmet>
      <script type="application/ld+json">{JSON.stringify(schema)}</script>
    </Helmet>
  );
};

export const WebSiteSchema = () => {
  const schema = {
    '@context': 'https://schema.org',
    '@type': 'WebSite',
    name: 'The Collectors Exchange',
    url: SITE_URL,
    potentialAction: {
      '@type': 'SearchAction',
      target: {
        '@type': 'EntryPoint',
        urlTemplate: `${SITE_URL}/category?search={search_term_string}`,
      },
      'query-input': 'required name=search_term_string',
    },
    description: DEFAULT_DESC,
  };
  return (
    <Helmet>
      <script type="application/ld+json">{JSON.stringify(schema)}</script>
    </Helmet>
  );
};

export const ProductSchema = ({ product }) => {
  if (!product) return null;
  const schema = {
    '@context': 'https://schema.org',
    '@type': 'Product',
    name: product.title,
    description: product.description?.replace(/<[^>]*>/g, '')?.substring(0, 200),
    image: product.images?.length > 0 ? product.images : (product.image ? [product.image] : []),
    sku: product.id?.toString(),
    brand: product.brand ? { '@type': 'Brand', name: product.brand } : undefined,
    category: product.category,
    offers: {
      '@type': 'Offer',
      price: product.price?.toString(),
      priceCurrency: 'INR',
      availability: product.status === 'Sold' ? 'https://schema.org/SoldOut' : 'https://schema.org/InStock',
      url: `${SITE_URL}/product/${product.id}`,
      priceValidUntil: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    },
    itemCondition: product.condition === 'New' ? 'https://schema.org/NewCondition'
      : product.condition === 'Mint' ? 'https://schema.org/MintCondition'
      : 'https://schema.org/UsedCondition',
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

export const BreadcrumbSchema = ({ items }) => {
  if (!items?.length) return null;
  const schema = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: items.map((item, i) => ({
      '@type': 'ListItem',
      position: i + 1,
      name: item.name,
      item: item.url ? `${SITE_URL}${item.url}` : undefined,
    })),
  };
  return (
    <Helmet>
      <script type="application/ld+json">{JSON.stringify(schema)}</script>
    </Helmet>
  );
};

export const FAQSchema = ({ items }) => {
  if (!items?.length) return null;
  const schema = {
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
    image: image || DEFAULT_IMG,
    datePublished: datePublished || new Date().toISOString(),
    dateModified: dateModified || datePublished || new Date().toISOString(),
    author: {
      '@type': 'Person',
      name: author || 'The Collectors Exchange',
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

export default SEO;
