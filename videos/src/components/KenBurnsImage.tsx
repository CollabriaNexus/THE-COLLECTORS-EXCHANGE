import React from 'react';
import { AbsoluteFill, Img, useCurrentFrame, interpolate, useVideoConfig } from 'remotion';

/**
 * Slow zoom/pan over a still image (Ken Burns effect) so photography
 * never sits static on screen — essential for holding attention on Reels.
 */
export const KenBurnsImage: React.FC<{
  src: string;
  /** 'in' zooms toward the subject; 'out' pulls back to reveal. */
  direction?: 'in' | 'out';
  /** How far to travel, as a scale delta. 0.12 = 12% zoom over the scene. */
  intensity?: number;
  panX?: number;
  panY?: number;
  opacity?: number;
  style?: React.CSSProperties;
}> = ({
  src,
  direction = 'in',
  intensity = 0.12,
  panX = 0,
  panY = 0,
  opacity = 1,
  style,
}) => {
  const frame = useCurrentFrame();
  const { durationInFrames } = useVideoConfig();

  const from = direction === 'in' ? 1 : 1 + intensity;
  const to = direction === 'in' ? 1 + intensity : 1;

  const scale = interpolate(frame, [0, durationInFrames], [from, to], {
    extrapolateRight: 'clamp',
  });
  const x = interpolate(frame, [0, durationInFrames], [0, panX], {
    extrapolateRight: 'clamp',
  });
  const y = interpolate(frame, [0, durationInFrames], [0, panY], {
    extrapolateRight: 'clamp',
  });

  return (
    <AbsoluteFill style={{ overflow: 'hidden', ...style }}>
      <Img
        src={src}
        style={{
          width: '100%',
          height: '100%',
          objectFit: 'cover',
          transform: `scale(${scale}) translate(${x}px, ${y}px)`,
          opacity,
        }}
      />
    </AbsoluteFill>
  );
};
