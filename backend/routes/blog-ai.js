import { z } from 'zod';

const CATEGORIES = [
    { value: 'Horology', description: 'Watches, clocks, and timekeeping instruments' },
    { value: 'Gemology', description: 'Gemstones, diamonds, and precious minerals' },
    { value: 'Collecting', description: 'Antiques, memorabilia, and general collecting' },
    { value: 'Limited Editions', description: 'Limited runs, numbered editions, exclusives' },
    { value: 'TCE Originals', description: 'The Collectors Exchange original collections' },
    { value: 'Culture & History', description: 'Historical artifacts and cultural heritage' },
    { value: 'News & Updates', description: 'Platform news, events, and announcements' },
];

const AI_BLOG_INSTRUCTIONS = {
    version: '1.0',
    platform: 'The Collectors Exchange — Blog / Archive',
    endpoint: 'POST /api/blog/ai/write',
    authentication: 'Requires admin or curator JWT token in Authorization header',
    defaultAuthor: 'The Collectors Exchange',
    readingTime: 'Auto-computed from content (200 words/min). Do not supply it.',

    categories: CATEGORIES,

    contentFormatting: {
        heading: 'Use <h2> for major sections. Use <h3> for subsections within a section. Never skip levels (h2 → h3, never h2 → h4). Use at most 6-8 sections per article.',
        paragraphs: 'Wrap every paragraph in <p> tags. Each paragraph should be 2-4 sentences. Use a lead paragraph (<p class="lead">) for the opening.',
        emphasis: 'Use <strong> for bold, <em> for italics. Avoid excessive formatting.',
        links: 'Use <a href="..."> for references. External links should open in new tabs (target="_blank" rel="noopener noreferrer"). Use https://thecollectorsexchange.in for internal links.',
        blockquotes: 'Use <blockquote> for pull quotes, expert quotes, or memorable excerpts from the article. Place one quote every 2-3 sections for visual rhythm.',
        lists: 'Use <ul>/<ol> with <li> for bullet points or numbered steps. Keep lists concise.',
        images: 'Use <img src="..." alt="..." loading="lazy" /> within <figure> tags. Add <figcaption> for image captions. Use high-quality Unsplash images (https://images.unsplash.com/...). Images should be 1200px+ wide. Do NOT use placeholder images or logos.',
        code: 'Use <pre><code> for technical content, brand names, or formatted text. Rarely needed.',
        horizontalRules: 'Do NOT use <hr>. Section breaks are handled automatically.',
        tags: 'Include 3-5 relevant tags covering: era/period, material, brand/creator, style/movement, geography.',
    },

    contentStructure: {
        title: 'Compelling, 8-14 words. Use a subtitle pattern with || separator for depth. Example: "The Art of Time: An Introduction to Horology"',
        excerpt: '1-2 sentences (25-40 words). A hook that summarizes the article. Never use the same text as the opening paragraph.',
        content: '800-2000 words. Structure:',
        sections: [
            'Opening paragraph (lead) — hook the reader with a compelling statement or question',
            '2-3 body sections with <h2> headings — explore the topic in depth',
            'Optional subsection with <h3> if needed',
            '1-2 blockquotes for emphasis',
            'A "conclusion" or "why it matters" final section',
            'A practical section (e.g., "Beginner\'s Guide", "How to Collect", "Where to Find") if relevant',
        ],
    },

    seoGuidelines: {
        metaTitle: '(Optional) Under 60 characters. If omitted, the blog title is used.',
        metaDescription: '(Optional) 120-160 characters summarizing the article for search results.',
        coverImage: 'At least 1920x1080px. Provide a high-quality Unsplash URL. The image should be atmospheric and relevant to the topic.',
    },

    exampleResponse: {
        title: 'The Art of Time: An Introduction to Horology',
        slug: 'art-of-time',
        excerpt: 'From sundials to atomic clocks, the measurement of time is a story of human ingenuity. Explore the history, craftsmanship, and culture of horology.',
        category: 'Horology',
        tags: ['timekeeping', 'history', 'craftsmanship', 'mechanical', 'luxury'],
        featured: false,
        coverImage: 'https://images.unsplash.com/photo-1524592094714-0f0654e20314?auto=format&fit=crop&q=80&w=1600',
        content: '<p class="lead">Time is the silent currency of human existence. For millennia, we have sought to measure it, tame it, and carry it with us...</p><h2>The Dawn of Timekeeping</h2><p>Long before quartz crystals vibrated...</p><blockquote>"Time is what prevents everything from happening at once." — John Archibald Wheeler</blockquote><figure><img src="https://images.unsplash.com/photo-1524592094714-0f0654e20314?auto=format&fit=crop&q=80&w=1200" alt="Vintage pocket watch on leather" loading="lazy" /><figcaption>A 19th-century pocket watch, a testament to precision engineering.</figcaption></figure><h2>The Mechanical Revolution</h2><p>The invention of the mainspring in the 15th century...</p><h2>Why Horology Matters for Collectors</h2><p>For the modern collector, a watch is more than a tool...</p>',
        metaTitle: 'The Art of Time: Horology Guide for Collectors',
        metaDescription: 'Discover the history of timekeeping from sundials to mechanical watches. A collector\'s guide to horology and why it matters.',
    },

    validationNotes: [
        'Slug is auto-generated from the title if omitted.',
        'Reading time is always auto-computed from content word count.',
        'Author is always "The Collectors Exchange" by default.',
        'Status defaults to DRAFT for safety. Set to PUBLISHED only if the article is fully ready.',
        'Publish date is auto-set when status changes to PUBLISHED.',
        'Cover images must be from Unsplash or self-hosted URLs. No hotlinking to other sites.',
        'Content must be valid HTML. Tags like <script>, <style>, <iframe> are stripped.',
        'Maximum word count: 2500 words. Minimum: 500 words.',
    ],
};

const AI_BLOG_SCHEMA = z.object({
    title: z.string().min(5, 'Title must be at least 5 characters').max(120, 'Title must be under 120 characters'),
    slug: z.string().optional(),
    excerpt: z.string().min(20, 'Excerpt must be at least 20 characters').max(200, 'Excerpt must be under 200 characters'),
    content: z.string().min(100, 'Content must be at least 100 characters'),
    coverImage: z.string().url('Cover image must be a valid URL').optional().nullable(),
    category: z.enum(['Horology', 'Gemology', 'Collecting', 'Limited Editions', 'TCE Originals', 'Culture & History', 'News & Updates']),
    tags: z.array(z.string()).optional().default([]),
    featured: z.boolean().optional().default(false),
    metaTitle: z.string().max(60).optional().nullable(),
    metaDescription: z.string().max(160).optional().nullable(),
    status: z.enum(['DRAFT', 'PUBLISHED']).optional().default('DRAFT'),
});

const computeReadingTime = (html) => {
    const text = html.replace(/<[^>]*>/g, '');
    const wordCount = text.split(/\s+/).filter(Boolean).length;
    return Math.max(1, Math.ceil(wordCount / 200));
};

const generateSlug = (title) => title
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '')
    .substring(0, 80);

const sanitizeHtml = (html) => {
    const allowedTags = ['h2', 'h3', 'h4', 'p', 'a', 'ul', 'ol', 'li', 'blockquote', 'strong', 'em', 'code', 'pre', 'figure', 'figcaption', 'img'];
    return html.replace(/<script[\s\S]*?>[\s\S]*?<\/script>/gi, '')
        .replace(/<iframe[\s\S]*?>[\s\S]*?<\/iframe>/gi, '')
        .replace(/<style[\s\S]*?>[\s\S]*?<\/style>/gi, '')
        .replace(/on\w+\s*=\s*["'][^"']*["']/gi, '')
        .replace(/on\w+\s*=\s*\S+/gi, '');
};

export default async function blogAiRoutes(fastify) {
    const { prisma } = fastify;

    fastify.get('/instructions', async (request, reply) => {
        return AI_BLOG_INSTRUCTIONS;
    });

    fastify.post('/write', { preValidation: [fastify.authenticate] }, async (request, reply) => {
        if (request.dbUser.role !== 'admin' && request.dbUser.role !== 'curator') {
            return reply.status(403).send({ error: 'Forbidden: Admin or Curator role required' });
        }

        const data = AI_BLOG_SCHEMA.parse(request.body);
        const content = sanitizeHtml(data.content);
        const readingTime = computeReadingTime(content);
        const slug = data.slug || generateSlug(data.title);

        const existing = await prisma.blog.findUnique({ where: { slug } });
        if (existing) {
            return reply.status(409).send({
                error: 'A post with this slug already exists',
                existingSlug: slug,
                existingTitle: existing.title,
                suggestion: 'Modify the title slightly or provide a custom slug',
            });
        }

        const post = await prisma.blog.create({
            data: {
                title: data.title,
                slug,
                excerpt: data.excerpt,
                content,
                coverImage: data.coverImage || null,
                author: 'The Collectors Exchange',
                authorId: request.dbUser.id,
                authorAvatar: request.dbUser.avatar || '',
                category: data.category,
                tags: data.tags,
                status: data.status,
                featured: data.featured,
                metaTitle: data.metaTitle || null,
                metaDescription: data.metaDescription || null,
                readingTime,
                publishedAt: data.status === 'PUBLISHED' ? new Date().toISOString() : null,
            },
        });

        return reply.status(201).send(post);
    });
}
