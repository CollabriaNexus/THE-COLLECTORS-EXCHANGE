import React from 'react';
import { AbsoluteFill } from 'remotion';
import { COLORS, SAFE_AREA } from '../brand';

/**
 * Content centred inside Instagram's safe area, so copy never sits under the
 * Reels header, caption block, or the right-hand action rail.
 */
export const SafeStage: React.FC<{
  children: React.ReactNode;
  justify?: React.CSSProperties['justifyContent'];
  align?: React.CSSProperties['alignItems'];
  gap?: number;
}> = ({ children, justify = 'center', align = 'center', gap = 24 }) => (
  <AbsoluteFill
    style={{
      paddingTop: SAFE_AREA.top,
      paddingBottom: SAFE_AREA.bottom,
      paddingLeft: SAFE_AREA.side,
      paddingRight: SAFE_AREA.side,
      display: 'flex',
      flexDirection: 'column',
      alignItems: align,
      justifyContent: justify,
      gap,
    }}
  >
    {children}
  </AbsoluteFill>
);

/**
 * Dark scrim over photography so white text stays legible regardless of what
 * the image is doing underneath. Two layers: a vertical gradient for the
 * top/bottom thirds, plus a radial to pull focus to the centre.
 */
export const Scrim: React.FC<{ strength?: number }> = ({ strength = 1 }) => {
  const hex = (a: number) =>
    Math.round(Math.min(1, a) * 255)
      .toString(16)
      .padStart(2, '0');

  return (
    <>
      <AbsoluteFill
        style={{
          background: `linear-gradient(180deg, ${COLORS.obsidian}${hex(
            0.82 * strength,
          )} 0%, ${COLORS.obsidian}44 40%, ${COLORS.obsidian}55 60%, ${
            COLORS.obsidian
          }${hex(0.95 * strength)} 100%)`,
        }}
      />
      <AbsoluteFill
        style={{
          background: `radial-gradient(ellipse 80% 55% at 50% 50%, transparent 30%, ${
            COLORS.obsidian
          }${hex(0.8 * strength)} 100%)`,
        }}
      />
    </>
  );
};
