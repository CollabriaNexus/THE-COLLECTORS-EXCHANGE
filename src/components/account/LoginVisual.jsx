import React from 'react';

// Hand-authored line-art watch face — no image request, scales perfectly at
// every breakpoint, and echoes the crest/hero motifs used elsewhere instead
// of a generic stock illustration. Hands are set to 10:10, the standard
// watch-photography convention (reads as a "smile", never crosses the logo).
const WatchMark = ({ className }) => (
  <svg viewBox="0 0 320 320" className={className} aria-hidden="true">
    <circle
      cx="160"
      cy="160"
      r="146"
      fill="none"
      stroke="#D4AF37"
      strokeOpacity="0.12"
      strokeWidth="1"
    />
    <circle
      cx="160"
      cy="160"
      r="112"
      fill="none"
      stroke="#D4AF37"
      strokeOpacity="0.9"
      strokeWidth="2"
    />
    <circle
      cx="160"
      cy="160"
      r="98"
      fill="none"
      stroke="#D4AF37"
      strokeOpacity="0.3"
      strokeWidth="1"
    />
    {/* Crown */}
    <rect
      x="150"
      y="10"
      width="20"
      height="16"
      rx="3"
      fill="none"
      stroke="#D4AF37"
      strokeOpacity="0.55"
      strokeWidth="1.5"
    />
    {/* Lugs */}
    <path
      d="M96 68 L124 96 M224 68 L196 96 M96 252 L124 224 M224 252 L196 224"
      stroke="#D4AF37"
      strokeOpacity="0.35"
      strokeWidth="1.5"
      strokeLinecap="round"
    />
    {/* Hour markers */}
    {Array.from({ length: 12 }).map((_, i) => {
      const a = (i * 30 * Math.PI) / 180;
      const isCardinal = i % 3 === 0;
      const rOuter = 98;
      const rInner = isCardinal ? 84 : 90;
      const x1 = 160 + rOuter * Math.sin(a);
      const y1 = 160 - rOuter * Math.cos(a);
      const x2 = 160 + rInner * Math.sin(a);
      const y2 = 160 - rInner * Math.cos(a);
      return (
        <line
          key={i}
          x1={x1}
          y1={y1}
          x2={x2}
          y2={y2}
          stroke="#D4AF37"
          strokeWidth={isCardinal ? 2.5 : 1}
          strokeOpacity={isCardinal ? 0.85 : 0.4}
          strokeLinecap="round"
        />
      );
    })}
    {/* Hands, set to 10:10 */}
    <line
      x1="160"
      y1="160"
      x2="118"
      y2="102"
      stroke="#D4AF37"
      strokeWidth="3"
      strokeLinecap="round"
    />
    <line
      x1="160"
      y1="160"
      x2="200"
      y2="104"
      stroke="#D4AF37"
      strokeWidth="2.5"
      strokeLinecap="round"
      strokeOpacity="0.9"
    />
    <line
      x1="160"
      y1="160"
      x2="160"
      y2="180"
      stroke="#D4AF37"
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeOpacity="0.6"
    />
    <circle cx="160" cy="160" r="4.5" fill="#D4AF37" />
  </svg>
);

// The full-height branded panel shown beside the login form on lg+ screens.
export const LoginVisualPanel = () => (
  <div
    className="relative hidden lg:flex flex-col justify-between p-12 xl:p-14 overflow-hidden"
    style={{ background: 'linear-gradient(160deg, #0A0A0A 0%, #1C1C1C 65%, #0A0A0A 100%)' }}
  >
    <div
      aria-hidden="true"
      className="absolute inset-0 opacity-[0.05]"
      style={{
        backgroundImage: 'radial-gradient(#D4AF37 0.5px, transparent 0.5px)',
        backgroundSize: '28px 28px',
      }}
    />
    <div
      aria-hidden="true"
      className="absolute -top-16 -right-16 w-64 h-64 bg-luxury-gold/10 rounded-full blur-3xl"
    />
    <div
      aria-hidden="true"
      className="absolute -bottom-20 -left-16 w-72 h-72 bg-luxury-gold/[0.06] rounded-full blur-3xl"
    />

    <p className="relative z-10 font-serif text-sm uppercase tracking-[0.3em] text-cream/70">
      The Collectors Exchange
    </p>

    <WatchMark className="relative z-10 w-56 h-56 xl:w-64 xl:h-64 mx-auto" />

    <div className="relative z-10 text-center">
      <p className="font-serif italic text-lg xl:text-xl text-cream/90 leading-snug">
        Verified. Original. Limited.
      </p>
      <p className="mt-2 text-xs text-cream/40 uppercase tracking-[0.2em]">
        A curated world of rare finds, authenticated
      </p>
    </div>
  </div>
);

// A shorter horizontal band for mobile/tablet — same motif, laid out to sit
// above the form instead of beside it.
export const LoginVisualBand = () => (
  <div
    className="lg:hidden relative flex flex-col items-center justify-center gap-3 py-8 px-6 overflow-hidden"
    style={{ background: 'linear-gradient(160deg, #0A0A0A 0%, #1C1C1C 65%, #0A0A0A 100%)' }}
  >
    <div
      aria-hidden="true"
      className="absolute -top-10 -right-10 w-40 h-40 bg-luxury-gold/10 rounded-full blur-3xl"
    />
    <div
      aria-hidden="true"
      className="absolute -bottom-12 -left-10 w-40 h-40 bg-luxury-gold/[0.06] rounded-full blur-3xl"
    />
    <WatchMark className="relative z-10 w-24 h-24 sm:w-28 sm:h-28" />
    <p className="relative z-10 font-serif italic text-sm sm:text-base text-cream/90">
      Verified. Original. Limited.
    </p>
  </div>
);
