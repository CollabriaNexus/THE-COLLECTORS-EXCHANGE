import React from 'react';
import { useCurrentFrame, spring, useVideoConfig, interpolate } from 'remotion';
import { COLORS, FONTS } from '../brand';

type Props = {
  children: React.ReactNode;
  /** Frame (relative to the enclosing Sequence) at which this line starts. */
  delay?: number;
  fontSize?: number;
  color?: string;
  font?: 'serif' | 'sans';
  weight?: number;
  letterSpacing?: string;
  textTransform?: React.CSSProperties['textTransform'];
  lineHeight?: number;
  align?: React.CSSProperties['textAlign'];
  maxWidth?: number | string;
  style?: React.CSSProperties;
};

/**
 * Text that rises and fades in on a spring, with a slight blur-off.
 * Used for every headline/subhead so motion feels consistent across scenes.
 */
export const AnimatedText: React.FC<Props> = ({
  children,
  delay = 0,
  fontSize = 64,
  color = COLORS.white,
  font = 'serif',
  weight = 400,
  letterSpacing = '-0.01em',
  textTransform,
  lineHeight = 1.15,
  align = 'center',
  maxWidth = '100%',
  style,
}) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const progress = spring({
    frame: frame - delay,
    fps,
    config: { damping: 200, stiffness: 90, mass: 0.6 },
  });

  const translateY = interpolate(progress, [0, 1], [42, 0]);
  const opacity = interpolate(progress, [0, 1], [0, 1]);
  const blur = interpolate(progress, [0, 1], [8, 0]);

  return (
    <div
      style={{
        fontFamily: font === 'serif' ? FONTS.serif : FONTS.sans,
        fontSize,
        fontWeight: weight,
        color,
        letterSpacing,
        textTransform,
        lineHeight,
        textAlign: align,
        maxWidth,
        transform: `translateY(${translateY}px)`,
        opacity,
        filter: `blur(${blur}px)`,
        margin: 0,
        ...style,
      }}
    >
      {children}
    </div>
  );
};

/**
 * A thin gold rule that draws itself outward from the center.
 * Used as a divider between eyebrow text and headlines.
 */
export const GoldRule: React.FC<{ delay?: number; width?: number }> = ({
  delay = 0,
  width = 120,
}) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const progress = spring({
    frame: frame - delay,
    fps,
    config: { damping: 200, stiffness: 80 },
  });

  return (
    <div
      style={{
        width: interpolate(progress, [0, 1], [0, width]),
        height: 2,
        background: `linear-gradient(90deg, transparent, ${COLORS.luxuryGold}, transparent)`,
        opacity: interpolate(progress, [0, 1], [0, 1]),
      }}
    />
  );
};
