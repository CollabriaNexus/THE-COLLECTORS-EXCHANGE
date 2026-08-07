/**
 * Brand tokens mirrored from the main site (tailwind.config.js).
 * Keep these in sync so video output matches thecollectorsexchange.in.
 */

export const COLORS = {
  obsidian: '#0A0A0A',
  luxuryGold: '#D4AF37',
  goldMuted: '#C9A962',
  brass: '#B8860B',
  bronze: '#8B7355',
  charcoal: '#1C1C1C',
  charcoalDark: '#2A2A2A',
  brown: '#3D3028',
  warm: '#4A3F35',
  beige: '#F5F0E8',
  cream: '#FAF8F5',
  white: '#FFFFFF',
  black: '#000000',
} as const;

export const FONTS = {
  serif: '"Playfair Display", Georgia, serif',
  sans: '"Inter", system-ui, -apple-system, sans-serif',
} as const;

/**
 * Instagram format presets.
 * Reels/Stories are 1080x1920 (9:16). Feed square is 1080x1080 (1:1).
 * Instagram caps Reels at 90s; we stay well under.
 */
export const FORMATS = {
  reel: { width: 1080, height: 1920 },
  square: { width: 1080, height: 1080 },
  portraitFeed: { width: 1080, height: 1350 }, // 4:5, best organic feed real estate
} as const;

export const FPS = 30;

/** Safe margins so text never collides with Instagram's UI overlays. */
export const SAFE_AREA = {
  top: 220, // clears the Reels header/profile row
  bottom: 380, // clears caption, action buttons, audio ticker
  side: 80,
} as const;

export const BRAND = {
  name: 'The Collectors Exchange',
  shortName: 'The Collectors Exchange',
  domain: 'thecollectorsexchange.in',
  handle: '@the_collectors_exchange',
  tagline: 'Every piece verified. Every seller vetted.',
} as const;
