import React from 'react';
import SEO, { PageSchema, BreadcrumbSchema } from '../components/SEO';
import { Reveal } from '../components/Motion';
import { openConsentPreferences } from '../utils/consent';

const PRIVACY_TITLE = 'Privacy Policy';
const PRIVACY_DESC =
  'Read the Privacy & Discretion Policy of The Collectors Exchange. Learn how we protect your data and ensure secure transactions.';

const Privacy = () => {
  return (
    <div className="min-h-screen bg-white text-black py-8 sm:py-12 px-6 md:px-12 lg:px-24 max-w-5xl mx-auto">
      <SEO title={PRIVACY_TITLE} description={PRIVACY_DESC} canonical="/privacy" />
      <PageSchema type="WebPage" name={PRIVACY_TITLE} description={PRIVACY_DESC} path="/privacy" />
      <BreadcrumbSchema
        items={[
          { name: 'Home', url: '/' },
          { name: 'Privacy Policy', url: '/privacy' },
        ]}
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

          <p className="mb-2 font-medium text-black">Nothing Loads Until You Say Yes:</p>
          <p className="mb-3 text-gray-700">
            Beyond the cookies this site needs to function (your cart, your session, your saved
            preferences), we use two measurement tools — and neither one is loaded until you have
            explicitly accepted them on the consent banner. Before you choose, and if you choose
            Reject, no request is made to Google or Meta at all and nothing about your visit is sent
            to them.
          </p>

          <p className="mb-2 font-medium text-black">If You Accept, These Two Run:</p>
          <ul className="space-y-3 text-gray-700 mb-3">
            <li className="flex items-start gap-3">
              <span className="text-luxury-gold mt-1.5 font-bold" aria-hidden="true">
                •
              </span>
              <div>
                <span className="font-medium text-black">Google Analytics 4:</span>
                <span className="block text-gray-600">
                  {' '}
                  Loads scripts from googletagmanager.com and sets <code>_ga</code> cookies. It
                  records which pages of this site you open, and sends Google the standard technical
                  details that come with any web request — your IP address (from which Google
                  derives an approximate location), your browser and device, and the page that
                  referred you. We use it to see which pages are worth keeping.
                </span>
              </div>
            </li>
            <li className="flex items-start gap-3">
              <span className="text-luxury-gold mt-1.5 font-bold" aria-hidden="true">
                •
              </span>
              <div>
                <span className="font-medium text-black">Meta (Facebook) Pixel:</span>
                <span className="block text-gray-600">
                  {' '}
                  Loads a script from connect.facebook.net and sets <code>_fbp</code> cookies. It
                  reports your page views on this site to Meta, along with the same standard request
                  details. Meta can link that activity to your Facebook or Instagram account, and it
                  is what lets us measure and target advertising. This is genuinely third-party
                  tracking, which is exactly why we ask first.
                </span>
              </div>
            </li>
          </ul>

          <p className="mb-2 font-medium text-black">Changing Your Mind:</p>
          <p className="mb-3 text-gray-700">
            Your answer is stored only in your own browser (local storage, under{' '}
            <code>tce_consent_v1</code>) — we keep no server-side record of it, so clearing your
            browser data simply means we ask again. Use{' '}
            <button
              type="button"
              onClick={openConsentPreferences}
              className="font-medium text-black underline decoration-luxury-gold underline-offset-4 transition-colors duration-300 hover:text-luxury-gold"
            >
              Cookie preferences
            </button>{' '}
            here, or the same link in the site footer, to reopen the banner at any time. Choosing
            Reject stops both tools immediately — no page reload needed — and we clear the{' '}
            <code>_ga</code> and <code>_fb</code> cookies your browser will let us reach. Cookies
            already set by Google or Meta on their own domains are theirs to expire; you can remove
            them through your browser's site-data settings.
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
      <Reveal className="mt-12 sm:mt-16 p-6 sm:p-8 bg-heritage-cream border border-luxury-gold/20 rounded-2xl">
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
