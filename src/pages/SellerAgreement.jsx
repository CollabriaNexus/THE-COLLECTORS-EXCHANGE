import React from 'react';
import SEO from '../components/SEO';
import { Reveal } from '../components/Motion';

const SellerAgreement = () => {
  return (
    <div className="min-h-screen bg-white text-black py-8 sm:py-12 px-4 sm:px-6 md:px-12 lg:px-24 max-w-5xl mx-auto">
      <SEO
        title="Seller Agreement"
        description="Read the official Seller Agreement for listing items on The Collectors Exchange. Understand the terms, fees, and verification requirements for sellers."
        canonical="/seller-agreement"
      />

      {/* Header */}
      <Reveal className="mb-12 border-b border-gray-200 pb-8">
        <h1 className="text-4xl md:text-5xl font-serif font-bold mb-4">Seller Agreement</h1>
        <p className="text-gray-500 font-sans">Between Collectors Exchange and the Seller</p>
        <div className="w-20 h-1 bg-luxury-gold mt-6"></div>
      </Reveal>

      {/* Preamble */}
      <Reveal className="mb-10 font-sans text-gray-700 leading-relaxed">
        <p className="mb-4">
          This Seller Agreement is entered into between <strong>Collectors Exchange</strong>{' '}
          ("Platform," "we," "us," or "our") and the undersigned seller ("Seller," "you," or
          "your"). By registering, listing, or selling on the Platform, you agree to be bound by
          this Agreement.
        </p>
      </Reveal>

      {/* Sections */}
      <div className="space-y-10 font-sans text-gray-800">
        <Reveal as="section" delay={60} distance={40}>
          <h2 className="text-2xl font-serif font-semibold mb-4 text-black">
            1. Seller Categories
          </h2>
          <h3 className="text-lg font-serif font-medium mb-2 text-heritage-bronze">
            1.1 Individual Collectors
          </h3>
          <p className="mb-3 text-gray-700">
            Individual sellers may list and sell up to <strong>5 products at a time</strong> on the
            Platform, unless otherwise approved in writing by the Platform.
          </p>
          <h3 className="text-lg font-serif font-medium mb-2 text-heritage-bronze">
            1.2 Company-led Resellers
          </h3>
          <p className="text-gray-700">
            Registered business sellers, resellers, and commercial entities may list{' '}
            <strong>unlimited products</strong>, subject to Platform approval, policy compliance,
            and operational review.
          </p>
        </Reveal>

        <Reveal as="section" delay={60} distance={40}>
          <h2 className="text-2xl font-serif font-semibold mb-4 text-black">
            2. Verification Requirements
          </h2>
          <h3 className="text-lg font-serif font-medium mb-2 text-heritage-bronze">
            2.1 Individual Sellers
          </h3>
          <p className="mb-3 text-gray-700">
            All individual sellers must complete mandatory identity verification by submitting:
          </p>
          <ul className="space-y-1 text-gray-700 mb-4">
            <li className="flex items-start gap-3">
              <span className="text-luxury-gold mt-1.5" aria-hidden="true">
                •
              </span>
              <span>Aadhaar card</span>
            </li>
            <li className="flex items-start gap-3">
              <span className="text-luxury-gold mt-1.5" aria-hidden="true">
                •
              </span>
              <span>PAN card</span>
            </li>
          </ul>
          <h3 className="text-lg font-serif font-medium mb-2 text-heritage-bronze">
            2.2 Company-led Resellers
          </h3>
          <p className="mb-3 text-gray-700">All company-led resellers must submit:</p>
          <ul className="space-y-1 text-gray-700 mb-3">
            <li className="flex items-start gap-3">
              <span className="text-luxury-gold mt-1.5" aria-hidden="true">
                •
              </span>
              <span>GST registration certificate</span>
            </li>
            <li className="flex items-start gap-3">
              <span className="text-luxury-gold mt-1.5" aria-hidden="true">
                •
              </span>
              <span>
                Certificate of Incorporation / LLP registration / other applicable government-issued
                business registration proof
              </span>
            </li>
            <li className="flex items-start gap-3">
              <span className="text-luxury-gold mt-1.5" aria-hidden="true">
                •
              </span>
              <span>
                Any additional document reasonably requested by the Platform for verification
              </span>
            </li>
          </ul>
          <p className="text-gray-600 text-sm italic">
            The Platform may reject, suspend, or terminate any seller account if verification is
            incomplete, inaccurate, or unverifiable.
          </p>
        </Reveal>

        <Reveal as="section" delay={60} distance={40}>
          <h2 className="text-2xl font-serif font-semibold mb-4 text-black">
            3. Product Authenticity and Fraud Policy
          </h2>
          <p className="mb-3 text-gray-700">
            The Seller confirms that all products listed and sold on the Platform are:
          </p>
          <ul className="space-y-1 text-gray-700 mb-4">
            <li className="flex items-start gap-3">
              <span className="text-luxury-gold mt-1.5" aria-hidden="true">
                •
              </span>
              <span>genuine,</span>
            </li>
            <li className="flex items-start gap-3">
              <span className="text-luxury-gold mt-1.5" aria-hidden="true">
                •
              </span>
              <span>legally owned or authorized for sale,</span>
            </li>
            <li className="flex items-start gap-3">
              <span className="text-luxury-gold mt-1.5" aria-hidden="true">
                •
              </span>
              <span>accurately described, and</span>
            </li>
            <li className="flex items-start gap-3">
              <span className="text-luxury-gold mt-1.5" aria-hidden="true">
                •
              </span>
              <span>free from theft, fraud, duplication, or counterfeit risk.</span>
            </li>
          </ul>
          <p className="mb-3 text-gray-700">
            Any <strong>duplicate, fake, fraudulent, stolen, or misrepresented product</strong> will
            result in:
          </p>
          <ul className="space-y-1 text-gray-700 mb-3">
            <li className="flex items-start gap-3">
              <span className="text-luxury-gold mt-1.5" aria-hidden="true">
                •
              </span>
              <span>immediate removal of the listing,</span>
            </li>
            <li className="flex items-start gap-3">
              <span className="text-luxury-gold mt-1.5" aria-hidden="true">
                •
              </span>
              <span>withholding of pending payouts,</span>
            </li>
            <li className="flex items-start gap-3">
              <span className="text-luxury-gold mt-1.5" aria-hidden="true">
                •
              </span>
              <span>permanent account suspension or ban,</span>
            </li>
            <li className="flex items-start gap-3">
              <span className="text-luxury-gold mt-1.5" aria-hidden="true">
                •
              </span>
              <span>and the Seller is prohibited from selling again on the Platform.</span>
            </li>
          </ul>
          <p className="text-gray-600 text-sm">
            The Platform may also take legal action where required.
          </p>
        </Reveal>

        <Reveal as="section" delay={60} distance={40}>
          <h2 className="text-2xl font-serif font-semibold mb-4 text-black">4. Listing Rules</h2>
          <p className="mb-3 text-gray-700">The Seller agrees to:</p>
          <ul className="space-y-1 text-gray-700 mb-3">
            <li className="flex items-start gap-3">
              <span className="text-luxury-gold mt-1.5" aria-hidden="true">
                •
              </span>
              <span>List only products that the Seller legally owns or is authorized to sell,</span>
            </li>
            <li className="flex items-start gap-3">
              <span className="text-luxury-gold mt-1.5" aria-hidden="true">
                •
              </span>
              <span>Provide correct descriptions, images, condition, and pricing,</span>
            </li>
            <li className="flex items-start gap-3">
              <span className="text-luxury-gold mt-1.5" aria-hidden="true">
                •
              </span>
              <span>Update product status honestly,</span>
            </li>
            <li className="flex items-start gap-3">
              <span className="text-luxury-gold mt-1.5" aria-hidden="true">
                •
              </span>
              <span>And not manipulate product condition, origin, or authenticity.</span>
            </li>
          </ul>
        </Reveal>

        <Reveal as="section" delay={60} distance={40}>
          <h2 className="text-2xl font-serif font-semibold mb-4 text-black">5. Payments</h2>
          <p className="mb-3 text-gray-700">
            Payments to Sellers will be released{' '}
            <strong>after 7 days from confirmed delivery</strong> of the product to the buyer,
            subject to:
          </p>
          <ul className="space-y-1 text-gray-700 mb-3">
            <li className="flex items-start gap-3">
              <span className="text-luxury-gold mt-1.5" aria-hidden="true">
                •
              </span>
              <span>successful delivery,</span>
            </li>
            <li className="flex items-start gap-3">
              <span className="text-luxury-gold mt-1.5" aria-hidden="true">
                •
              </span>
              <span>no active dispute,</span>
            </li>
            <li className="flex items-start gap-3">
              <span className="text-luxury-gold mt-1.5" aria-hidden="true">
                •
              </span>
              <span>no return request,</span>
            </li>
            <li className="flex items-start gap-3">
              <span className="text-luxury-gold mt-1.5" aria-hidden="true">
                •
              </span>
              <span>no authenticity issue,</span>
            </li>
            <li className="flex items-start gap-3">
              <span className="text-luxury-gold mt-1.5" aria-hidden="true">
                •
              </span>
              <span>and completion of Platform checks.</span>
            </li>
          </ul>
          <p className="text-gray-600 text-sm">
            The Platform may deduct applicable fees, commissions, refunds, penalties, or withheld
            amounts before payout.
          </p>
        </Reveal>

        <Reveal as="section" delay={60} distance={40}>
          <h2 className="text-2xl font-serif font-semibold mb-4 text-black">
            6. Privacy and Discreet Seller Identity
          </h2>
          <p className="mb-3 text-gray-700">
            For <strong>individual sellers</strong>, the Platform will keep the seller's identity{' '}
            <strong>private and discreet</strong> for buyer-facing purposes, subject to:
          </p>
          <ul className="space-y-1 text-gray-700 mb-3">
            <li className="flex items-start gap-3">
              <span className="text-luxury-gold mt-1.5" aria-hidden="true">
                •
              </span>
              <span>legal compliance,</span>
            </li>
            <li className="flex items-start gap-3">
              <span className="text-luxury-gold mt-1.5" aria-hidden="true">
                •
              </span>
              <span>fraud prevention,</span>
            </li>
            <li className="flex items-start gap-3">
              <span className="text-luxury-gold mt-1.5" aria-hidden="true">
                •
              </span>
              <span>dispute resolution,</span>
            </li>
            <li className="flex items-start gap-3">
              <span className="text-luxury-gold mt-1.5" aria-hidden="true">
                •
              </span>
              <span>and requirements from law enforcement or government authorities.</span>
            </li>
          </ul>
          <p className="text-gray-600 text-sm italic">
            Buyers will not be shown personal identity details of individual sellers unless required
            by law or necessary for a transaction-related dispute.
          </p>
        </Reveal>

        <Reveal as="section" delay={60} distance={40}>
          <h2 className="text-2xl font-serif font-semibold mb-4 text-black">
            7. Seller Responsibility
          </h2>
          <p className="mb-3 text-gray-700">The Seller is solely responsible for:</p>
          <ul className="space-y-1 text-gray-700 mb-3">
            <li className="flex items-start gap-3">
              <span className="text-luxury-gold mt-1.5" aria-hidden="true">
                •
              </span>
              <span>the authenticity of products,</span>
            </li>
            <li className="flex items-start gap-3">
              <span className="text-luxury-gold mt-1.5" aria-hidden="true">
                •
              </span>
              <span>legal ownership,</span>
            </li>
            <li className="flex items-start gap-3">
              <span className="text-luxury-gold mt-1.5" aria-hidden="true">
                •
              </span>
              <span>accurate listing details,</span>
            </li>
            <li className="flex items-start gap-3">
              <span className="text-luxury-gold mt-1.5" aria-hidden="true">
                •
              </span>
              <span>packaging,</span>
            </li>
            <li className="flex items-start gap-3">
              <span className="text-luxury-gold mt-1.5" aria-hidden="true">
                •
              </span>
              <span>safe handover,</span>
            </li>
            <li className="flex items-start gap-3">
              <span className="text-luxury-gold mt-1.5" aria-hidden="true">
                •
              </span>
              <span>and compliance with all applicable laws.</span>
            </li>
          </ul>
          <p className="text-gray-600 text-sm">
            The Seller agrees to indemnify and hold harmless the Platform against any claims,
            losses, damages, penalties, or legal actions arising from breach of this Agreement.
          </p>
        </Reveal>

        <Reveal as="section" delay={60} distance={40}>
          <h2 className="text-2xl font-serif font-semibold mb-4 text-black">
            8. Account Suspension and Termination
          </h2>
          <p className="mb-3 text-gray-700">
            The Platform may suspend or terminate any Seller account immediately if the Seller:
          </p>
          <ul className="space-y-1 text-gray-700 mb-3">
            <li className="flex items-start gap-3">
              <span className="text-luxury-gold mt-1.5" aria-hidden="true">
                •
              </span>
              <span>submits false information,</span>
            </li>
            <li className="flex items-start gap-3">
              <span className="text-luxury-gold mt-1.5" aria-hidden="true">
                •
              </span>
              <span>lists counterfeit or duplicate products,</span>
            </li>
            <li className="flex items-start gap-3">
              <span className="text-luxury-gold mt-1.5" aria-hidden="true">
                •
              </span>
              <span>violates Platform policy,</span>
            </li>
            <li className="flex items-start gap-3">
              <span className="text-luxury-gold mt-1.5" aria-hidden="true">
                •
              </span>
              <span>engages in fraud,</span>
            </li>
            <li className="flex items-start gap-3">
              <span className="text-luxury-gold mt-1.5" aria-hidden="true">
                •
              </span>
              <span>or otherwise harms buyer trust or Platform integrity.</span>
            </li>
          </ul>
          <p className="text-gray-600 text-sm">
            Termination may be permanent at the Platform's sole discretion.
          </p>
        </Reveal>

        <Reveal as="section" delay={60} distance={40}>
          <h2 className="text-2xl font-serif font-semibold mb-4 text-black">
            9. Compliance With Law
          </h2>
          <p className="text-gray-700">
            The Seller agrees to comply with all applicable laws, including tax, consumer
            protection, product authenticity, and e-commerce regulations.
          </p>
        </Reveal>

        <Reveal as="section" delay={60} distance={40}>
          <h2 className="text-2xl font-serif font-semibold mb-4 text-black">10. Amendments</h2>
          <p className="text-gray-700">
            The Platform may update this Agreement at any time by posting a revised version.
            Continued use of the Platform after updates means acceptance of the revised terms.
          </p>
        </Reveal>

        <Reveal as="section" delay={60} distance={40}>
          <h2 className="text-2xl font-serif font-semibold mb-4 text-black">11. Governing Law</h2>
          <p className="text-gray-700">
            This Agreement shall be governed by the laws of the Republic of India, and disputes
            shall be subject to the jurisdiction of Bangalore, Karnataka.
          </p>
        </Reveal>

        <Reveal as="section" delay={60} distance={40}>
          <h2 className="text-2xl font-serif font-semibold mb-4 text-black">12. Acceptance</h2>
          <p className="text-gray-700">
            By signing up, listing products, or selling through the Platform, the Seller
            acknowledges that they have read, understood, and agreed to this Seller Agreement.
          </p>
        </Reveal>
      </div>
    </div>
  );
};

export default SellerAgreement;
