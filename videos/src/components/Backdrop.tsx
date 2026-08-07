import React from 'react';
import { AbsoluteFill, useCurrentFrame, interpolate } from 'remotion';
import { COLORS } from '../brand';

/**
 * Layered background: deep charcoal base, a slow-drifting gold radial glow,
 * and a subtle vignette. Gives every scene depth without competing with text.
 */
export const Backdrop: React.FC<{
  /** Shifts the glow position so consecutive scenes don't look identical. */
  variant?: 0 | 1 | 2 | 3;
  children?: React.ReactNode;
}> = ({ variant = 0, children }) => {
  const frame = useCurrentFrame();

  // Slow parallax drift on the glow — keeps the frame alive between cuts.
  const drift = interpolate(frame, [0, 300], [0, 40], {
    extrapolateRight: 'clamp',
  });

  const positions = [
    { x: 30, y: 25 },
    { x: 70, y: 35 },
    { x: 50, y: 70 },
    { x: 25, y: 60 },
  ];
  const pos = positions[variant];

  return (
    <AbsoluteFill style={{ backgroundColor: COLORS.obsidian }}>
      {/* Warm gold glow */}
      <AbsoluteFill
        style={{
          background: `radial-gradient(ellipse 60% 45% at ${pos.x}% ${
            pos.y + drift / 20
          }%, ${COLORS.brown}CC 0%, transparent 65%)`,
        }}
      />
      {/* Secondary cooler fill for dimension */}
      <AbsoluteFill
        style={{
          background: `radial-gradient(ellipse 50% 40% at ${100 - pos.x}% ${
            100 - pos.y
          }%, ${COLORS.charcoalDark}AA 0%, transparent 60%)`,
        }}
      />
      {/* Fine grain/texture via repeating dots — mirrors the site's dot motif */}
      <AbsoluteFill
        style={{
          backgroundImage: `radial-gradient(${COLORS.luxuryGold}22 1px, transparent 1px)`,
          backgroundSize: '48px 48px',
          opacity: 0.35,
        }}
      />
      {/* Vignette to focus the center */}
      <AbsoluteFill
        style={{
          background:
            'radial-gradient(ellipse 75% 65% at 50% 50%, transparent 40%, rgba(0,0,0,0.75) 100%)',
        }}
      />
      {children}
    </AbsoluteFill>
  );
};
