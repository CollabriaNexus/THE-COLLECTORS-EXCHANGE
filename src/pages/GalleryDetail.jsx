import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { Landmark, Compass, History, Info, ChevronLeft, ChevronRight, Share2, Printer, Loader2 } from 'lucide-react';
import { useGalleryItem } from '../hooks/api/useGallery';

const GalleryDetail = () => {
    const { id } = useParams();
    const { data: item, isLoading } = useGalleryItem(id);
    const [activeImage, setActiveImage] = useState(0);

    useEffect(() => {
        window.scrollTo(0, 0);
    }, [id]);

    if (isLoading) {
        return (
            <div className="min-h-screen bg-[#F9F7F5] flex flex-col items-center justify-center p-6">
                <Loader2 className="animate-spin text-amber-800 mb-4" size={48} />
                <p className="text-gray-500 font-serif text-xl italic">Unrolling The Manuscript...</p>
            </div>
        );
    }

    if (!item) {
        return (
            <div className="min-h-screen bg-[#F9F7F5] flex items-center justify-center p-6">
                <div className="text-center">
                    <h2 className="text-2xl font-serif text-gray-400 mb-4">Archive Record Not Found</h2>
                    <Link to="/THE-COLLECTORS-EXCHANGE/gallery" className="text-amber-800 uppercase tracking-widest text-xs font-bold hover:underline">
                        Return to Archive
                    </Link>
                </div>
            </div>
        );
    }

    const selectedImage = item.images[activeImage] ? activeImage : 0;

    return (
        <div className="min-h-screen bg-[#F9F7F5]">
            {/* Top Navigation Bar */}
            <div className="border-b border-gray-200 bg-white/50 sticky top-0 z-50 backdrop-blur-md">
                <div className="container mx-auto px-6 py-4 flex items-center justify-between">
                    <Link
                        to="/THE-COLLECTORS-EXCHANGE/gallery"
                        className="flex items-center gap-2 text-gray-500 hover:text-gray-900 transition-colors"
                    >
                        <ChevronLeft size={16} />
                        <span className="text-[10px] uppercase tracking-[0.2em] font-bold">Back to Gallery</span>
                    </Link>
                    <div className="flex gap-6 items-center">
                        <button className="text-gray-400 hover:text-gray-900 transition-colors">
                            <Share2 size={16} />
                        </button>
                        <button className="text-gray-400 hover:text-gray-900 transition-colors">
                            <Printer size={16} />
                        </button>
                    </div>
                </div>
            </div>

            <main className="container mx-auto px-6 py-12 md:py-24 max-w-7xl">
                <div className="flex flex-col lg:flex-row gap-20">

                    {/* Image Section */}
                    <div className="w-full lg:w-3/5 space-y-8">
                        {(() => {
                            const currentImg = item.images[selectedImage]?.toString() || '';
                            const isScene = currentImg.includes('OpIndia') || currentImg.includes('unsplash') || currentImg.includes('context') || currentImg.includes('Tiger') || currentImg.includes('rosetta');

                            return (
                                <div className={`relative aspect-square bg-[#fdfdfd] bg-[radial-gradient(circle,_#ffffff_0%,_#f8f8f8_100%)] shadow-2xl overflow-hidden flex items-center justify-center border border-gray-100/50 rounded-sm transition-all duration-500 ${isScene ? 'p-0' : 'p-6'}`}>
                                    <img
                                        src={item.images[selectedImage]}
                                        alt={item.title}
                                        className={`max-w-full max-h-full transition-all duration-700 hover:scale-[1.02] ${isScene ? 'w-full h-full object-cover' : 'object-contain drop-shadow-[0_10px_20px_rgba(0,0,0,0.08)]'}`}
                                    />
                                </div>
                            );
                        })()}

                        {item.images.length > 1 && (
                            <div className="flex gap-4 overflow-x-auto pb-4">
                                {item.images.map((img, idx) => (
                                    <button
                                        key={idx}
                                        onClick={() => setActiveImage(idx)}
                                        className={`w-24 h-24 flex-shrink-0 bg-[#fdfdfd] border p-3 transition-all ${selectedImage === idx ? 'border-amber-800 ring-1 ring-amber-800/20 opacity-100 shadow-md scale-95' : 'border-gray-200 opacity-60 hover:opacity-100 hover:border-gray-300'}`}
                                    >
                                        <img src={img} alt={`View ${idx + 1}`} className="w-full h-full object-contain drop-shadow-sm" />
                                    </button>
                                ))}
                            </div>
                        )}

                        {/* Museum Integrity Statement */}
                        <div className="p-8 bg-gray-50 border border-gray-100 flex gap-6 items-start">
                            <Info size={24} strokeWidth={1} className="text-gray-400 mt-1" />
                            <div>
                                <h4 className="font-serif text-sm font-medium text-gray-900 mb-2">Archive Provenance</h4>
                                <p className="text-xs text-gray-500 leading-relaxed font-light italic">
                                    This archive record is strictly for educational and historical documentation. The images and descriptions are curated from official institutional records and expert research accounts.
                                </p>
                            </div>
                        </div>
                    </div>

                    {/* Content Section */}
                    <div className="w-full lg:w-2/5">
                        <div className="sticky top-32">
                            <div className="mb-12">
                                <p className="text-[10px] uppercase tracking-[0.3em] font-bold text-amber-800 mb-4">{item.theme || "General Archive"}</p>
                                <h1 className="text-4xl md:text-5xl font-serif text-gray-900 leading-tight mb-8">
                                    {item.title}
                                </h1>
                                <div className="w-16 h-0.5 bg-amber-800/30 mb-8"></div>
                                <p className="text-xl font-serif italic text-gray-600 leading-relaxed">
                                    "{item.teaser}"
                                </p>
                            </div>

                            {/* Metadata Section */}
                            <div className="grid grid-cols-2 gap-y-10 py-10 border-y border-gray-200 mb-12">
                                <div>
                                    <p className="text-[10px] uppercase tracking-[0.2em] font-bold text-gray-400 mb-2 font-sans truncate pr-4">Origin / Country</p>
                                    <p className="font-serif text-lg text-gray-900">{item.origin || "Information not yet added."}</p>
                                </div>
                                <div>
                                    <p className="text-[10px] uppercase tracking-[0.2em] font-bold text-gray-400 mb-2 font-sans truncate pr-4">Time Period</p>
                                    <p className="font-serif text-lg text-gray-900">{item.timePeriod || "Information not yet added."}</p>
                                </div>
                                <div>
                                    <p className="text-[10px] uppercase tracking-[0.2em] font-bold text-gray-400 mb-2 font-sans truncate pr-4">Associated Inst.</p>
                                    <p className="font-serif text-lg text-gray-900">{item.institution || "Information not yet added."}</p>
                                </div>
                                <div>
                                    <p className="text-[10px] uppercase tracking-[0.2em] font-bold text-gray-400 mb-2 font-sans truncate pr-4">Historical Sig.</p>
                                    <p className="font-serif text-lg text-gray-900">{item.significance || "Information not yet added."}</p>
                                </div>
                            </div>

                            {/* Story Section */}
                            <div className="space-y-8">
                                <h3 className="text-[10px] uppercase tracking-[0.3em] font-bold text-gray-400">Archival Narrative</h3>
                                <div className="font-serif text-lg leading-[2] text-gray-800 space-y-8 first-letter:text-4xl first-letter:font-bold first-letter:mr-1 first-letter:float-left">
                                    {item.description ? item.description.split('\n\n').map((para, i) => (
                                        <p key={i}>{para}</p>
                                    )) : <p className="italic text-gray-400">History not yet documented in this archive.</p>}
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </main>

            {/* Footer-like section for detail */}
            <section className="bg-white py-24 border-t border-gray-200 mt-24">
                <div className="container mx-auto px-6 text-center">
                    <p className="text-[10px] uppercase tracking-[0.4em] font-bold text-gray-400 mb-8">Custodian Registry</p>
                    <div className="flex flex-col items-center">
                        <div className="w-12 h-12 bg-[#F9F7F5] border border-gray-100 flex items-center justify-center mb-6">
                            <Landmark size={24} strokeWidth={1} className="text-gray-300" />
                        </div>
                        <p className="font-serif text-gray-500 max-w-sm">Every object in this record serves as a bridge to a story worth telling.</p>
                    </div>
                </div>
            </section>
        </div>
    );
};

export default GalleryDetail;
