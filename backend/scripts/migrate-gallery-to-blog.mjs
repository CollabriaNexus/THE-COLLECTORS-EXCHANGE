import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

const toSlug = (str) =>
    str
        .toLowerCase()
        .replace(/[^\w\s-]/g, '')
        .replace(/[\s_]+/g, '-')
        .replace(/^-+|-+$/g, '') || 'post';

const themeToCategory = {
    'Indian Heritage': 'Culture & History',
    'World Heritage': 'Culture & History',
    'Iconic Private Collections': 'Collecting',
    'Unusual & Bizarre': 'Collecting',
    'Timeless Objects': 'Collecting',
};

async function migrate() {
    const items = await prisma.galleryItem.findMany({
        include: { createdBy: { select: { name: true } } },
    });

    console.log(`Found ${items.length} gallery items to migrate...`);

    let created = 0;
    for (const item of items) {
        const slug = toSlug(item.title);
        const existing = await prisma.blog.findUnique({ where: { slug } });
        if (existing) {
            console.log(`  Skipping "${item.title}" — slug "${slug}" already exists`);
            continue;
        }

        const content = [
            `<p>${item.description}</p>`,
            item.significance ? `<h2>Significance</h2><p>${item.significance}</p>` : '',
        ]
            .filter(Boolean)
            .join('\n');

        const tags = [item.origin, item.timePeriod, item.institution].filter(Boolean);

        await prisma.blog.create({
            data: {
                title: item.title,
                slug,
                excerpt: item.teaser,
                content,
                coverImage: item.images?.[0] || null,
                author: item.createdBy?.name || 'TCE Editorial',
                category: themeToCategory[item.theme] || item.theme || 'Culture & History',
                tags,
                status: 'PUBLISHED',
                featured: false,
                publishedAt: item.createdAt,
                readingTime: Math.max(1, Math.ceil(item.description.split(/\s+/).length / 200)),
                createdAt: item.createdAt,
                updatedAt: item.updatedAt,
            },
        });
        created++;
        console.log(`  Created blog post: "${item.title}"`);
    }

    console.log(`\nDone! ${created} blog posts created from gallery items.`);
    await prisma.$disconnect();
}

migrate().catch((err) => {
    console.error('Migration failed:', err);
    prisma.$disconnect();
    process.exit(1);
});
