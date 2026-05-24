// src/components/About/OdysseyTimeline.jsx
import React from 'react';

const steps = [
  { title: 'Exploration', description: 'Visiting historic pawn shops across India.' },
  { title: 'Curation', description: 'Authenticating and selecting the finest pieces.' },
  { title: 'Delivery', description: 'Shipping curated heritage directly to your door.' },
];

const OdysseyTimeline = () => (
  <section className="py-20 px-6 md:px-12 lg:px-24 bg-cream text-obsidian">
    <div className="max-w-4xl mx-auto">
      <div className="text-4xl font-serif uppercase tracking-widest text-brass mb-4">04 / THE ODYSSEY</div>
      <h2 className="text-5xl md:text-6xl font-serif font-bold mb-8">The Journey Through the Heart of India.</h2>
      <div className="space-y-12">
        {steps.map((step, idx) => (
          <div key={idx} className="flex items-start gap-6">
            <div className="flex-shrink-0 w-12 h-12 rounded-full bg-brass text-white flex items-center justify-center font-serif text-xl">
              {idx + 1}
            </div>
            <div>
              <h3 className="text-2xl font-serif mb-2">{step.title}</h3>
              <p className="text-lg leading-relaxed">{step.description}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  </section>
);

export default OdysseyTimeline;
