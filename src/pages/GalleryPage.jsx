import React from 'react';
import { Link } from 'react-router-dom';
import { Landmark, Compass, Award, History, Gem, Info, Loader2, ShieldCheck, ArrowRight } from 'lucide-react';
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
            className="group relative flex flex-col bg-white overflow-hidden transition-all duration-700 hover:shadow-heritage-hover rounded-sm border border-gray-100 hover:border-luxury-gold/30"
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
    const { data: galleryItems = [], isLoading } = useGallery();

    return (
        <div className="min-h-screen bg-white relative overflow-hidden">
            <div className="relative z-10">
                {/* Hero Section - Museum Archival Style */}
                <section className="relative h-[90vh] flex flex-col items-center justify-center overflow-hidden">
                    {/* Background Image */}
                    <div className="absolute inset-0 z-0">
                        <img 
                            src={galleryHero} 
                            alt="Museum Gallery" 
                            className="w-full h-full object-cover"
                        />
                        <div className="absolute inset-0 bg-black/30"></div>
                    </div>

                    {/* Centered Branding (Behind or to the left of the card) */}
                    <div className="absolute left-1/2 top-1/2 -translate-x-full -translate-y-1/2 z-10 hidden md:block">
                        <h5 className="text-white tracking-[1em] font-sans text-[12px] font-light uppercase opacity-40 whitespace-nowrap rotate-[-90deg] origin-right translate-x-[-150%]">
                            Educational Archive
                        </h5>
                    </div>

                    {/* Glassmorphism Quote Card - Prominent and Central-Right */}
                    <div className="relative z-20 w-full max-w-6xl px-6 flex justify-end">
                        <div className="bg-[#5C4D3C]/30 backdrop-blur-2xl border border-white/10 p-12 md:p-20 shadow-[0_40px_100px_rgba(0,0,0,0.4)] max-w-2xl transform translate-y-10">
                            <p className="font-serif italic text-3xl md:text-5xl text-white leading-[1.15] mb-12 drop-shadow-lg tracking-tight">
                                "The past is a foreign country; they do things differently there."
                            </p>
                            <div className="flex items-center gap-6">
                                <div className="h-px w-12 bg-white/40"></div>
                                <p className="text-[11px] md:text-xs uppercase tracking-[0.5em] text-white font-bold opacity-80">
                                    - L.P. Hartley, The Go-Between
                                </p>
                            </div>
                        </div>
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
