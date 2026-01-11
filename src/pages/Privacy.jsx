import React from 'react';

const Privacy = () => {
    return (
        <div className="min-h-screen bg-white text-black py-12 px-6 md:px-12 lg:px-24 max-w-5xl mx-auto">
            {/* Header */}
            <div className="mb-12 border-b border-gray-200 pb-8">
                <h1 className="text-4xl md:text-5xl font-serif font-bold mb-4">Privacy Policy</h1>
                <p className="text-gray-500 font-sans">Effective Date: December 31, 2025</p>
                <div className="w-20 h-1 bg-luxury-gold mt-6"></div>
            </div>

            {/* Introduction */}
            <div className="mb-10 font-sans text-gray-700 leading-relaxed">
                <p className="mb-4">
                    This Privacy Policy explains how <strong>The Collectors’ Exchange</strong> collects, uses, discloses, and safeguards Personal Data in connection with its marketplace services, websites, mobile applications, seller dashboards, and related support services.
                </p>
                <p>
                    By using the Services, users agree to this Policy. Users who do not agree must discontinue use of the Services.
                </p>
            </div>

            {/* Sections */}
            <div className="space-y-10 font-sans text-gray-800">
                <section>
                    <h2 className="text-2xl font-serif font-semibold mb-4 text-black">1. Controller & Contact</h2>
                    <ul className="list-disc pl-5 space-y-2 text-gray-700">
                        <li><strong>Data Controller:</strong> The Collectors’ Exchange</li>
                        <li><strong>Contact Email:</strong> <a href="mailto:privacy@collectorsexchange.com" className="hover:text-luxury-gold transition-colors">privacy@collectorsexchange.com</a></li>
                        <li>Privacy rights requests are addressed in Section 11.</li>
                    </ul>
                </section>

                <section>
                    <h2 className="text-2xl font-serif font-semibold mb-4 text-black">2. Scope & Applicability</h2>
                    <p className="mb-2 text-gray-700">This Policy applies to:</p>
                    <ul className="list-disc pl-5 space-y-2 text-gray-700">
                        <li>Website and app visitors</li>
                        <li>Buyers and prospective buyers</li>
                        <li>Individual and company sellers</li>
                        <li>Marketing, support, and authentication service users</li>
                    </ul>
                    <p className="mt-2 text-gray-700 text-sm italic">Separate written agreements with business customers may supplement this Policy.</p>
                </section>

                <section>
                    <h2 className="text-2xl font-serif font-semibold mb-4 text-black">3. Information We Collect</h2>

                    <div className="mb-6">
                        <h3 className="text-xl font-medium mb-2">A. Personal Data You Provide</h3>
                        <ul className="list-disc pl-5 space-y-1 text-gray-700">
                            <li>Account and contact details</li>
                            <li>Identity and verification documents including PAN and Aadhaar</li>
                            <li>Company registration and tax documentation</li>
                            <li>Payment and payout details (excluding full card numbers)</li>
                            <li>Product listings, provenance records, images, certificates</li>
                            <li>Communications with support and other users</li>
                            <li>Marketing preferences and consents</li>
                        </ul>
                    </div>

                    <div className="mb-6">
                        <h3 className="text-xl font-medium mb-2">B. Technical & Usage Data</h3>
                        <ul className="list-disc pl-5 space-y-1 text-gray-700">
                            <li>IP address</li>
                            <li>Device and browser information</li>
                            <li>Operating system</li>
                            <li>Interaction and usage analytics</li>
                            <li>Cookies and similar technologies</li>
                        </ul>
                    </div>

                    <div className="mb-6">
                        <h3 className="text-xl font-medium mb-2">C. Third-Party and Public Sources</h3>
                        <ul className="list-disc pl-5 space-y-1 text-gray-700">
                            <li>Authentication partners</li>
                            <li>Public registers and auction records</li>
                            <li>Linked social profiles</li>
                            <li>Fraud and identity verification providers</li>
                        </ul>
                    </div>

                    <div>
                        <h3 className="text-xl font-medium mb-2">D. Sensitive Categories</h3>
                        <p className="text-gray-700">Sensitive personal data is not intentionally collected. Any such data provided inadvertently will be treated with enhanced care and deleted upon lawful request.</p>
                    </div>
                </section>

                <section>
                    <h2 className="text-2xl font-serif font-semibold mb-4 text-black">4. How We Use Personal Data</h2>
                    <p className="mb-2 text-gray-700">Personal Data is used for:</p>
                    <ul className="list-disc pl-5 space-y-1 text-gray-700">
                        <li>Platform operations and transactions</li>
                        <li>Authentication and provenance verification</li>
                        <li>Seller onboarding, KYC, AML, and compliance</li>
                        <li>Payment processing and payouts</li>
                        <li>Customer support and dispute resolution</li>
                        <li>Security, fraud prevention, and legal compliance</li>
                        <li>Marketing and personalization (with consent where required)</li>
                        <li>Analytics and business operations</li>
                    </ul>
                </section>

                <section>
                    <h2 className="text-2xl font-serif font-semibold mb-4 text-black">5. Legal Bases for Processing</h2>
                    <p className="mb-2 text-gray-700">Processing is based on:</p>
                    <ul className="list-disc pl-5 space-y-1 text-gray-700">
                        <li>Contractual necessity</li>
                        <li>Legal obligations</li>
                        <li>Legitimate interests</li>
                        <li>User consent where required</li>
                    </ul>
                </section>

                <section>
                    <h2 className="text-2xl font-serif font-semibold mb-4 text-black">6. Sharing & Disclosure</h2>
                    <p className="mb-2 text-gray-700">Personal Data may be shared with:</p>
                    <ul className="list-disc pl-5 space-y-1 text-gray-700">
                        <li>Service providers and processors</li>
                        <li>Authentication partners</li>
                        <li>Other users for transaction fulfillment</li>
                        <li>Legal and regulatory authorities</li>
                        <li>Successor entities in business transfers</li>
                        <li>Parties with user consent</li>
                    </ul>
                    <p className="mt-2 font-medium text-gray-800">Personal data is not sold for monetary consideration.</p>
                </section>

                <section>
                    <h2 className="text-2xl font-serif font-semibold mb-4 text-black">7. Authentication & the Verified Mark</h2>
                    <ul className="list-disc pl-5 space-y-2 text-gray-700">
                        <li>Verified Authenticity Mark is applied only after verification.</li>
                        <li>Verification may be internal or via partners.</li>
                        <li>Sellers warrant accuracy and lawful ownership.</li>
                        <li>Verification reflects available evidence at time of inspection.</li>
                        <li>Remedies for proven inauthenticity follow established dispute procedures.</li>
                        <li>Verified Mark usage is restricted to The Collectors’ Exchange.</li>
                    </ul>
                </section>

                <section>
                    <h2 className="text-2xl font-serif font-semibold mb-4 text-black">8. Data Retention</h2>
                    <ul className="list-disc pl-5 space-y-2 text-gray-700">
                        <li>Data retained only as long as legally and operationally required.</li>
                        <li>Typical retention up to seven years for tax and accounting.</li>
                        <li>Data may be deleted or anonymized upon account closure.</li>
                        <li>Data export available where feasible.</li>
                    </ul>
                </section>

                <section>
                    <h2 className="text-2xl font-serif font-semibold mb-4 text-black">9. Security</h2>
                    <p className="text-gray-700">Reasonable technical, administrative, and physical safeguards are implemented, including encryption, access controls, monitoring, and training.</p>
                    <p className="text-gray-700 mt-2">Breach notifications will be provided where legally required.</p>
                </section>

                <section>
                    <h2 className="text-2xl font-serif font-semibold mb-4 text-black">10. International Transfers</h2>
                    <p className="text-gray-700">Personal Data may be transferred internationally with appropriate safeguards such as contractual protections and lawful transfer mechanisms.</p>
                </section>

                <section>
                    <h2 className="text-2xl font-serif font-semibold mb-4 text-black">11. Your Rights & Choices</h2>
                    <p className="mb-2 text-gray-700">Users may have rights to:</p>
                    <ul className="list-disc pl-5 space-y-1 text-gray-700 grid md:grid-cols-2 gap-2">
                        <li>Access</li>
                        <li>Correction</li>
                        <li>Deletion</li>
                        <li>Restriction or objection</li>
                        <li>Data portability</li>
                        <li>Consent withdrawal</li>
                        <li>Marketing opt-out</li>
                        <li>Regulatory complaint</li>
                    </ul>
                    <p className="mt-2 text-gray-700">Requests require identity verification and are handled per applicable law.</p>
                </section>

                <section>
                    <h2 className="text-2xl font-serif font-semibold mb-4 text-black">12. Cookies & Tracking Technologies</h2>
                    <p className="text-gray-700">Cookies and similar technologies are used for functionality, security, analytics, and personalization.</p>
                    <p className="text-gray-700 mt-1">Users may manage cookies through browser or consent tools.</p>
                </section>

                <section>
                    <h2 className="text-2xl font-serif font-semibold mb-4 text-black">13. Marketing Communications</h2>
                    <p className="text-gray-700">Marketing communications are sent only where permitted.</p>
                    <p className="text-gray-700 mt-1">Users may unsubscribe at any time.</p>
                </section>

                <section>
                    <h2 className="text-2xl font-serif font-semibold mb-4 text-black">14. Minors</h2>
                    <p className="text-gray-700">Services are not intended for individuals under 18 years of age.</p>
                    <p className="text-gray-700 mt-1">Data collected from minors without consent will be deleted.</p>
                </section>

                <section>
                    <h2 className="text-2xl font-serif font-semibold mb-4 text-black">15. Third-Party Links & Content</h2>
                    <p className="text-gray-700">The Collectors’ Exchange is not responsible for third-party privacy practices. Users should review third-party policies independently.</p>
                </section>

                <section>
                    <h2 className="text-2xl font-serif font-semibold mb-4 text-black">16. Seller Confidentiality & Business Data</h2>
                    <p className="text-gray-700">Seller commercial data is treated as confidential and disclosed only when necessary for transactions, legal compliance, or with permission.</p>
                </section>

                <section>
                    <h2 className="text-2xl font-serif font-semibold mb-4 text-black">17. Intellectual Property & Brand Safety</h2>
                    <p className="text-gray-700">Trademark and intellectual property misuse is prohibited.</p>
                    <p className="text-gray-700 mt-1">Infringing listings may be removed and accounts suspended.</p>
                </section>

                <section>
                    <h2 className="text-2xl font-serif font-semibold mb-4 text-black">18. Changes to This Policy</h2>
                    <p className="text-gray-700">Material changes will be communicated and the effective date updated. Continued use constitutes acceptance.</p>
                </section>

                <section>
                    <h2 className="text-2xl font-serif font-semibold mb-4 text-black">19. Dispute Resolution & Governing Law</h2>
                    <p className="text-gray-700">Disputes are governed by the Terms of Service and applicable law.</p>
                </section>

                <section>
                    <h2 className="text-2xl font-serif font-semibold mb-4 text-black">20. How to Contact Us</h2>
                    <p className="text-gray-700">Privacy inquiries:</p>
                    <p className="text-gray-700 font-medium">Email: <a href="mailto:privacy@collectorsexchange.com" className="hover:text-luxury-gold transition-colors">privacy@collectorsexchange.com</a></p>
                </section>
            </div>

            {/* Footer Note */}
            <div className="mt-20 pt-8 border-t border-gray-200 text-center">
                <p className="font-serif italic text-gray-500 text-lg">
                    "Trust, confidentiality, and verified authenticity form the foundation of The Collectors’ Exchange."
                </p>
            </div>
        </div>
    );
};

export default Privacy;
