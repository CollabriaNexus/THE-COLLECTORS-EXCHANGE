import React from 'react';
import { Reveal, Stagger, Tilt } from '../Motion';

const MissionValues = () => (
  <section className="py-16 sm:py-20 px-6 md:px-12 lg:px-24 bg-obsidian text-white">
    <div className="max-w-6xl mx-auto grid md:grid-cols-2 gap-8 sm:gap-12 items-start">
      {/* Sticky left header */}
      <Reveal direction="left" blur className="sticky top-24">
        <div className="text-2xl sm:text-3xl md:text-4xl font-serif uppercase tracking-widest text-brass mb-3 sm:mb-4">
          02 / MISSION
        </div>
        <h2 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold mb-4 sm:mb-6">
          Reviving the Soul of Indian Heritage.
        </h2>
        <p className="text-sm sm:text-base md:text-lg font-light leading-relaxed mb-6 sm:mb-8">
          In an era dominated by transient digital noise, the physical, tangible history of India is
          at risk of fading into obscurity. Our mission is to reclaim that "dead value" and breathe
          new life into it. We don't just trade articles; we preserve stories.
        </p>
      </Reveal>
      {/* Right side cards */}
      <Stagger step={130} className="space-y-6 sm:space-y-8">
        <Tilt>
          <div className="border border-brass p-4 sm:p-6 hover:border-luxury-gold transition-colors duration-300">
            <h3 className="text-xl sm:text-2xl font-serif mb-2">The Heritage Lifejacket</h3>
            <p className="text-sm sm:text-base font-light leading-relaxed">
              We act as an unyielding custodian for national heritage, ensuring every collectible is
              backed by absolute trust and rigorous structural authenticity.
            </p>
          </div>
        </Tilt>
        <Tilt>
          <div className="border border-brass p-4 sm:p-6 hover:border-luxury-gold transition-colors duration-300">
            <h3 className="text-xl sm:text-2xl font-serif mb-2">Educating the Vanguard</h3>
            <p className="text-sm sm:text-base font-light leading-relaxed">
              We mentor and educate the next generation of Indian collectors, empowering them to
              understand, appreciate, and protect the true value of the past.
            </p>
          </div>
        </Tilt>
      </Stagger>
    </div>
  </section>
);

export default MissionValues;
