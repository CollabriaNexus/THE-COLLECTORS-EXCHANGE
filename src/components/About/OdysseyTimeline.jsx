import React from 'react';
import { Reveal, Stagger } from '../Motion';

const steps = [
  { title: 'Exploration', description: 'Visiting historic pawn shops across India.' },
  { title: 'Curation', description: 'Authenticating and selecting the finest pieces.' },
  { title: 'Delivery', description: 'Shipping curated heritage directly to your door.' },
];

const OdysseyTimeline = () => (
  <section className="py-16 sm:py-20 px-6 md:px-12 lg:px-24 bg-cream text-obsidian">
    <div className="max-w-4xl mx-auto">
      <Reveal
        as="div"
        className="text-2xl sm:text-3xl md:text-4xl font-serif uppercase tracking-widest text-brass mb-3 sm:mb-4"
      >
        04 / THE ODYSSEY
      </Reveal>
      <Reveal
        as="h2"
        blur
        delay={100}
        className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-serif font-bold mb-6 sm:mb-8"
      >
        The Journey Through the Heart of India.
      </Reveal>
      <Stagger step={130} className="space-y-8 sm:space-y-12">
        {steps.map((step, idx) => (
          <div key={idx} className="flex items-start gap-4 sm:gap-6">
            <div className="flex-shrink-0 w-8 h-8 sm:w-12 sm:h-12 rounded-full bg-brass text-white flex items-center justify-center font-serif text-sm sm:text-lg md:text-xl">
              {idx + 1}
            </div>
            <div>
              <h3 className="text-xl sm:text-2xl font-serif mb-1 sm:mb-2">{step.title}</h3>
              <p className="text-sm sm:text-base md:text-lg leading-relaxed">{step.description}</p>
            </div>
          </div>
        ))}
      </Stagger>
    </div>
  </section>
);

export default OdysseyTimeline;
