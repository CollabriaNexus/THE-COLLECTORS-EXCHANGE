import React from 'react';

const About = () => {
    return (
        <div className="flex flex-col">
            <section className="py-20 px-6 bg-black text-white text-center">
                <div className="container mx-auto max-w-3xl">
                    <h1 className="text-5xl font-serif mb-8">About The Collectors Exchange</h1>
                    <p className="text-gray-400 text-lg leading-relaxed">
                        Born from a passion for preserving history and celebrating craftsmanship, we are the premier destination for serious collectors.
                    </p>
                </div>
            </section>

            <section className="py-20 px-6 bg-white">
                <div className="container mx-auto max-w-4xl grid md:grid-cols-2 gap-12 items-center">
                    <div>
                        <h2 className="text-3xl font-serif mb-6">Our Story</h2>
                        <p className="text-gray-600 mb-4 leading-relaxed font-light">
                            Founded in 2024, The Collectors Exchange was created to solve a singular problem: the lack of trust in the online collectibles market. We saw a gap where transparency and luxury should meet.
                        </p>
                        <p className="text-gray-600 leading-relaxed font-light">
                            Today, we connect thousands of verified sellers with connoisseurs across the globe, facilitating the exchange of everything from rare numismatics to vintage timepieces.
                        </p>
                    </div>
                    <div className="bg-gray-100 h-96 w-full flex items-center justify-center text-gray-400">
                        [Image Placeholder: Founders or Office]
                    </div>
                </div>
            </section>

            <section className="py-20 px-6 bg-secondary-bg text-center">
                <div className="container mx-auto max-w-4xl">
                    <h2 className="text-3xl font-serif mb-12">Our Core Values</h2>
                    <div className="grid md:grid-cols-3 gap-8">
                        <div className="bg-white p-8 shadow-sm">
                            <h3 className="font-serif text-xl mb-4 text-luxury-gold">Authenticity</h3>
                            <p className="text-sm text-gray-500">Every item is verified. No exceptions.</p>
                        </div>
                        <div className="bg-white p-8 shadow-sm">
                            <h3 className="font-serif text-xl mb-4 text-luxury-gold">Transparency</h3>
                            <p className="text-sm text-gray-500">Clear provenance and seller identity.</p>
                        </div>
                        <div className="bg-white p-8 shadow-sm">
                            <h3 className="font-serif text-xl mb-4 text-luxury-gold">Excellence</h3>
                            <p className="text-sm text-gray-500">A premium experience for every transaction.</p>
                        </div>
                    </div>
                </div>
            </section>
        </div>
    );
};

export default About;
