import KohinoorImg from '../assets/kohinoor.png';
import KohinoorHistImg from '../assets/Kohinoor-OpIndia-e1684573231572.webp';
import TipuTigerImg from '../assets/Tipu’s Tiger.jpg';
import FabergeEggImg from '../assets/Faberge_pearl_egg_gallery.jpg';
import RosettaStoneImg from '../assets/rosetta-stone_gallery.avif';

const GALLERY_STORAGE_KEY = 'the_collectors_exchange_gallery';

const curatorItems = [
    {
        id: 'kohinoor-history',
        title: 'The Koh-i-Noor Diamond',
        teaser: 'A journey through dynasties, tracing the history of one of the world\'s most famous diamonds.',
        description: 'Originally mined from the Kollur Mine in India, the Koh-i-Noor has passed through the hands of various Indian dynasties including the Kakatiyas, Khaljis, Tughlaqs, and Mughals. Its story is one of power, conquest, and the shifting tides of history. In 1849, it was acquired by the British following the annexation of the Punjab and subsequently became part of the British Crown Jewels. This item represents the profound historical and cultural complexity of cross-continental heritage.',
        images: [
            KohinoorImg,
            KohinoorHistImg,
            'https://images.unsplash.com/photo-1615529151169-7b1ff50dc7f2?auto=format&fit=crop&q=80&w=1200'
        ],
        origin: 'India / UK',
        timePeriod: '13th Century - Present',
        institution: 'HM Tower of London (Current Display)',
        significance: 'High Historical & Cultural Significance',
        theme: 'Indian Heritage'
    },
    {
        id: 'faberge-eggs',
        title: 'The Imperial Fabergé Eggs',
        teaser: 'Vanguards of Russian craftsmanship and Imperial legacy.',
        description: 'Created by the House of Fabergé for the Russian Tsars between 1885 and 1917, these jeweled eggs are the pinnacle of decorative arts. Each egg was a unique masterpiece, containing a "surprise" – a miniature automaton or meticulous replica of a royal vessel or palace. They symbolize the opulence of the Romanov dynasty and the tragic end of an era. Today, they are held in major museum collections and private archives globally.',
        images: [
            FabergeEggImg,
            'https://images.unsplash.com/photo-1599420186940-7dd6fd6a4554?auto=format&fit=crop&q=80&w=1200',
            'https://images.unsplash.com/photo-1621243804936-775306a8f2e3?auto=format&fit=crop&q=80&w=1200'
        ],
        origin: 'Russia',
        timePeriod: '1885 - 1917',
        institution: 'Various (Hermitage, Fabergé Museum)',
        significance: 'Exquisite Craftsmanship & Imperial History',
        theme: 'World Heritage'
    },
    {
        id: 'tipu-sultan-tiger',
        title: 'Tipu’s Tiger',
        teaser: 'An 18th-century mechanical automaton of Mysore.',
        description: 'Tipu\'s Tiger is an 18th-century mechanical toy created for Tipu Sultan, the ruler of the Kingdom of Mysore in India. The automaton depicts a tiger mauling a British soldier. A mechanism inside allows the tiger to roar and the soldier to groan, while a small pipe organ is built into the tiger\'s body. It is a striking example of the fusion of mechanical engineering, art, and political expression from the Mysore court.',
        images: [
            TipuTigerImg,
            'https://images.unsplash.com/photo-1582560475093-d09bc33d07d1?auto=format&fit=crop&q=80&w=1200'
        ],
        origin: 'Mysore, India',
        timePeriod: 'Late 18th Century',
        institution: 'Victoria and Albert Museum, London',
        significance: 'Technological & Political History',
        theme: 'Indian Heritage'
    },
    {
        id: 'rosseta-stone',
        title: 'The Rosetta Stone',
        teaser: 'The key to unlocking the mysteries of ancient Egyptian hieroglyphs.',
        description: 'Discovered in 1799, the Rosetta Stone provided the modern world with the key to deciphering ancient Egyptian hieroglyphs. It contains a decree issued at Memphis in 196 BC on behalf of King Ptolemy V. The decree appears in three scripts: Ancient Egyptian hieroglyphs, Demotic script, and Ancient Greek. Its discovery was a turning point in Egyptology, allowing historians to read thousands of years of Egyptian records for the first time.',
        images: [
            RosettaStoneImg,
            'https://images.unsplash.com/photo-1608460333618-9366e84d436a?auto=format&fit=crop&q=80&w=1200'
        ],
        origin: 'Egypt',
        timePeriod: '196 BC',
        institution: 'The British Museum',
        significance: 'Foundational Archaeological Discovery',
        theme: 'World Heritage'
    }
];

export const getGalleryItems = () => {
    const saved = localStorage.getItem(GALLERY_STORAGE_KEY);
    return saved ? JSON.parse(saved) : curatorItems;
};

export const getGalleryItemById = (id) => {
    const items = getGalleryItems();
    return items.find(item => item.id === id);
};

export const getGalleryItemsByTheme = (theme) => {
    const items = getGalleryItems();
    return items.filter(item => item.theme === theme);
};

// Initialize if empty or update if using old unsplash URL for Kohinoor
const initializeStorage = () => {
    const saved = localStorage.getItem(GALLERY_STORAGE_KEY);
    if (!saved) {
        localStorage.setItem(GALLERY_STORAGE_KEY, JSON.stringify(curatorItems));
    } else {
        const parsed = JSON.parse(saved);
        // Force update Kohinoor to ensure View 1 and View 2 are correct
        const updated = parsed.map(item => {
            if (item.id === 'kohinoor-history') {
                // Extract unique images, excluding broken unsplash or old paths
                const currentImages = item.images || [];
                const hasCorrectViews = currentImages[0] === KohinoorImg && currentImages[1] === KohinoorHistImg;

                if (!hasCorrectViews) {
                    const otherImages = currentImages.filter(img =>
                        img !== KohinoorImg &&
                        img !== KohinoorHistImg &&
                        !img.toString().includes('kohinoor') &&
                        !img.toString().includes('unsplash')
                    );
                    return { ...item, images: [KohinoorImg, KohinoorHistImg, ...otherImages] };
                }
            }
            if (item.id === 'tipu-sultan-tiger') {
                const currentImages = item.images || [];
                const hasCorrectView = currentImages[0] === TipuTigerImg;

                if (!hasCorrectView) {
                    const otherImages = currentImages.filter(img =>
                        img !== TipuTigerImg &&
                        !img.toString().includes('unsplash')
                    );
                    return { ...item, images: [TipuTigerImg, ...otherImages] };
                }
            }
            if (item.id === 'faberge-eggs') {
                const currentImages = item.images || [];
                const hasCorrectView = currentImages[0] === FabergeEggImg;

                if (!hasCorrectView) {
                    const otherImages = currentImages.filter(img =>
                        img !== FabergeEggImg &&
                        !img.toString().includes('unsplash')
                    );
                    return { ...item, images: [FabergeEggImg, ...otherImages] };
                }
            }
            if (item.id === 'rosseta-stone') {
                const currentImages = item.images || [];
                const hasCorrectView = currentImages[0] === RosettaStoneImg;

                if (!hasCorrectView) {
                    const otherImages = currentImages.filter(img =>
                        img !== RosettaStoneImg &&
                        !img.toString().includes('unsplash')
                    );
                    return { ...item, images: [RosettaStoneImg, ...otherImages] };
                }
            }
            return item;
        });
        localStorage.setItem(GALLERY_STORAGE_KEY, JSON.stringify(updated));
    }
};

initializeStorage();
