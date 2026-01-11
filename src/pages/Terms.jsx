import React from 'react';

const Terms = () => {
    return (
        <div className="min-h-screen bg-white text-black py-12 px-6 md:px-12 lg:px-24 max-w-5xl mx-auto">
            {/* Header */}
            <div className="mb-12 border-b border-gray-200 pb-8">
                <h1 className="text-4xl md:text-5xl font-serif font-bold mb-4">Terms & Conditions</h1>
                <p className="text-gray-500 font-sans">Effective Date: 31st December 2025</p>
                <div className="w-20 h-1 bg-luxury-gold mt-6"></div>
            </div>

            {/* Introduction */}
            <div className="mb-10 font-sans text-gray-700 leading-relaxed">
                <p className="mb-4">
                    Welcome to <strong>The Collectors’ Exchange</strong> (“The Collectors’ Exchange”). These Terms & Conditions (“Terms”) govern your access to and use of our website, marketplace, applications, seller dashboards, and related services (collectively, the “Platform”).
                </p>
                <p>
                    By accessing or using the Platform, you agree to be bound by these Terms. If you do not agree, you must not use the Platform.
                </p>
            </div>

            {/* Sections */}
            <div className="space-y-10 font-sans text-gray-800">
                <section>
                    <h2 className="text-2xl font-serif font-semibold mb-4 text-black">1. Nature of the Platform</h2>
                    <p className="mb-3 text-gray-700">The Collectors’ Exchange operates as a curated pre-owned marketplace for collectibles, antiques, timepieces, footwear, toys, cultural artefacts, and related items.</p>
                    <p className="mb-2 text-gray-700">Items available on the Platform may be sold by:</p>
                    <ul className="list-disc pl-5 space-y-1 text-gray-700 mb-3">
                        <li>The Collectors’ Exchange as a direct seller</li>
                        <li>Individual sellers (private collectors)</li>
                        <li>Creators and brands offering limited editions, archives, or secondary market listings</li>
                    </ul>
                    <p className="text-gray-700">All transactions conducted on the Platform are subject to these Terms.</p>
                </section>

                <section>
                    <h2 className="text-2xl font-serif font-semibold mb-4 text-black">2. Eligibility</h2>
                    <p className="text-gray-700">Users must be at least 18 years of age to access or use the Platform. By registering or transacting, users confirm they are legally capable of entering into binding contracts.</p>
                </section>

                <section>
                    <h2 className="text-2xl font-serif font-semibold mb-4 text-black">3. Seller Categories & Responsibilities</h2>

                    <div className="mb-6">
                        <h3 className="text-xl font-medium mb-2">3.1 Individual Sellers</h3>
                        <p className="mb-2 text-gray-700">Individual sellers may list pre-owned items they legally own or are authorized to sell. Sellers must provide truthful, complete, and accurate information regarding:</p>
                        <ul className="list-disc pl-5 space-y-1 text-gray-700">
                            <li>Ownership and right to sell</li>
                            <li>Item condition</li>
                            <li>Provenance and supporting documentation</li>
                        </ul>
                    </div>

                    <div className="mb-6">
                        <h3 className="text-xl font-medium mb-2">3.2 Creators & Brands</h3>
                        <p className="text-gray-700">Creators and brands may list limited editions, archived works, or secondary market items. Intellectual property rights remain with the creators or brands, subject to licenses granted to The Collectors’ Exchange for listing, display, and marketing.</p>
                    </div>

                    <div>
                        <h3 className="text-xl font-medium mb-2">3.3 Marketplace-Owned Listings</h3>
                        <p className="text-gray-700">Items sold directly by The Collectors’ Exchange are owned or consigned by the marketplace and are subject to the same authentication and quality standards.</p>
                    </div>
                </section>

                <section>
                    <h2 className="text-2xl font-serif font-semibold mb-4 text-black">4. Authentication & Quality Verification</h2>

                    <div className="mb-6">
                        <h3 className="text-xl font-medium mb-2">4.1 Authentication</h3>
                        <p className="mb-2 text-gray-700">All items listed on the Platform are subject to an authentication process conducted or overseen by The Collectors’ Exchange. Authentication may include:</p>
                        <ul className="list-disc pl-5 space-y-1 text-gray-700 mb-3">
                            <li>Expert review</li>
                            <li>Documentation verification</li>
                            <li>Serial number or material checks</li>
                            <li>Third-party authentication partners where applicable</li>
                        </ul>
                        <p className="mb-2 text-gray-700">Items that successfully pass authentication may receive a Verified Authenticity Mark.</p>
                        <p className="text-gray-700 italic">Authentication reflects a professional opinion at the time of inspection based on available information. Absolute certainty cannot be guaranteed.</p>
                    </div>

                    <div>
                        <h3 className="text-xl font-medium mb-2">4.2 Quality & Condition Checks</h3>
                        <p className="text-gray-700 mb-2">Items undergo quality and condition assessments and are assigned condition grades disclosed to buyers.</p>
                        <p className="text-gray-700">Normal wear consistent with age and use does not constitute a defect unless expressly stated.</p>
                    </div>
                </section>

                <section>
                    <h2 className="text-2xl font-serif font-semibold mb-4 text-black">5. Buyer Responsibilities</h2>
                    <p className="text-gray-700 mb-2">Buyers are responsible for:</p>
                    <ul className="list-disc pl-5 space-y-1 text-gray-700 mb-3">
                        <li>Reviewing item descriptions, condition reports, and images</li>
                        <li>Understanding items are pre-owned unless explicitly stated otherwise</li>
                        <li>Seeking clarification prior to purchase where necessary</li>
                    </ul>
                    <p className="text-gray-700">Purchases constitute binding agreements.</p>
                </section>

                <section>
                    <h2 className="text-2xl font-serif font-semibold mb-4 text-black">6. Pricing, Payments & Fees</h2>
                    <ul className="list-disc pl-5 space-y-2 text-gray-700">
                        <li>Prices are determined by sellers or by The Collectors’ Exchange for marketplace-owned items.</li>
                        <li>Payments must be completed through approved methods.</li>
                        <li>Taxes, duties, and applicable fees may be added at checkout.</li>
                        <li>Seller commissions and payout terms are governed by separate agreements or published schedules.</li>
                    </ul>
                </section>

                <section>
                    <h2 className="text-2xl font-serif font-semibold mb-4 text-black">7. Shipping, Delivery & Risk</h2>
                    <ul className="list-disc pl-5 space-y-2 text-gray-700">
                        <li>Shipping methods, timelines, and insurance terms are disclosed at checkout.</li>
                        <li>Risk of loss transfers to the buyer upon confirmed delivery, unless otherwise required by law.</li>
                        <li>International shipments may be subject to customs duties and delays beyond platform control.</li>
                    </ul>
                </section>

                <section>
                    <h2 className="text-2xl font-serif font-semibold mb-4 text-black">8. Returns, Refunds & Disputes</h2>
                    <ul className="list-disc pl-5 space-y-2 text-gray-700">
                        <li>Returns and refunds are governed by the Returns & Authenticity Dispute Policy, incorporated by reference.</li>
                        <li>In cases of verified inauthenticity or misrepresentation, remedies may include refunds, returns, or account actions.</li>
                    </ul>
                </section>

                <section>
                    <h2 className="text-2xl font-serif font-semibold mb-4 text-black">9. Intellectual Property</h2>
                    <p className="text-gray-700 mb-3">All Platform content, including trademarks, logos, text, images, verification marks, and proprietary processes, is owned by or licensed to The Collectors’ Exchange.</p>
                    <p className="text-gray-700 mb-2">Users must not:</p>
                    <ul className="list-disc pl-5 space-y-1 text-gray-700">
                        <li>Copy or reproduce Platform content</li>
                        <li>Misrepresent affiliation with The Collectors’ Exchange</li>
                        <li>Use the Verified Authenticity Mark without authorization</li>
                    </ul>
                </section>

                <section>
                    <h2 className="text-2xl font-serif font-semibold mb-4 text-black">10. Prohibited Conduct</h2>
                    <p className="text-gray-700 mb-2">Users must not:</p>
                    <ul className="list-disc pl-5 space-y-1 text-gray-700 mb-3">
                        <li>List counterfeit or stolen items</li>
                        <li>Provide false or misleading information</li>
                        <li>Infringe intellectual property rights</li>
                        <li>Manipulate transactions or pricing</li>
                        <li>Engage in fraudulent, abusive, or unlawful conduct</li>
                    </ul>
                    <p className="text-gray-700">Accounts violating these rules may be suspended or terminated.</p>
                </section>

                <section>
                    <h2 className="text-2xl font-serif font-semibold mb-4 text-black">11. Account Suspension & Termination</h2>
                    <p className="text-gray-700 mb-2">The Collectors’ Exchange may suspend or terminate access where:</p>
                    <ul className="list-disc pl-5 space-y-1 text-gray-700 mb-3">
                        <li>These Terms are breached</li>
                        <li>Fraud or misrepresentation is suspected</li>
                        <li>Legal or regulatory compliance requires action</li>
                    </ul>
                    <p className="text-gray-700">Termination does not relieve obligations incurred prior to termination.</p>
                </section>

                <section>
                    <h2 className="text-2xl font-serif font-semibold mb-4 text-black">12. Limitation of Liability</h2>
                    <p className="text-gray-700 mb-2">To the maximum extent permitted by law:</p>
                    <ul className="list-disc pl-5 space-y-1 text-gray-700 mb-3">
                        <li>The Collectors’ Exchange is not liable for indirect or consequential damages</li>
                        <li>Total liability shall not exceed the amount paid for the item in dispute</li>
                    </ul>
                    <p className="text-gray-700">Nothing limits liability where prohibited by law.</p>
                </section>

                <section>
                    <h2 className="text-2xl font-serif font-semibold mb-4 text-black">13. Indemnification</h2>
                    <p className="text-gray-700 mb-2">Users agree to indemnify and hold harmless The Collectors’ Exchange from claims arising from:</p>
                    <ul className="list-disc pl-5 space-y-1 text-gray-700">
                        <li>Breach of these Terms</li>
                        <li>Item misrepresentation</li>
                        <li>Violation of laws or third-party rights</li>
                    </ul>
                </section>

                <section>
                    <h2 className="text-2xl font-serif font-semibold mb-4 text-black">14. Governing Law & Jurisdiction</h2>
                    <ul className="list-disc pl-5 space-y-2 text-gray-700">
                        <li>These Terms are governed by the laws of India.</li>
                        <li>Courts located in [Insert City/State] shall have exclusive jurisdiction.</li>
                    </ul>
                </section>

                <section>
                    <h2 className="text-2xl font-serif font-semibold mb-4 text-black">15. Changes to Terms</h2>
                    <p className="text-gray-700">Terms may be updated periodically. Changes will be posted with an updated effective date. Continued use constitutes acceptance of revised Terms.</p>
                </section>

                <section>
                    <h2 className="text-2xl font-serif font-semibold mb-4 text-black">16. Contact Information</h2>
                    <p className="text-gray-700">For questions regarding these Terms, contact:</p>
                    <p className="text-gray-700 font-medium">Email: <a href="mailto:support@collectorsexchange.com" className="hover:text-luxury-gold transition-colors">support@collectorsexchange.com</a></p>
                </section>
            </div>
        </div>
    );
};

export default Terms;
