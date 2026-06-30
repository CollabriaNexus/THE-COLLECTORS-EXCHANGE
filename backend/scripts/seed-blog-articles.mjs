import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

const articles = [
    {
        slug: 'art-of-time',
        title: 'The Art of Time: An Introduction to Horology',
        subtitle: 'The Mechanical Heartbeat',
        category: 'Horology',
        tags: ['watches', 'horology', 'mechanical'],
        content: [
            { type: 'paragraph', text: 'Welcome to The Collectors Exchange. Before we dive into the dials, movements, and the thrill of the hunt, it helps to understand the very foundation of what brings us together: Horology.' },
            { type: 'paragraph', text: 'At its simplest, horology is the study and measurement of time. But for the collector, it is much more than that. It is the intersection of engineering, art, history, and human ingenuity. Every ticking escapement is a heartbeat from a different era, carrying the stories of the people who built it, wore it, and eventually passed it on.' },
            { type: 'heading', text: 'From Shadows to Springs: The Evolution of Time' },
            { type: 'paragraph', text: "Humanity's obsession with capturing time is ancient. For millennia, we relied on the natural world: the shifting shadows of sundials, the steady drip of water clocks, and the slow burn of calibrated candles." },
            { type: 'paragraph', text: 'The true horological revolution began in the 13th and 14th centuries with the invention of the mechanical escapement. Suddenly, time was no longer dictated by the sun; it could be captured in the rhythmic ticking of massive, weight-driven tower clocks that governed town squares.' },
            { type: 'paragraph', text: 'Over centuries, this grand engineering was miniaturized. Blacksmiths became watchmakers. Massive gears were refined into microscopic pinions.' },
            { type: 'bullet', items: ['The 16th Century: Timekeeping became personal with the invention of the mainspring, giving birth to the first portable pocket watches.', 'The 19th & 20th Centuries: Precision manufacturing allowed timepieces to become essential tools for railway navigation, military coordination, and eventually daily life.'] },
            { type: 'heading', text: 'The Quartz Crisis and the Mechanical Renaissance' },
            { type: 'paragraph', text: 'In the 1970s and 80s, horology faced its greatest existential threat: quartz technology. Battery-powered watches were cheaper, more accurate, and easier to mass-produce than mechanical ones. Traditional watchmaking nearly collapsed.' },
            { type: 'paragraph', text: "Yet, mechanical horology survived. Because a mechanical watch has a soul. It doesn't rely on a microchip; it relies on tension, friction, and the perfect calibration of hundreds of microscopic parts working in harmony." },
            { type: 'paragraph', text: 'Today, we are living in a mechanical renaissance. We wear vintage mechanical watches to carry a piece of history on our wrists.' },
            { type: 'heading', text: 'Why We Collect: The Mission of TCE' },
            { type: 'paragraph', text: 'This history is exactly why The Collectors Exchange exists. The story of horology is not just kept in Swiss museums or high-end boutiques. The real history is often hidden in plain sight — in dusty glass cases of local pawn shops, scattered across vibrant street markets, and resting in forgotten family drawers.' },
            { type: 'paragraph', text: "From the rugged reliability of an early-era HMT that timed a nation's growth, to the bold 1970s aesthetics of an imported automatic found in a local bazaar, these watches are artifacts." },
            { type: 'paragraph', text: 'Our mission is to build the trusted bridge between those streets, the pawn shops, and the collector. We do this for the sake of the ancestors who built and wore these watches, and for the collectors of the future who will preserve them.' },
            { type: 'signoff', text: 'Welcome to the hunt.' },
        ],
    },
    {
        slug: 'heart-of-the-earth',
        title: 'The Heart of the Earth: An Introduction to Gemstones',
        subtitle: 'The Geological Truth',
        category: 'Gemology',
        tags: ['gemstones', 'diamonds', 'jewelry'],
        content: [
            { type: 'paragraph', text: 'Welcome to The Collectors Exchange. Just as a mechanical watch captures the passage of time, a gemstone captures the very history of the earth.' },
            { type: 'paragraph', text: "Long before we engineered gears to track our days, we were pulling crystallized light from the dirt. Gemstones are the intersection of immense geological pressure and human artistry. Every faceted stone carries a dual legacy: the millions of years it spent forming in darkness, and the hands of the ancestors who finally brought it to the light." },
            { type: 'heading', text: 'From Riverbeds to Royal Courts: The Legacy of the Stone' },
            { type: 'paragraph', text: "The human fascination with colored stones and diamonds is as old as civilization itself. For centuries, they were not just adornments; they were talismans, currency, and ultimate symbols of power." },
            { type: 'bullet', items: ['The Ancient Cradles: The story of the modern gemstone market owes a massive debt to the very soil beneath our feet here in India. For over a thousand years, the legendary Golconda mines were the sole source of the world\'s diamonds.', 'The Art of the Lapidary: By the Renaissance and the era of the great Maharajas, artisans learned how to facet stones, mathematically calculating angles to unlock the maximum fire and brilliance.', 'The Modern Landscape: A natural gemstone is defined by its inclusions — the microscopic internal fractures and trapped minerals that prove it was forged by nature.'] },
            { type: 'heading', text: 'Why We Collect: The Mission of TCE' },
            { type: 'paragraph', text: 'At The Collectors Exchange, we believe that the true value of a vintage gemstone or antique piece of jewelry is not just in its carat weight, but in its journey.' },
            { type: 'paragraph', text: 'Our mission is to build the trusted bridge between those bustling streets, the estate liquidators, and you, the collector. We hunt for these overlooked treasures to preserve the artistry of the craftsmen who cut them.' },
            { type: 'signoff', text: 'Welcome to the hunt.' },
        ],
    },
    {
        slug: 'artifacts-of-the-everyday',
        title: 'Artifacts of the Everyday: An Introduction to Collectables & Antiques',
        subtitle: 'The Curated Pulse',
        category: 'Collecting',
        tags: ['antiques', 'collecting', 'vintage'],
        content: [
            { type: 'paragraph', text: 'Welcome to The Collectors Exchange. If horology captures the passage of time, and gemstones capture the history of the earth, then collectables capture the story of human daily life.' },
            { type: 'paragraph', text: 'The term "collectable" is brilliantly broad. It encompasses the ephemera of the past, the objects that were once deeply ordinary but have been transformed by time into something extraordinary.' },
            { type: 'heading', text: 'From Utility to Artifact: The Beauty of the Tangible' },
            { type: 'paragraph', text: 'The most fascinating collectables usually started as functional tools. They were meant to be used, spent, written with, or struck, yet they outlived their original purpose to become artifacts.' },
            { type: 'bullet', items: ['Numismatics & Philately (Coins and Stamps): The earliest forms of mass communication and trade.', 'Instruments of Thought & Vision: The heavy brass of an antique film camera or the intricate nib of a vintage fountain pen.', 'The Curiosities of Culture: Vintage lighters, enamel advertising signs, antique brassware, and old matchbox art.'] },
            { type: 'paragraph', text: "In our increasingly digital, untouchable world, collectables offer a deeply necessary grounding. Holding a silver rupee from the 1800s connects you physically to the hands that held them before you." },
            { type: 'heading', text: 'Why We Collect: The Mission of TCE' },
            { type: 'paragraph', text: 'At The Collectors Exchange, we know that history is not just kept under museum glass. The most compelling stories are often found resting on a tarp in a bustling Sunday bazaar.' },
            { type: 'signoff', text: 'Welcome to the hunt.' },
        ],
    },
    {
        slug: 'art-of-rarity',
        title: 'The Art of Rarity: An Introduction to Limited Editions',
        subtitle: 'The Exclusive Truth',
        category: 'Limited Editions',
        tags: ['limited-edition', 'rare', 'collecting'],
        content: [
            { type: 'paragraph', text: 'Welcome to The Collectors Exchange. While our other categories are deeply defined by the slow passage of time, a Limited Edition is defined by something else entirely: deliberate scarcity.' },
            { type: 'paragraph', text: 'It is the pure, unfiltered thrill of knowing that what you are holding is one of only a few in the entire world.' },
            { type: 'heading', text: 'The Grails of the Past and the Artifacts of Tomorrow' },
            { type: 'bullet', items: ['The Vintage Grails: Commemorative models released decades ago for a specific event, or watches and collectables whose production was unexpectedly cut short.', 'The Modern Masterpieces: Today\'s modern releases, numbered modern art pieces, and exclusive brand collaborations are born rare.'] },
            { type: 'heading', text: 'Why We Collect: The Mission of TCE' },
            { type: 'paragraph', text: 'At The Collectors Exchange, we believe that the thrill of the hunt applies just as much to securing a brand-new, sold-out release as it does to unearthing a forgotten antique.' },
            { type: 'signoff', text: 'Welcome to the hunt.' },
        ],
    },
    {
        slug: 'canvas-of-the-streets',
        title: 'The Canvas of the Streets: An Introduction to Sneaker Culture',
        subtitle: 'The Modern Artifact',
        category: 'Limited Editions',
        tags: ['sneakers', 'streetwear', 'culture'],
        content: [
            { type: 'paragraph', text: 'Welcome to The Collectors Exchange. If horology is the engineering of time and gemstones are the history of the earth, then sneakers are the ultimate expression of modern culture.' },
            { type: 'paragraph', text: 'Being a "sneakerhead" is about far more than just footwear. It is a vibrant collision of sports history, hip-hop, high fashion, and street art.' },
            { type: 'heading', text: 'From the Hardwood to the Pavement' },
            { type: 'bullet', items: ['The Originals (OGs) & The Hardwood Heritage: The foundation was built on the basketball courts and running tracks of the 1970s and 80s.', 'The Art of the Collab: Today, a sneaker is a blank canvas. The most coveted pairs are often born from collaborations.', 'Deadstock vs. The Daily Wear: The pursuit of the pristine versus the appreciation for worn pairs that carry the scuffs of a life well-lived.'] },
            { type: 'heading', text: 'Why We Collect: The Mission of TCE' },
            { type: 'paragraph', text: 'At The Collectors Exchange, we recognize that the hunt for the perfect pair of sneakers is one of the most intense and passionate pursuits in the collecting world.' },
            { type: 'signoff', text: 'Welcome to the hunt.' },
        ],
    },
    {
        slug: 'soul-of-expression',
        title: 'The Soul of Expression: An Introduction to Art',
        subtitle: 'The Visual Truth',
        category: 'Culture & History',
        tags: ['art', 'culture', 'collecting'],
        content: [
            { type: 'paragraph', text: 'Welcome to The Collectors Exchange. If horology is the heartbeat of engineering and gemstones are the treasures of the earth, then art is the visual soul of the human experience.' },
            { type: 'paragraph', text: 'Art is where history, emotion, and culture collide. It is the oldest form of storytelling, predating the written word and surviving through every rise and fall of civilization.' },
            { type: 'heading', text: 'From the Ancient Canvas to the Modern Street' },
            { type: 'bullet', items: ['The Heritage of the Hand: For millennia, art was the ultimate record of our ancestors.', 'The Revolutionary Spirit: Art moved from palaces and cathedrals into the studios of the avant-garde.', 'The Urban Renaissance: Street art has brought masterpieces to the pavement, proving that high-value art belongs to the people.'] },
            { type: 'heading', text: 'Why We Collect: The Mission of TCE' },
            { type: 'paragraph', text: 'At The Collectors Exchange, we believe that art is most powerful when it is discovered.' },
            { type: 'paragraph', text: 'True artistic treasures are not always found under spotlighting in elite galleries. They are often waiting in the dusty corners of an old antique shop.' },
            { type: 'signoff', text: 'Welcome to the hunt.' },
        ],
    },
    {
        slug: 'icons-of-imagination',
        title: 'Icons of Imagination: An Introduction to Toys & Pop Culture',
        subtitle: 'The Nostalgic Truth',
        category: 'Collecting',
        tags: ['toys', 'pop-culture', 'nostalgia'],
        content: [
            { type: 'paragraph', text: 'Welcome to The Collectors Exchange. While other categories on our platform capture the earth, time, or art, Toys & Pop Culture capture something perhaps even more precious: our collective memory and the joy of play.' },
            { type: 'paragraph', text: 'This is the world of "Nostalgia in Plastic." It is where a small, die-cast car or a poseable action figure ceases to be a mere plaything and becomes a cultural time capsule.' },
            { type: 'heading', text: 'From the Sandbox to the Showcase: The Evolution of Play' },
            { type: 'bullet', items: ['The Vintage Foundations: Cast-iron trains, tinplate wind-ups, and hand-painted dolls from a bygone era of craftsmanship.', 'The Action Figure Revolution: In the 1960s and 70s, led by icons like G.I. Joe and the world-changing arrival of Star Wars.', 'The Die-Cast Drive: Brands like Hot Wheels turned the automotive world into a handheld obsession.', 'Modern Pop Culture & Vinyl: From Funko Pops to limited-edition art toys.'] },
            { type: 'heading', text: 'Why We Collect: The Mission of TCE' },
            { type: 'paragraph', text: 'At The Collectors Exchange, we know that some of the greatest treasures are hidden in plain sight.' },
            { type: 'signoff', text: 'Welcome to the hunt.' },
        ],
    },
    {
        slug: 'alchemy-of-the-new',
        title: 'The Alchemy of the New: An Introduction to TCE Originals',
        subtitle: 'The Absolute Truth',
        category: 'TCE Originals',
        tags: ['tce-originals', 'jewelry', 'craftsmanship'],
        content: [
            { type: 'paragraph', text: 'Welcome to the heart of our workshop. While the other corners of The Collectors Exchange are dedicated to the thrill of the hunt and the preservation of history, TCE Originals is where we look forward.' },
            { type: 'highlight', text: 'Here, we don\'t collect. We create.' },
            { type: 'paragraph', text: 'TCE Originals is our dedicated line of jewelry, born from the belief that the artifacts of tomorrow must be forged with the same soul, intention, and craftsmanship as the treasures of the past.' },
            { type: 'heading', text: 'From Raw Vision to Refined Reality' },
            { type: 'bullet', items: ['Materials with Meaning: We select our metals and stones not just for their luster, but for their integrity.', 'Heritage Craftsmanship: Our pieces are crafted using time-honored methods — hand-casting, manual polishing, and bespoke stone setting.', 'Contemporary Soul: While our methods are traditional, our designs are modern. We create for the contemporary collector.'] },
            { type: 'heading', text: 'Why We Create: The Mission of TCE' },
            { type: 'paragraph', text: 'At The Collectors Exchange, our vision has always been to build a bridge between the ancestors and the collectors of the future.' },
            { type: 'signoff', text: 'We don\'t just find the legacy. We forge it.' },
        ],
    },
];

function blocksToHtml(blocks) {
    return blocks
        .map((block) => {
            switch (block.type) {
                case 'heading':
                    return `<h2>${block.text}</h2>`;
                case 'paragraph':
                    return `<p>${block.text}</p>`;
                case 'highlight':
                    return `<blockquote><p>${block.text}</p></blockquote>`;
                case 'bullet':
                    return `<ul>${block.items.map((item) => `<li>${item}</li>`).join('')}</ul>`;
                case 'signoff':
                    return `<hr /><p><em>${block.text}</em></p>`;
                default:
                    return '';
            }
        })
        .join('\n');
}

async function seed() {
    console.log(`Seeding ${articles.length} blog articles...`);

    for (const article of articles) {
        const existing = await prisma.blog.findUnique({ where: { slug: article.slug } });
        if (existing) {
            console.log(`  Skipping "${article.title}" — slug already exists`);
            continue;
        }

        const htmlContent = blocksToHtml(article.content);
        const wordCount = htmlContent.replace(/<[^>]*>/g, '').split(/\s+/).filter(Boolean).length;

        await prisma.blog.create({
            data: {
                title: article.title,
                slug: article.slug,
                excerpt: article.subtitle,
                content: htmlContent,
                coverImage: null,
                author: 'The Collectors Exchange',
                category: article.category,
                tags: article.tags,
                status: 'PUBLISHED',
                featured: article.slug === 'art-of-time',
                publishedAt: new Date('2025-01-01'),
                readingTime: Math.max(1, Math.ceil(wordCount / 200)),
                createdAt: new Date('2025-01-01'),
                updatedAt: new Date('2025-01-01'),
            },
        });
        console.log(`  Created: "${article.title}" (${article.category})`);
    }

    console.log(`\nDone! ${articles.length} articles seeded.`);
    await prisma.$disconnect();
}

seed().catch((err) => {
    console.error('Seed failed:', err);
    prisma.$disconnect();
    process.exit(1);
});
