import React, { useState } from 'react';
import { ChevronDown, ChevronUp, Search } from 'lucide-react';
import SEO, { FAQSchema } from '../components/SEO';
import { Reveal, Stagger, Magnetic } from '../components/Motion';

const FAQ_ITEMS = [
  {
    category: 'Buying',
    questions: [
      {
        q: 'How do I purchase an item on The Collectors Exchange?',
        a: "Browse The Exchange, find an item you love, add it to your cart, and proceed to checkout. You'll need to create an account and choose your preferred payment method — pay online via our secure Razorpay integration (UPI, cards, net banking) or select Cash on Delivery.",
      },
      {
        q: "Is there a buyer's premium or additional fee?",
        a: 'For online payments, a 5% platform fee is included in the checkout total. Cash on Delivery orders have a small additional handling fee. This covers authentication, secure transactions, and collector support.',
      },
      {
        q: 'Can I return an item?',
        a: 'Items are eligible for return within 48 hours of delivery if they do not match the described condition. Please refer to our Terms & Conditions for the full inspection period policy.',
      },
      {
        q: 'How are items authenticated?',
        a: 'All items listed on The Exchange go through a rigorous verification process by our curation team before being published. Each item is individually reviewed for authenticity and condition.',
      },
      {
        q: 'What payment methods are accepted?',
        a: 'We offer two payment options: (1) Online Payment via Razorpay — supports UPI, credit/debit cards, net banking, and other major Indian payment methods. (2) Cash on Delivery (COD) — pay in cash when your order arrives at your doorstep.',
      },
    ],
  },
  {
    category: 'Selling',
    questions: [
      {
        q: 'How do I start selling on The Exchange?',
        a: 'Create an account, complete identity verification (KYC), accept the Seller Agreement, and submit your items for brokerage. Once approved by our curation team, your items will be listed on The Exchange.',
      },
      {
        q: 'What are the seller fees?',
        a: 'Individual sellers can list up to 5 items. Company accounts have unlimited listings. Platform fees are deducted at the time of sale.',
      },
      {
        q: 'How do I get paid?',
        a: 'Payments for sold items are held for 7 days after delivery to allow for buyer inspection. After this period, funds become available for payout.',
      },
      {
        q: 'What items can I sell?',
        a: 'We accept timepieces, collectibles, antiques, jewelry, toys & pop culture items. All items must be authentic and accurately described. Our curation team reserves the right to reject any listing.',
      },
      {
        q: 'How long does verification take?',
        a: 'KYC verification is typically completed within 48 hours. Product listing review times vary based on the current volume.',
      },
    ],
  },
  {
    category: 'Account & Security',
    questions: [
      {
        q: 'How do I create an account?',
        a: 'Click on the Account icon and choose "Create Application". You can sign up with your email or use Google OAuth for a faster registration.',
      },
      {
        q: 'Is my personal information secure?',
        a: 'Yes. All data is encrypted and handled per our Privacy Policy. We use Supabase for authentication and secure data storage. Your identity remains anonymous to buyers unless you choose otherwise.',
      },
      {
        q: 'How do I delete my account?',
        a: 'Please contact our support team at support@thecollectorsexchange.in with your account details, and we will assist you with account deletion.',
      },
      {
        q: 'What is the KYC verification process?',
        a: 'KYC requires submitting identity documents (Aadhaar, PAN) along with a digital signature of the Seller Agreement. Company accounts require additional documentation including GST and incorporation certificates.',
      },
    ],
  },
  {
    category: 'Shipping & Delivery',
    questions: [
      {
        q: 'How are items shipped?',
        a: 'Items are shipped via Delhivery, our logistics partner. Tracking IDs are provided once the order is shipped from our verification center.',
      },
      {
        q: 'What are the shipping costs?',
        a: 'Shipping is free for all orders within India. International shipping costs vary based on the item and destination.',
      },
      {
        q: 'How long does delivery take?',
        a: 'Domestic orders typically arrive within 5-7 business days after processing. International delivery times vary.',
      },
      {
        q: 'Do you ship internationally?',
        a: 'Yes, we ship to select international destinations. Please contact our support team for international shipping inquiries.',
      },
    ],
  },
];

const FAQ = () => {
  const [search, setSearch] = useState('');
  const [openItems, setOpenItems] = useState({});

  const toggleItem = (catIdx, qIdx) => {
    const key = `${catIdx}-${qIdx}`;
    setOpenItems((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  const filtered = FAQ_ITEMS.map((cat) => ({
    ...cat,
    questions: cat.questions.filter(
      (item) =>
        !search ||
        item.q.toLowerCase().includes(search.toLowerCase()) ||
        item.a.toLowerCase().includes(search.toLowerCase()),
    ),
  })).filter((cat) => cat.questions.length > 0);

  const faqItems = FAQ_ITEMS.flatMap((cat) => cat.questions);

  return (
    <div className="min-h-screen bg-secondary-bg">
      <SEO
        title="FAQ"
        description="Find answers to frequently asked questions about buying, selling, shipping, and account security on The Collectors Exchange — India's trusted marketplace for verified collectibles."
        canonical="/faq"
      />
      <FAQSchema items={faqItems} />
      <div className="container mx-auto py-12 sm:py-20 px-6 max-w-3xl">
        <Reveal className="text-center mb-12" blur>
          <h1 className="text-2xl sm:text-4xl lg:text-5xl font-serif mb-4">
            Frequently Asked Questions
          </h1>
          <p className="text-gray-500 text-sm sm:text-base font-light mb-8">
            Find answers to common questions about buying, selling, and using The Collectors
            Exchange.
          </p>
          <div className="relative max-w-md mx-auto">
            <Search size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              placeholder="Search FAQs..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-12 pr-4 py-4 bg-white border border-gray-200 focus:outline-none focus:border-luxury-gold"
            />
          </div>
        </Reveal>

        <div className="space-y-8">
          {filtered.map((category, catIdx) => (
            <Reveal key={category.category} as="div">
              <h2 className="text-xl sm:text-2xl font-serif mb-4 text-heritage-charcoal border-b border-gray-200 pb-3">
                {category.category}
              </h2>
              <Stagger className="space-y-2" step={70} distance={28}>
                {category.questions.map((item, qIdx) => {
                  const key = `${catIdx}-${qIdx}`;
                  const isOpen = openItems[key];
                  return (
                    <div key={qIdx} className="bg-white border border-gray-100 shadow-sm">
                      <button
                        onClick={() => toggleItem(catIdx, qIdx)}
                        className="w-full flex items-center justify-between p-5 text-left hover:bg-gray-50 transition-colors"
                      >
                        <span className="font-medium text-heritage-charcoal pr-4">{item.q}</span>
                        {isOpen ? (
                          <ChevronUp size={18} className="text-luxury-gold flex-shrink-0" />
                        ) : (
                          <ChevronDown size={18} className="text-gray-400 flex-shrink-0" />
                        )}
                      </button>
                      {isOpen && (
                        <div className="px-5 pb-5 text-gray-600 leading-relaxed text-sm border-t border-gray-100 pt-4">
                          {item.a}
                        </div>
                      )}
                    </div>
                  );
                })}
              </Stagger>
            </Reveal>
          ))}
        </div>

        <Reveal className="mt-16 text-center bg-white p-10 border border-gray-100 shadow-sm">
          <h2 className="text-xl sm:text-2xl font-serif mb-4">Still have questions?</h2>
          <p className="text-gray-500 mb-6">We're here to help you.</p>
          <Magnetic>
            <a
              href="/contact"
              className="inline-block bg-black text-white px-10 py-4 text-sm uppercase tracking-widest hover:bg-luxury-gold transition-colors"
            >
              Contact Us
            </a>
          </Magnetic>
        </Reveal>
      </div>
    </div>
  );
};

export default FAQ;
