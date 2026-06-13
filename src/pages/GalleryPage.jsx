import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import SEO from '../components/SEO';
import { Landmark, Compass, Award, History, Gem, Info, Loader2, ShieldCheck, ArrowRight } from 'lucide-react';
import { getGalleryItems } from '../utils/galleryStorage';
import galleryHero from '../assets/gallery-hero.png';

const THEMES = [
    {
        id: 'indian-heritage',
        name: 'Indian Heritage',
        icon: Landmark,
        description: 'Historical artifacts and cultural treasures from the Indian subcontinent.'
    },
    {
        id: 'world-heritage',
        name: 'World Heritage',
        icon: Compass,
        description: 'Iconic objects and legendary collections from across the globe.'
    },
    {
        id: 'private-collections',
        name: 'Iconic Private Collections',
        icon: Award,
        description: 'Exceptional archives preserved by private institutions and legendary collectors.'
    },
    {
        id: 'unusual-bizarre',
        name: 'Unusual & Bizarre Collections',
        icon: History,
        description: 'The rare, the curious, and the uniquely preserved collections of history.'
    },
    {
        id: 'timeless-objects',
        name: 'Timeless Objects',
        icon: Gem,
        description: 'Artifacts that transcend eras, representing the pinnacle of human achievement.'
    }
];

const GalleryCard = ({ item }) => {
    return (
        <Link
            to={`/gallery/${item.id}`}
            className="group relative flex flex-col bg-white/5 overflow-hidden transition-all duration-700 hover:shadow-[0_0_30px_rgba(191,155,48,0.15)] rounded-sm border border-[#3D352F] hover:border-[#C9A962]/40"
        >
            {/* The Frame */}
            <div className="p-4 flex flex-col items-center">
                {(() => {
                    const currentImg = item.images[0]?.toString() || '';
                    const isScene = currentImg.includes('OpIndia') || currentImg.includes('unsplash') || currentImg.includes('context') || currentImg.includes('Tiger') || currentImg.includes('rosetta');

                    return (
                        <div className={`relative aspect-square w-full overflow-hidden rounded-sm shadow-sm border border-gray-50 transition-all duration-700 ${isScene ? 'bg-gray-100 p-0' : 'bg-[#FAF9F6] p-0'}`}>
                            <img
                                src={item.images[0]}
                                alt={item.title}
                                className={`w-full h-full transition-transform duration-1000 group-hover:scale-110 ${isScene ? 'object-cover' : 'object-contain mix-blend-multiply'}`}
                            />
                        </div>
                    );
                })()}

                {/* Understated Title Label */}
                <div className="mt-4 text-center w-full px-2">
                    <p className="text-[9px] uppercase tracking-[0.25em] text-luxury-gold/50 font-bold mb-1">{item.theme}</p>
                    <h3 className="font-serif text-sm text-heritage-charcoal line-clamp-1 group-hover:text-luxury-gold transition-colors tracking-wide">{item.title}</h3>
                </div>
            </div>
        </Link>
    );
};

const GalleryPage = () => {
    const [galleryItems, setGalleryItems] = useState([]);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        setGalleryItems(getGalleryItems());
        setIsLoading(false);
    }, []);

    return (
        <div className="min-h-screen bg-[#1A1816] relative overflow-hidden">
            <SEO
                title="Gallery"
                description="Explore The Collectors Exchange gallery — a curated archive of heritage collections, rare artifacts, and timeless objects from around the world."
                canonical="/gallery"
            />
            {/* ... heritage background ... */}
            <div className="fixed inset-0 pointer-events-none opacity-20 mix-blend-overlay" style={{
                backgroundImage: 'url("https://www.transparenttextures.com/patterns/pinstriped-suit.png")',
            }}></div>
            <div className="fixed inset-0 pointer-events-none shadow-[inset_0_0_200px_rgba(0,0,0,0.8)]"></div>

            <div className="relative z-10 pb-24">
                <section
                    className="relative h-[45vh] sm:h-[55vh] lg:h-[65vh] min-h-[300px] sm:min-h-[400px] lg:min-h-[500px] flex items-center justify-center overflow-hidden"
                    style={{
                        backgroundImage: `url(${galleryHero})`,
                        backgroundSize: 'cover',
                        backgroundPosition: 'center',
                    }}
                >
                    <div className="absolute inset-0 bg-black/30"></div>
                    <div className="relative z-10 text-center px-4 sm:px-6">
                        <h5 className="text-white/70 tracking-[0.3em] sm:tracking-[0.4em] font-sans text-[10px] sm:text-xs font-bold uppercase mb-4 sm:mb-6">
                            Where History Breathes Again
                        </h5>
                        <h1 className="text-4xl sm:text-5xl md:text-7xl lg:text-8xl font-serif text-white font-normal tracking-tight">
                            The Gallery
                        </h1>
                    </div>

                    <div className="absolute bottom-4 sm:bottom-12 left-4 sm:left-auto right-4 sm:right-12 bg-white/10 backdrop-blur-md border border-white/20 p-4 sm:p-6 text-white text-left max-w-[calc(100%-2rem)] sm:max-w-sm">
                        <p className="font-serif italic text-sm sm:text-lg mb-2">"History isn't meant to be trapped in the past. It is meant to be touched, held, and lived in the present."</p>
                        <p className="text-[10px] sm:text-xs uppercase tracking-widest text-white/50">— The Collectors Exchange</p>
                    </div>
                </section>

                <section className="py-24 px-6 border-b border-[#3D352F]/30">
                    <div className="container mx-auto max-w-4xl text-center">
                        <div className="flex justify-center mb-8">
                            <div className="w-12 h-px bg-[#C9A962]/20"></div>
                            <div className="mx-4 text-[#C9A962]/40">
                                <Landmark size={20} strokeWidth={1} />
                            </div>
                        </div>
                        <h2 className="text-4xl font-serif text-[#E5E1DA] mb-8 leading-tight tracking-wide">A Museum Without Walls</h2>
                        <p className="text-lg text-[#9C8B7E] font-light leading-relaxed max-w-2xl mx-auto">
                            In a world obsessed with the "new" and the "now," the Gallery is our tribute to the "forever." This is more than a marketplace; it is a digital archive of the mechanical heartbeats, the hand-forged artifacts, and the timeless treasures that have survived the decades. Every article showcased here has been found in the needle-in-a-haystack search across the country and brought here for you to witness. As you scroll, you aren't just looking at products; you are walking through the corridors of time.
                        </p>
                    </div>
                </section>

                {/* Archival Separator Line with Icon */}
                <div className="bg-[#0F0F0F] py-8 relative">
                    <div className="container mx-auto px-6 flex justify-center items-center">
                        <div className="w-full max-w-md h-px bg-white/10"></div>
                        <div className="px-6">
                            <Landmark className="text-luxury-gold opacity-50" size={20} strokeWidth={1} />
                        </div>
                        <div className="w-full max-w-md h-px bg-white/10"></div>
                    </div>
                </div>

                {/* Stewardship Section - Matched to Screenshot 2 */}
                <section className="py-32 px-6 bg-[#0F0F0F] relative">
                    <div className="container mx-auto max-w-4xl text-center">
                        <div className="flex flex-col items-center mb-16">
                            <div className="mb-8 opacity-40">
                                <Landmark className="text-luxury-gold" size={32} strokeWidth={1} />
                            </div>
                            <div className="flex items-center gap-6 mb-12">
                                <div className="w-12 h-px bg-luxury-gold/20"></div>
                                <h2 className="text-3xl md:text-5xl font-serif text-white tracking-widest uppercase">
                                    Stewardship and Education
                                </h2>
                                <div className="w-12 h-px bg-luxury-gold/20"></div>
                            </div>
                        </div>
                        
                        <div className="relative max-w-3xl mx-auto">
                            <p className="text-lg md:text-2xl text-white/80 font-serif italic leading-relaxed text-center">
                                "The Collectors Exchange Gallery is more than just a collection; it is an educational archive. We are here to rescue the 'dead value' of Indian heritage and bring it back to life."
                            </p>
                            <div className="absolute -top-10 -left-10 opacity-5">
                                <History size={120} strokeWidth={0.5} className="text-white" />
                            </div>
                        </div>
                    </div>
                </section>

                {/* Gallery Content Section */}
                <section className="bg-white py-32">
                    {isLoading ? (
                        <div className="flex flex-col items-center justify-center py-32">
                            <Loader2 className="animate-spin text-luxury-gold/40 mb-4" size={48} />
                            <p className="text-heritage-charcoal/40 font-serif text-xl italic tracking-widest opacity-60">Restoring Historical Context...</p>
                        </div>
                    ) : (
                        <div className="space-y-32">
                        {THEMES.map((theme) => {
                            const items = galleryItems.filter(item => item.theme === theme.name);
                            if (items.length === 0) return null;

                            return (
                                <section key={theme.id} className="container mx-auto px-6">
                                    <div className="flex flex-col md:flex-row md:items-end justify-between mb-12 gap-8">
                                        <div className="max-w-2xl">
                                            <div className="flex items-center gap-4 mb-4">
                                                <theme.icon className="text-luxury-gold/70" size={20} strokeWidth={1} />
                                                <h2 className="text-2xl md:text-3xl font-serif text-heritage-charcoal tracking-wide">{theme.name}</h2>
                                            </div>
                                            <p className="text-heritage-charcoal/60 text-xs font-light leading-relaxed italic">
                                                {theme.description}
                                            </p>
                                        </div>
                                        <div className="hidden md:block">
                                            <div className="text-[9px] uppercase tracking-[0.3em] text-[#C9A962]/30 border-b border-[#C9A962]/10 pb-2 flex items-center gap-2">
                                                <span>Archival Browse</span>
                                                <div className="w-12 h-px bg-[#C9A962]/10"></div>
                                            </div>
                                        </div>
                                    </div>

                                    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-6 md:gap-8">
                                        {items.map((item) => (
                                            <GalleryCard key={item.id} item={item} />
                                        ))}
                                    </div>
                                </section>
                            );
                        })}
                        </div>
                    )}
                </section>




            </div>
        </div>
    );
};

export default GalleryPage;
