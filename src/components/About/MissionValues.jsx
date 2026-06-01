// src/components/About/MissionValues.jsx
import React from 'react';

const MissionValues = () => (
  <section className="py-20 px-6 md:px-12 lg:px-24 bg-obsidian text-white">
    <div className="max-w-6xl mx-auto grid md:grid-cols-2 gap-12 items-start">
      {/* Sticky left header */}
      <div className="sticky top-24">
        <div className="text-4xl font-serif uppercase tracking-widest text-brass mb-4">
          02 / MISSION
        </div>
        <h2 className="text-5xl md:text-6xl font font-bold mb-6">
          Reviving the Soul of Indian Heritage.
        </h2>
        <p className="text-lg font-light leading-relaxed mb-8">
          In an era dominated by transient digital noise, the physical, tangible history of India is at risk of fading into obscurity. Our mission is to reclaim that "dead value" and breathe new life into it. We don’t just trade articles; we preserve stories.
        </p>
      </div>
      {/* Right side cards */}
      <div className="space-y-8">
        <div className="border border-brass p-6 hover:border-luxury-gold transition-colors duration-300">
          <h3 className="text-2xl font-serif mb-2">The Heritage Lifejacket</h3>
          <p className="font-light leading-relaxed">
            We act as an unyielding custodian for national heritage, ensuring every collectible is backed by absolute trust and rigorous structural authenticity.
          </p>
        </div>
        <div className="border border-brass p-6 hover:border-luxury-gold transition-colors duration-300">
          <h3 className="text-2xl font-serif mb-2">Educating the Vanguard</h3>
          <p className="font-light leading-relaxed">
            We mentor and educate the next generation of Indian collectors, empowering them to understand, appreciate, and protect the true value of the past.
          </p>
        </div>
      </div>
    </div>
  </section>
);

export default MissionValues;
