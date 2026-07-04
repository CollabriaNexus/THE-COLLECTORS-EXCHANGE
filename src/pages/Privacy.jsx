import React from 'react';
import SEO from '../components/SEO';
import { Reveal } from '../components/Motion';

const Privacy = () => {
  return (
    <div className="min-h-screen bg-white text-black py-8 sm:py-12 px-6 md:px-12 lg:px-24 max-w-5xl mx-auto">
      <SEO
        title="Privacy Policy"
        description="Read the Privacy & Discretion Policy of The Collectors Exchange. Learn how we protect your data and ensure secure transactions."
        canonical="/privacy"
      />
      {/* Header */}
      <Reveal className="mb-12 border-b border-gray-200 pb-8">
        <h1 className="text-3xl sm:text-4xl md:text-5xl font-serif font-bold mb-4">
          THE COLLECTORS EXCHANGE: PRIVACY & DISCRETION POLICY
        </h1>
        <p className="text-gray-500 font-sans italic">The Custodian's Data Protection</p>
        <p className="text-gray-500 font-sans">Last Updated: April 2026</p>
        <div className="w-20 h-1 bg-luxury-gold mt-6"></div>
      </Reveal>

      {/* Introduction */}
      <Reveal className="mb-10 font-sans text-gray-700 leading-relaxed">
        <p className="text-lg font-serif text-black italic">
          At The Collectors Exchange, we believe that privacy is a cornerstone of trust. We are not
          a data-driven "innovation" company; we are a heritage-driven business. We do not "mine"
          your life for insights; we only collect what is necessary to ensure the "Truth" of our
          exchange.
        </p>
      </Reveal>

      {/* Sections */}
      <div className="space-y-10 font-sans text-gray-800">
        <Reveal as="section" delay={60} distance={40}>
          <h2 className="text-2xl font-serif font-semibold mb-4 text-black">
            1. Our Stance on Data (The Anti-Startup Rule)
          </h2>
          <p className="text-gray-700">
            We reject the modern practice of treating customers as data points. We do not sell,
            rent, or trade your personal information to third-party advertisers or "big tech"
            aggregators. Doing so would be "cheap" behavior that contradicts our ancestral business
            values.
          </p>
        </Reveal>

        <Reveal as="section" delay={60} distance={40}>
          <h2 className="text-2xl font-serif font-semibold mb-4 text-black">
            2. What We Collect (The Custodian Identity)
          </h2>
          <p className="mb-3 text-gray-700">
            To facilitate the transfer of heritage, we collect only the essentials:
          </p>
          <ul className="space-y-3 text-gray-700 mb-3">
            <li className="flex items-start gap-3">
              <span className="text-luxury-gold mt-1.5 font-bold" aria-hidden="true">
                •
              </span>
              <div>
                <span className="font-medium text-black">Contact Information:</span>
                <span className="block text-gray-600">
                  {' '}
                  Your name, delivery address, and digital coordinates (email/phone). This is
                  required to bring history to your doorstep.
                </span>
              </div>
            </li>
            <li className="flex items-start gap-3">
              <span className="text-luxury-gold mt-1.5 font-bold" aria-hidden="true">
                •
              </span>
              <div>
                <span className="font-medium text-black">Historical Interests:</span>
                <span className="block text-gray-600">
                  {' '}
                  We may note the categories you value (e.g., Timepieces, Sneakers, or Antiques) so
                  we can alert you when we find a "needle in a haystack" that fits your collection.
                </span>
              </div>
            </li>
            <li className="flex items-start gap-3">
              <span className="text-luxury-gold mt-1.5 font-bold" aria-hidden="true">
                •
              </span>
              <div>
                <span className="font-medium text-black">Transaction History:</span>
                <span className="block text-gray-600">
                  {' '}
                  A record of the articles you have rescued. This is not for marketing; it is for
                  the Registry of History.
                </span>
              </div>
            </li>
          </ul>
        </Reveal>

        <Reveal as="section" delay={60} distance={40}>
          <h2 className="text-2xl font-serif font-semibold mb-4 text-black">
            3. The "Registry of History" & Annual Health Checks
          </h2>
          <p className="mb-3 text-gray-700">
            Unique to our mission, we maintain a registry of every historic article we sell.
          </p>
          <p className="mb-2 font-medium text-black">Purpose:</p>
          <p className="mb-3 text-gray-700">
            We keep your contact information linked to the specific article so we can perform our
            Annual Health Checks.
          </p>
          <p className="mb-2 font-medium text-black">The Goal:</p>
          <p className="text-gray-700">
            If a rare part for your 100-year-old timepiece becomes available, or if we have updated
            information on the provenance of your antique, we need to know how to find you. You are
            the custodian; we are the record-keepers.
          </p>
        </Reveal>

        <Reveal as="section" delay={60} distance={40}>
          <h2 className="text-2xl font-serif font-semibold mb-4 text-black">
            4. Digital Discretion (Cookies & Tracking)
          </h2>
          <p className="mb-3 text-gray-700">
            While we use a digital platform to reach "netizens," we keep our digital footprint lean.
          </p>
          <p className="mb-2 font-medium text-black">Minimal Tracking:</p>
          <p className="mb-3 text-gray-700">
            We use only essential cookies required for the website to function. We do not use
            invasive "pixel" tracking to follow you across the internet.
          </p>
          <p className="mb-2 font-medium text-black">Payment Security:</p>
          <p className="text-gray-700">
            We use high-integrity, encrypted payment gateways. We never see and therefore never
            store your credit card numbers or bank credentials. That is a responsibility we leave to
            the financial "doctors."
          </p>
        </Reveal>

        <Reveal as="section" delay={60} distance={40}>
          <h2 className="text-2xl font-serif font-semibold mb-4 text-black">
            5. Third-Party "Necessities"
          </h2>
          <p className="mb-3 text-gray-700">
            The only time your data leaves our vault is when it is a mechanical necessity:
          </p>
          <ul className="space-y-2 text-gray-700 mb-3">
            <li className="flex items-start gap-3">
              <span className="text-luxury-gold mt-1.5" aria-hidden="true">
                •
              </span>
              <span>
                <span className="font-medium">Logistics:</span> Sharing your address with our
                trusted couriers to ensure the "hustle" ends at your doorstep.
              </span>
            </li>
            <li className="flex items-start gap-3">
              <span className="text-luxury-gold mt-1.5" aria-hidden="true">
                •
              </span>
              <span>
                <span className="font-medium">Legal Compliance:</span> Should the laws of India
                require us to disclose information regarding a specific historic artifact, we will
                comply with the integrity our responsibility demands.
              </span>
            </li>
          </ul>
        </Reveal>

        <Reveal as="section" delay={60} distance={40}>
          <h2 className="text-2xl font-serif font-semibold mb-4 text-black">
            6. Your Rights (The "Handshake" Agreement)
          </h2>
          <p className="mb-3 text-gray-700">
            In the spirit of a pure business, you have total control:
          </p>
          <ul className="space-y-3 text-gray-700 mb-3">
            <li className="flex items-start gap-3">
              <span className="text-luxury-gold mt-1.5 font-bold" aria-hidden="true">
                •
              </span>
              <div>
                <span className="font-medium text-black">The Right to Fade:</span>
                <span className="block text-gray-600">
                  {' '}
                  If you decide to pass your collection to another custodian or simply wish to be
                  removed from our registry, tell us. We will delete your personal data, though the
                  Item's History will remain in our archives (without your name attached).
                </span>
              </div>
            </li>
            <li className="flex items-start gap-3">
              <span className="text-luxury-gold mt-1.5 font-bold" aria-hidden="true">
                •
              </span>
              <div>
                <span className="font-medium text-black">Access:</span>
                <span className="block text-gray-600">
                  {' '}
                  You can ask us at any time what information we hold. We will tell you the truth,
                  without the "startup" jargon.
                </span>
              </div>
            </li>
          </ul>
        </Reveal>

        <Reveal as="section" delay={60} distance={40}>
          <h2 className="text-2xl font-serif font-semibold mb-4 text-black">
            7. Security (The Vault)
          </h2>
          <p className="text-gray-700">
            We protect your data with the same seriousness as we protect a limited-edition
            timepiece. Our digital "vaults" are monitored and encrypted to prevent unauthorized
            access by those who do not value heritage as we do.
          </p>
        </Reveal>
      </div>

      {/* Founder's Closing Note */}
      <Reveal className="mt-12 sm:mt-16 p-6 sm:p-8 bg-heritage-cream border border-luxury-gold/20 rounded-sm">
        <h3 className="text-sm font-bold uppercase tracking-widest text-luxury-gold mb-4">
          Founder's Closing Note
        </h3>
        <p className="font-serif italic text-lg text-heritage-charcoal leading-relaxed">
          "A man's collection and his business dealings should be his own. We keep your data private
          because that is how a business of integrity operates. We are here to keep history alive,
          not to sell your habits to the highest bidder."
        </p>
        <p className="font-serif text-lg text-heritage-charcoal mt-4">
          Welcome to the Exchange. Your secrets are safe with us.
        </p>
      </Reveal>
    </div>
  );
};

export default Privacy;
