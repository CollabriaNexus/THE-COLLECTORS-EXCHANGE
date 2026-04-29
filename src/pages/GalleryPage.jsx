import React from 'react';
import { Link } from 'react-router-dom';
import { Landmark, Compass, Award, History, Gem, Info, Loader2 } from 'lucide-react';
import { useGallery } from '../hooks/api/useGallery';
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
            to={`/THE-COLLECTORS-EXCHANGE/gallery/${item.id}`}
            className="group relative flex flex-col bg-white/5 overflow-hidden transition-all duration-700 hover:shadow-[0_0_30px_rgba(191,155,48,0.15)] rounded-sm border border-[#3D352F] hover:border-[#C9A962]/40"
        >
            {/* The Frame */}
            <div className="p-4 flex flex-col items-center">
                {(() => {
                    const currentImg = item.images[0]?.toString() || '';
                    const isScene = currentImg.includes('OpIndia') || currentImg.includes('unsplash') || currentImg.includes('context') || currentImg.includes('Tiger') || currentImg.includes('rosetta');

                    return (
                        <div className={`relative aspect-square w-full overflow-hidden rounded-sm shadow-[inset_0_2px_10px_rgba(0,0,0,0.3)] border border-black/40 group-hover:border-[#C9A962]/20 transition-all duration-700 ${isScene ? 'bg-black/20 p-0' : 'bg-[#e2e0d9] p-0'}`}>
                            <img
                                src={item.images[0]}
                                alt={item.title}
                                className={`w-full h-full transition-transform duration-1000 group-hover:scale-110 ${isScene ? 'object-cover' : 'object-contain mix-blend-multiply brightness-[1.1] contrast-[1.1]'}`}
                            />
                        </div>
                    );
                })()}

                {/* Understated Title Label */}
                <div className="mt-4 text-center w-full px-2">
                    <p className="text-[9px] uppercase tracking-[0.25em] text-[#C9A962]/50 font-bold mb-1">{item.theme}</p>
                    <h3 className="font-serif text-sm text-[#E5E1DA] line-clamp-1 group-hover:text-[#C9A962] transition-colors tracking-wide">{item.title}</h3>
                </div>
            </div>

            {/* Subtle Metallic Corner Detail */}
            <div className="absolute top-0 left-0 w-1 h-1 border-t border-l border-[#C9A962]/20 group-hover:border-[#C9A962]/40 transition-colors"></div>
            <div className="absolute top-0 right-0 w-1 h-1 border-t border-r border-[#C9A962]/20 group-hover:border-[#C9A962]/40 transition-colors"></div>
            <div className="absolute bottom-0 left-0 w-1 h-1 border-b border-l border-[#C9A962]/20 group-hover:border-[#C9A962]/40 transition-colors"></div>
            <div className="absolute bottom-0 right-0 w-1 h-1 border-b border-r border-[#C9A962]/20 group-hover:border-[#C9A962]/40 transition-colors"></div>
        </Link>
    );
};

const GalleryPage = () => {
    const { data: galleryItems = [], isLoading } = useGallery();

    return (
        <div className="min-h-screen bg-[#1A1816] relative overflow-hidden">
            {/* ... heritage background ... */}
            <div className="fixed inset-0 pointer-events-none opacity-20 mix-blend-overlay" style={{
                backgroundImage: 'url("https://www.transparenttextures.com/patterns/pinstriped-suit.png")',
            }}></div>
            <div className="fixed inset-0 pointer-events-none shadow-[inset_0_0_200px_rgba(0,0,0,0.8)]"></div>

            <div className="relative z-10 pb-24">
                {/* ... hero and statement ... */}
                {/* ... (keeping hero and statement code identical for brevity) ... */}
                <section
                    className="relative h-[65vh] flex items-center justify-center overflow-hidden"
                    style={{
                        backgroundImage: `url(${galleryHero})`,
                        backgroundSize: 'cover',
                        backgroundPosition: 'center',
                    }}
                >
                    <div className="absolute inset-0 bg-black/30"></div>
                    <div className="relative z-10 text-center px-6">
                        <h5 className="text-white/70 tracking-[0.4em] font-sans text-xs font-bold uppercase mb-6">
                            Educational Archive
                        </h5>
                        <div className="opacity-0 translate-y-4">
                            <h1 className="text-6xl md:text-8xl font-serif text-white font-normal tracking-tight">The Gallery</h1>
                        </div>
                    </div>

                    <div className="absolute bottom-12 right-12 bg-white/10 backdrop-blur-md border border-white/20 p-6 text-white text-left max-w-sm">
                        <p className="font-serif italic text-lg mb-2">"The past is a foreign country; they do things differently there."</p>
                        <p className="text-xs uppercase tracking-widest text-white/50">- L.P. Hartley, The Go-Between</p>
                    </div>
                </section>

                <section className="py-24 px-6 border-b border-[#3D352F]/30">
                    <div className="container mx-auto max-w-4xl text-center">
                        <div className="flex justify-center mb-8">
                            <div className="w-12 h-px bg-[#C9A962]/20"></div>
                            <div className="mx-4 text-[#C9A962]/40">
                                <Landmark size={20} strokeWidth={1} />
                            </div>
                            <div className="w-12 h-px bg-[#C9A962]/20"></div>
                        </div>
                        <h2 className="text-4xl font-serif text-[#E5E1DA] mb-8 leading-tight tracking-wide">A Sanctuary for Human Heritage</h2>
                        <p className="text-lg text-[#9C8B7E] font-light leading-relaxed max-w-2xl mx-auto">
                            The Gallery is a non-commercial archival project dedicated to the preservation and study of objects that shaped civilizations. We seek to provide context, history, and respect to what has endured the passage of time.
                        </p>
                    </div>
                </section>

                {isLoading ? (
                    <div className="flex flex-col items-center justify-center py-32">
                        <Loader2 className="animate-spin text-[#C9A962]/40 mb-4" size={48} />
                        <p className="text-[#9C8B7E] font-serif text-xl italic tracking-widest opacity-60">Restoring Historical Context...</p>
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
                                                <theme.icon className="text-[#C9A962]/70" size={20} strokeWidth={1} />
                                                <h2 className="text-2xl md:text-3xl font-serif text-[#E5E1DA] tracking-wide">{theme.name}</h2>
                                            </div>
                                            <p className="text-[#9C8B7E] text-xs font-light leading-relaxed italic opacity-80">
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

                {/* Empty States / Missing Theme Handling */}
                <section className="mt-16 pt-16 border-t border-[#3D352F]/30 container mx-auto px-6 text-center">
                    <Info size={24} strokeWidth={1} className="mx-auto text-[#C9A962]/20 mb-6" />
                    <h3 className="text-lg font-serif text-[#9C8B7E]/60 mb-2 tracking-wide">Archives in Expansion</h3>
                    <p className="text-xs text-[#9C8B7E]/40 font-light italic">
                        Additional collections are currently undergoing authentication and historical categorization.
                    </p>
                </section>
            </div>
        </div>
    );
};

export default GalleryPage;
