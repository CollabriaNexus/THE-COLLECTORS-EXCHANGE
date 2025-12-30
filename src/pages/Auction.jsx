import React from 'react';
import AuctionCard from '../components/AuctionCard';
import { Gavel, AlertCircle } from 'lucide-react';

const MOCK_AUCTIONS = [
    { id: 1, name: 'Rare 1940s Typewriter', category: 'Antiques', currentBid: 350, endTime: new Date(Date.now() + 50000000), image: 'https://images.unsplash.com/photo-1519709042457-347528e57978?auto=format&fit=crop&q=80&w=1000' },
    { id: 2, name: 'Signed First Edition Book', category: 'Collectibles', currentBid: 1200, endTime: new Date(Date.now() + 120000000), image: 'https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?auto=format&fit=crop&q=80&w=1000' },
    { id: 3, name: 'Vintage Leica Camera', category: 'Limited Editions', currentBid: 2800, endTime: new Date(Date.now() + 9000000), image: 'https://images.unsplash.com/photo-1516035069371-29a1b244cc32?auto=format&fit=crop&q=80&w=1000' },
];

const Auction = () => {
    return (
        <div className="container mx-auto py-12 px-6">
            <div className="text-center mb-16">
                <h1 className="text-4xl md:text-5xl font-serif mb-4">Live Auctions</h1>
                <p className="text-gray-500 font-light max-w-2xl mx-auto">
                    Participate in real-time bidding for exclusive items. All items are verified for authenticity before listing.
                </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mb-20">
                {MOCK_AUCTIONS.map(auction => (
                    <AuctionCard key={auction.id} auction={auction} />
                ))}
            </div>

            {/* Auction Rules */}
            <div className="bg-white border border-gray-200 p-8 md:p-12">
                <div className="flex items-center gap-3 mb-6">
                    <Gavel className="text-luxury-gold" size={32} />
                    <h2 className="text-2xl font-serif">Auction Rules & Guidelines</h2>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8 text-sm text-gray-600">
                    <div className="space-y-4">
                        <div className="flex gap-3">
                            <AlertCircle size={20} className="text-gray-400 flex-shrink-0" />
                            <p><strong>Bid Increments:</strong> Bids must increase by a minimum of 5% of the current bid value.</p>
                        </div>
                        <div className="flex gap-3">
                            <AlertCircle size={20} className="text-gray-400 flex-shrink-0" />
                            <p><strong>Payment:</strong> Winning bidders have 24 hours to complete payment, otherwise the item goes to the next highest bidder.</p>
                        </div>
                    </div>
                    <div className="space-y-4">
                        <div className="flex gap-3">
                            <AlertCircle size={20} className="text-gray-400 flex-shrink-0" />
                            <p><strong>Authenticity Guarantee:</strong> All auction items are pre-verified. Certificates correspond to the winning bidder.</p>
                        </div>
                        <div className="flex gap-3">
                            <AlertCircle size={20} className="text-gray-400 flex-shrink-0" />
                            <p><strong>Buyer's Premium:</strong> A standard 15% platform fee is added to the final hammer price.</p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Auction;
