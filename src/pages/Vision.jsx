import React from 'react';

const Vision = () => {
    return (
        <div className="container mx-auto py-20 px-6">
            <div className="max-w-4xl mx-auto text-center mb-16">
                <h1 className="text-5xl font-serif mb-8">Our Vision</h1>
                <p className="text-2xl font-serif text-luxury-gold italic mb-8">
                    "To be the global standard for trust in the exchange of value."
                </p>
                <p className="text-gray-600 leading-relaxed text-lg font-light">
                    We envision a world where the history and story behind every object is preserved as carefully as the object itself. We are building the infrastructure for the next generation of collecting, where digital verification meets physical rarity.
                </p>
            </div>

            <div className="grid md:grid-cols-2 gap-12 max-w-5xl mx-auto">
                <div className="border-t border-luxury-gold pt-8">
                    <h3 className="text-2xl font-serif mb-4">For Collectors</h3>
                    <p className="text-gray-600 font-light">
                        We strive to provide a sanctuary where you can pursue your passions without fear of fraud or misrepresentation.
                    </p>
                </div>
                <div className="border-t border-luxury-gold pt-8">
                    <h3 className="text-2xl font-serif mb-4">For Brands & Creators</h3>
                    <p className="text-gray-600 font-light">
                        We are committed to protecting intellectual property and ensuring that the secondary market honors the original creators.
                    </p>
                </div>
            </div>
        </div>
    );
};

export default Vision;
