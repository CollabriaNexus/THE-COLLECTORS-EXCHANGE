import React from 'react';

// Hand-authored line-art mark for the empty-wishlist state — a faceted,
// gem-cut heart inside a thin locket ring, echoing the watch-face motif used
// on the login screen (src/components/account/LoginVisual.jsx) so the site's
// custom illustrations read as one consistent visual language, rather than a
// flat stock icon (lucide's plain Heart) sitting alone in a lot of whitespace.
const EmptyWishlistVisual = () => (
  <div className="relative w-24 h-24 sm:w-28 sm:h-28 mx-auto mb-5 sm:mb-6">
    <div aria-hidden="true" className="absolute inset-0 bg-luxury-gold/10 rounded-full blur-xl" />
    <svg viewBox="0 0 256 256" className="relative w-full h-full" aria-hidden="true">
      <circle
        cx="128"
        cy="124"
        r="116"
        fill="none"
        stroke="#D4AF37"
        strokeOpacity="0.18"
        strokeWidth="1"
        strokeDasharray="1 7"
        strokeLinecap="round"
      />
      <path
        d="M128 198 C66 153 30 116 30 82 C30 53 53 30 81 30 C101 30 117 43 128 61 C139 43 155 30 175 30 C203 30 226 53 226 82 C226 116 190 153 128 198 Z"
        fill="none"
        stroke="#D4AF37"
        strokeWidth="2.5"
        strokeLinejoin="round"
      />
      <g stroke="#D4AF37" strokeOpacity="0.4" strokeWidth="1" strokeLinecap="round">
        <line x1="128" y1="61" x2="128" y2="166" />
        <line x1="81" y1="49" x2="128" y2="108" />
        <line x1="175" y1="49" x2="128" y2="108" />
        <line x1="58" y1="96" x2="128" y2="138" />
        <line x1="198" y1="96" x2="128" y2="138" />
      </g>
      <g stroke="#D4AF37" strokeOpacity="0.75" strokeWidth="1.5" strokeLinecap="round">
        <path d="M204 44 L204 60 M196 52 L212 52" />
      </g>
      <circle cx="220" cy="32" r="2" fill="#D4AF37" fillOpacity="0.55" />
    </svg>
  </div>
);

export default EmptyWishlistVisual;
