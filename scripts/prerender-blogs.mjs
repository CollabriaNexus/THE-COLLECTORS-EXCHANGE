import { readFileSync, writeFileSync, mkdirSync, existsSync } from 'node:fs';
import { resolve, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const DIST = resolve(__dirname, '..', 'dist');
const SITE_URL = 'https://thecollectorsexchange.in';
const API_URL =
  process.env.API_URL || 'https://07u78lzel7.execute-api.ap-south-1.amazonaws.com/api';

function escapeHtml(str) {
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

function stripHtml(html) {
  return html
    .replace(/<[^>]*>/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

function buildMetaTags(post) {
  const title = escapeHtml(post.metaTitle || post.title);
  const desc = escapeHtml(post.metaDescription || post.excerpt || '');
  const image = post.coverImage || `${SITE_URL}/og-image.png`;
  const canonical = `${SITE_URL}/archive/${post.slug}`;
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
      { '@type': 'ListItem', position: 2, name: 'The Archive', item: `${SITE_URL}/archive` },
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

    <script type="application/ld+json">${JSON.stringify(articleSchema)}</script>
    <script type="application/ld+json">${JSON.stringify(breadcrumbSchema)}</script>`;
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
  ${metaTags}
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

  <script type="module" src="/src/main.jsx"></script>
</body>
</html>`;
}

function buildArchiveIndexHtml() {
  return `<!DOCTYPE html>
<html lang="en-IN">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <meta name="theme-color" content="#000000" />
  <title>The Archive — The Collectors Exchange</title>
  <meta name="description" content="Explore The Collectors Exchange Archive — curated articles on horology, gemology, collecting, and the stories behind rare artifacts." />
  <link rel="canonical" href="${SITE_URL}/archive" />
  <meta name="robots" content="index, follow, max-snippet:-1, max-image-preview:large, max-video-preview:-1" />
  <meta property="og:site_name" content="The Collectors Exchange" />
  <meta property="og:title" content="The Archive — The Collectors Exchange" />
  <meta property="og:description" content="Explore The Collectors Exchange Archive — curated articles on horology, gemology, collecting, and the stories behind rare artifacts." />
  <meta property="og:image" content="${SITE_URL}/og-image.png" />
  <meta property="og:image:width" content="1200" />
  <meta property="og:image:height" content="630" />
  <meta property="og:type" content="website" />
  <meta property="og:url" content="${SITE_URL}/archive" />
  <meta property="og:locale" content="en_IN" />
  <meta name="twitter:card" content="summary_large_image" />
  <meta name="twitter:site" content="@TCE_store" />
  <meta name="twitter:title" content="The Archive — The Collectors Exchange" />
  <meta name="twitter:description" content="Explore The Collectors Exchange Archive — curated articles on horology, gemology, collecting, and the stories behind rare artifacts." />
  <meta name="twitter:image" content="${SITE_URL}/og-image.png" />
  <style>
    body{margin:0;padding:0;font-family:'Inter',system-ui,sans-serif;background:#fff;color:#1C1C1C}
    .hero{background:#1C1C1C;padding:5rem 1.5rem;text-align:center}
    .hero h1{font-family:'Playfair Display',Georgia,serif;font-size:clamp(1.8rem,5vw,3.5rem);color:#fff;margin:0 0 1rem}
    .hero p{color:rgba(255,255,255,.6);max-width:600px;margin:0 auto;font-size:1rem;line-height:1.7}
    .spinner{width:40px;height:40px;border:2px solid #D4AF37;border-top-color:transparent;border-radius:50%;animation:spin .6s linear infinite;margin:4rem auto}
    @keyframes spin{to{transform:rotate(360deg)}}
    .loading{text-align:center;padding:4rem 1.5rem;color:#999;font-style:italic}
  </style>
</head>
<body>
  <div class="hero">
    <h1>The Archive</h1>
    <p>Stories behind the artifacts. Curated insights on horology, gemology, collecting, and the art of preservation.</p>
  </div>
  <div class="loading">
    <div class="spinner"></div>
    <p>Loading articles...</p>
  </div>
  <script type="module" src="/src/main.jsx"></script>
</body>
</html>`;
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
  console.log('[prerender] Fetching published blogs from API...');

  let posts;
  try {
    posts = await fetchAllBlogs();
  } catch (err) {
    console.error('[prerender] Could not reach API at', API_URL);
    console.error('[prerender] Skipping prerender — build output will still work as an SPA.');
    console.error('[prerender] Error:', err.message);
    process.exit(0);
  }

  const published = posts.filter((p) => p.status === 'PUBLISHED' && p.slug);
  console.log(`[prerender] Found ${published.length} published posts.`);

  // Prerender /archive index
  const archiveDir = resolve(DIST, 'archive');
  if (!existsSync(archiveDir)) {
    mkdirSync(archiveDir, { recursive: true });
  }
  writeFileSync(resolve(archiveDir, 'index.html'), buildArchiveIndexHtml(), 'utf-8');
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
  console.log('[prerender] Done.');
}

main();
