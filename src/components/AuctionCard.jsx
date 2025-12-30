import React, { useState, useEffect } from 'react';
import { Heart, Clock } from 'lucide-react';

const AuctionCard = ({ auction }) => {
    const calculateTimeLeft = () => {
        const difference = +new Date(auction.endTime) - +new Date();
        let timeLeft = {};

        if (difference > 0) {
            timeLeft = {
                h: Math.floor((difference / (1000 * 60 * 60)) % 24),
                m: Math.floor((difference / 1000 / 60) % 60),
                s: Math.floor((difference / 1000) % 60),
            };
        }
        return timeLeft;
    };

    const [timeLeft, setTimeLeft] = useState(calculateTimeLeft());

    useEffect(() => {
        const timer = setTimeout(() => {
            setTimeLeft(calculateTimeLeft());
        }, 1000);
        return () => clearTimeout(timer);
    });

    const timerComponents = [];
    Object.keys(timeLeft).forEach((interval) => {
        // Only show if we have time left, or show 0s
        if (timeLeft[interval] === undefined) return;

        // Format with leading zero
        const value = timeLeft[interval] < 10 ? `0${timeLeft[interval]}` : timeLeft[interval];

        timerComponents.push(
            <span key={interval} className="font-mono bg-black text-white px-1 py-0.5 rounded mx-0.5 text-xs">
                {value}{interval}
            </span>
        );
    });

    return (
        <div className="bg-white border border-gray-100 group hover:shadow-lg transition-shadow duration-300">
            <div className="relative aspect-square bg-gray-100 overflow-hidden">
                {/* Placeholder for image */}
                {auction.image ? (
                    <img src={auction.image} alt={auction.name} className="object-cover w-full h-full group-hover:scale-105 transition-transform duration-500" />
                ) : (
                    <div className="absolute inset-0 flex items-center justify-center text-gray-400 bg-gray-200">
                        No Image
                    </div>
                )}
                <div className="absolute top-4 left-4 bg-luxury-gold text-white text-xs px-2 py-1 font-sans tracking-widest uppercase flex items-center gap-1">
                    <Clock size={12} /> Live Auction
                </div>
                <button className="absolute top-4 right-4 p-2 bg-white rounded-full shadow-sm hover:text-red-500 transition-colors">
                    <Heart size={16} />
                </button>
            </div>
            <div className="p-6">
                <div className="text-xs text-gray-500 uppercase tracking-widest mb-2">{auction.category}</div>
                <h3 className="font-serif text-lg font-medium mb-4">{auction.name}</h3>

                <div className="flex justify-between items-end border-t border-gray-100 pt-4">
                    <div>
                        <p className="text-xs text-gray-400 mb-1">Current Bid</p>
                        <p className="text-xl font-serif font-bold">${auction.currentBid.toLocaleString()}</p>
                    </div>
                    <div className="text-right">
                        <p className="text-xs text-gray-400 mb-1">Ends In</p>
                        <div className="text-sm font-semibold text-red-600 flex items-center justify-end">
                            {timerComponents.length ? timerComponents : <span>Closed</span>}
                        </div>
                    </div>
                </div>
                <button className="w-full mt-4 bg-black text-white py-2 text-sm uppercase tracking-widest hover:bg-luxury-gold transition-colors">
                    Place Bid
                </button>
            </div>
        </div>
    );
};

export default AuctionCard;
