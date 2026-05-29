import React, { useState } from 'react';
import { Helmet } from 'react-helmet-async';
import { useAuctions, useAuction, usePlaceBid } from '../hooks/api/useAuction';
import { getUser } from '../utils/storage';
import { Loader2, Clock, Zap, Gavel, Instagram } from 'lucide-react';

function AuctionCard({ auction }) {
    const [showBid, setShowBid] = useState(false);
    const [bidAmount, setBidAmount] = useState('');
    const placeBidMutation = usePlaceBid();

    const user = getUser();
    const isActive = auction.status === 'ACTIVE';
    const minBid = (auction.currentBid || auction.startingBid) + 1;
    const endsAt = new Date(auction.endDate);
    const timeLeft = endsAt - new Date();
    const hoursLeft = Math.max(0, Math.floor(timeLeft / (1000 * 60 * 60)));
    const minutesLeft = Math.max(0, Math.floor((timeLeft % (1000 * 60 * 60)) / (1000 * 60)));

    const handleBid = async () => {
        const amount = parseFloat(bidAmount);
        if (isNaN(amount) || amount < minBid) return;
        try {
            await placeBidMutation.mutateAsync({ auctionId: auction.id, amount });
            setBidAmount('');
            setShowBid(false);
        } catch (err) {
            console.error('Bid failed:', err);
        }
    };

    return (
        <div className="bg-white border border-gray-100 hover:shadow-heritage transition-all duration-500">
            <div className="relative aspect-[4/3] bg-heritage-beige overflow-hidden">
                {auction.images?.[0] ? (
                    <img src={auction.images[0]} alt={auction.title} className="object-cover w-full h-full transition-transform duration-700" />
                ) : auction.product?.image ? (
                    <img src={auction.product.image} alt={auction.title} className="object-cover w-full h-full transition-transform duration-700" />
                ) : (
                    <div className="absolute inset-0 flex items-center justify-center text-heritage-bronze/30 bg-heritage-cream">
                        <Gavel size={48} strokeWidth={1} />
                    </div>
                )}

                <div className={`absolute top-4 left-4 px-3 py-1.5 text-xs uppercase tracking-wider font-medium ${
                    isActive ? 'bg-green-600 text-white' : 'bg-heritage-charcoal/80 text-white'
                }`}>
                    {auction.status}
                </div>

                {isActive && (
                    <div className="absolute bottom-4 right-4 bg-white/90 backdrop-blur-sm px-3 py-1.5 text-sm font-medium flex items-center gap-2">
                        <Clock size={14} />
                        {hoursLeft}h {minutesLeft}m left
                    </div>
                )}
            </div>

            <div className="p-5">
                <h3 className="font-serif text-lg font-medium text-heritage-charcoal mb-1">{auction.title}</h3>
                {auction.product?.category && (
                    <p className="text-xs text-heritage-bronze/60 uppercase tracking-wider mb-2">{auction.product.category}</p>
                )}
                <p className="text-sm text-gray-500 line-clamp-2 mb-4">{auction.description}</p>

                <div className="flex items-center justify-between pt-4 border-t border-gray-100">
                    <div>
                        <p className="text-xs text-gray-400 uppercase tracking-wider">Current Bid</p>
                        <p className="text-xl font-serif font-bold text-heritage-gold-muted">
                            ₹{(auction.currentBid || auction.startingBid)?.toLocaleString()}
                        </p>
                    </div>
                    <div className="text-right text-xs text-gray-400">
                        <p>{auction._count?.bids || 0} bids</p>
                    </div>
                </div>

                {isActive && (
                    <div className="mt-4">
                        {showBid ? (
                            <div className="flex gap-2">
                                <input
                                    type="number"
                                    value={bidAmount}
                                    onChange={(e) => setBidAmount(e.target.value)}
                                    placeholder={`Min ₹${minBid}`}
                                    min={minBid}
                                    className="flex-1 border border-gray-200 px-3 py-2 text-sm focus:outline-none focus:border-heritage-bronze"
                                />
                                <button
                                    onClick={handleBid}
                                    disabled={placeBidMutation.isPending || !user}
                                    className="px-4 py-2 bg-heritage-charcoal text-white text-sm hover:bg-heritage-brown disabled:opacity-50 transition-colors"
                                >
                                    {placeBidMutation.isPending ? <Loader2 className="animate-spin" size={16} /> : 'Bid'}
                                </button>
                            </div>
                        ) : (
                            <button
                                onClick={() => setShowBid(true)}
                                disabled={!user}
                                className="w-full py-2.5 text-xs uppercase tracking-[0.15em] bg-heritage-charcoal text-white hover:bg-heritage-brown transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
                            >
                                <Zap size={14} /> Place Bid
                            </button>
                        )}
                        {!user && <p className="text-xs text-red-500 mt-1">Sign in to place a bid</p>}
                    </div>
                )}
            </div>
        </div>
    );
}

const Auction = () => {
    const [filter, setFilter] = useState('ACTIVE');
    const { data: auctions = [], isLoading } = useAuctions(filter);

    return (
        <div className="min-h-screen bg-heritage-cream">
            <Helmet><title>Auctions — The Collectors Exchange</title></Helmet>
            {/* Hero */}
            <section className="relative h-[40vh] sm:h-[45vh] lg:h-[50vh] min-h-[300px] sm:min-h-[350px] lg:min-h-[400px] flex items-center justify-center overflow-hidden bg-heritage-charcoal">
                <div className="absolute inset-0 bg-black/50 z-10"></div>
                <div
                    className="absolute inset-0 z-0 bg-cover bg-center bg-no-repeat"
                    style={{ backgroundImage: "url('https://images.unsplash.com/photo-1618331835717-801e976710b2?q=80&w=2500&auto=format&fit=crop')" }}
                >
                    <div className="absolute inset-0 bg-black/60"></div>
                </div>
                <div className="relative z-20 container mx-auto px-4 sm:px-6 text-center">
                    <div className="flex items-center justify-center gap-3 sm:gap-4 mb-4 sm:mb-6">
                        <div className="h-px w-8 sm:w-12 bg-luxury-gold/50"></div>
                        <span className="text-luxury-gold uppercase tracking-[0.2em] sm:tracking-[0.3em] text-[10px] sm:text-xs font-bold">Live Auctions</span>
                        <div className="h-px w-8 sm:w-12 bg-luxury-gold/50"></div>
                    </div>
                    <h1 className="text-3xl sm:text-4xl md:text-7xl font-serif text-white font-normal mb-4 sm:mb-6">
                        The Auction House
                    </h1>
                    <p className="text-gray-300 text-sm sm:text-base md:text-lg max-w-xl mx-auto font-light">
                        Bid on rare collectors' items, verified and curated by our experts.
                    </p>
                    <a
                        href="https://www.instagram.com/the_collectors_exchange/"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-2 mt-6 sm:mt-8 px-5 sm:px-6 py-2.5 sm:py-3 border border-white/20 text-white/80 hover:text-luxury-gold hover:border-luxury-gold/50 transition-all duration-300 text-[11px] sm:text-sm uppercase tracking-widest"
                    >
                        <Instagram size={16} className="sm:w-[18px] sm:h-[18px]" />
                        Follow on Instagram
                    </a>
                </div>
            </section>

            {/* Filter Tabs */}
            <section className="py-4 sm:py-6 px-4 sm:px-6 bg-white border-b border-gray-200">
                <div className="container mx-auto max-w-6xl flex gap-2 sm:gap-4 overflow-x-auto scrollbar-hide">
                    {['ACTIVE', 'UPCOMING', 'ENDED'].map((s) => (
                        <button
                            key={s}
                            onClick={() => setFilter(s)}
                            className={`px-4 sm:px-6 py-2 text-[11px] sm:text-sm uppercase tracking-wider transition-colors whitespace-nowrap ${
                                filter === s
                                    ? 'bg-heritage-charcoal text-white'
                                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                            }`}
                        >
                            {s === 'ACTIVE' ? 'Live Now' : s === 'UPCOMING' ? 'Upcoming' : 'Past Auctions'}
                        </button>
                    ))}
                </div>
            </section>

            {/* Auctions Grid */}
            <section className="py-12 px-6">
                <div className="container mx-auto max-w-6xl">
                    {isLoading ? (
                        <div className="flex justify-center py-24">
                            <Loader2 className="animate-spin text-luxury-gold" size={48} />
                        </div>
                    ) : auctions.length > 0 ? (
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
                            {auctions.map((auction) => (
                                <AuctionCard key={auction.id} auction={auction} />
                            ))}
                        </div>
                    ) : (
                        <div className="text-center py-24">
                            <Gavel size={48} strokeWidth={1} className="mx-auto text-heritage-bronze/30 mb-4" />
                            <p className="text-heritage-charcoal/60 font-serif text-lg">No {filter.toLowerCase()} auctions at this time.</p>
                            <p className="text-heritage-bronze/50 text-sm mt-2">Check back soon for new listings.</p>
                        </div>
                    )}
                </div>
            </section>
        </div>
    );
};

export default Auction;