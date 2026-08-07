import React from 'react';
import { AbsoluteFill, useVideoConfig } from 'remotion';
import { TransitionSeries, linearTiming } from '@remotion/transitions';
import { fade } from '@remotion/transitions/fade';
import { loadFont as loadPlayfair } from '@remotion/google-fonts/PlayfairDisplay';
import { loadFont as loadInter } from '@remotion/google-fonts/Inter';
import {
  HookScene,
  BrandScene,
  ValueScene,
  CtaScene,
} from '../components/Scenes';
import { MusicBed, Sfx, SFX } from '../components/SoundLayer';
import { COLORS } from '../brand';

// Load at module scope so glyphs are ready before the first frame renders.
loadPlayfair();
loadInter();

/**
 * Timing is locked to the music (84 BPM), so every cut lands on a downbeat.
 *   1 beat = 60/84 s = 21.43 frames @30fps
 *   1 bar  = 4 beats = 85.7 -> 86 frames
 * Cutting on the bar is what makes the edit feel intentional rather than arbitrary.
 */
export const BAR = 86;
const TRANSITION = 14; // ~0.47s crossfade

/**
 * Scene lengths in bars. Transitions overlap neighbouring scenes, so the
 * timeline total subtracts one transition per boundary.
 */
const SCENES = [
  { component: HookScene, bars: 1.5 },
  { component: BrandScene, bars: 1.5 },
  { component: ValueScene, bars: 2 },
  { component: CtaScene, bars: 1.5 },
] as const;

const DURATIONS = SCENES.map((s) => Math.round(s.bars * BAR));

export const INTRO_DURATION =
  DURATIONS.reduce((a, b) => a + b, 0) - TRANSITION * (SCENES.length - 1);

/** Absolute start frame of each scene on the final timeline. */
const STARTS: number[] = [];
{
  let cursor = 0;
  DURATIONS.forEach((d, i) => {
    STARTS.push(cursor);
    cursor += d - (i < SCENES.length - 1 ? TRANSITION : 0);
  });
}

export const IntroReel: React.FC = () => {
  const { durationInFrames } = useVideoConfig();

  return (
    <AbsoluteFill style={{ backgroundColor: COLORS.obsidian }}>
      <TransitionSeries>
        {SCENES.map(({ component: Comp }, i) => (
          <React.Fragment key={i}>
            <TransitionSeries.Sequence durationInFrames={DURATIONS[i]}>
              <Comp />
            </TransitionSeries.Sequence>
            {i < SCENES.length - 1 && (
              <TransitionSeries.Transition
                presentation={fade()}
                timing={linearTiming({ durationInFrames: TRANSITION })}
              />
            )}
          </React.Fragment>
        ))}
      </TransitionSeries>

      {/* --- Audio ---------------------------------------------------
          The music carries the piece; SFX are deliberately sparse and low
          so they punctuate rather than clutter. Instagram is often watched
          muted, so nothing here is load-bearing for comprehension. */}
      <MusicBed
        volume={0.5}
        fadeOutStart={durationInFrames - 52}
        totalFrames={durationInFrames}
      />

      {/* Accent the opening headline */}
      <Sfx src={SFX.impact} at={10} volume={0.32} />

      {/* A soft whoosh into each transition */}
      {STARTS.slice(1).map((s, i) => (
        <Sfx key={`w${i}`} src={SFX.whoosh} at={s - 10} volume={0.26} />
      ))}

      {/* Chime on the brand medallion */}
      <Sfx src={SFX.chime} at={STARTS[1] + 6} volume={0.3} />

      {/* Tick per value pillar as it lands */}
      {[0, 1, 2].map((i) => (
        <Sfx
          key={`t${i}`}
          src={SFX.tick}
          at={STARTS[2] + 8 + i * 14}
          volume={0.22}
        />
      ))}

      {/* Final chime under the CTA */}
      <Sfx src={SFX.chime} at={STARTS[3] + 26} volume={0.3} />
    </AbsoluteFill>
  );
};
