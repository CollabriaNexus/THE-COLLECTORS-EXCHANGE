import React from 'react';
import { AbsoluteFill, staticFile, useVideoConfig } from 'remotion';
import { TransitionSeries, linearTiming } from '@remotion/transitions';
import { fade } from '@remotion/transitions/fade';
import { loadFont as loadPlayfair } from '@remotion/google-fonts/PlayfairDisplay';
import { loadFont as loadInter } from '@remotion/google-fonts/Inter';
import { COLORS } from '../brand';
import { AnimatedText, GoldRule } from '../components/AnimatedText';
import { KenBurnsImage } from '../components/KenBurnsImage';
import { SafeStage, Scrim } from '../components/Layout';
import { MusicBed, Sfx, SFX } from '../components/SoundLayer';

loadPlayfair();
loadInter();

/**
 * "The Drawer" — the sell-side / emotional film.
 *
 * STRATEGY
 * Audience: the heirloom holder. Someone who inherited a watch and has no idea
 * what it is, whether it works, or what it's worth. Research showed this is the
 * single most relatable entry point in the Indian market: HMT supplied watches
 * to millions of government employees as retirement gifts for decades, so a
 * dormant mechanical watch in a family drawer is close to a shared national
 * memory.
 *
 * Job of the film: create recognition ("that's my dad's watch"), then offer a
 * low-friction next step. It sells nothing directly — it earns a DM.
 * This also feeds the marketplace's real bottleneck, which is supply.
 *
 * Deliberately NOT claimed: free valuation, repair, or restoration. TCE
 * authenticates and brokers; promising servicing it may not offer would be a
 * trust problem on a video whose whole point is trust.
 */

const BAR = 86; // 84 BPM @ 30fps — cuts land on downbeats
const TRANSITION = 16;

/* ------------------------------------------------------------------ */
/*  SCENES                                                             */
/* ------------------------------------------------------------------ */

/** Beat 1 — recognition. The hook has to land in the first ~1.5s. */
const DrawerScene: React.FC = () => (
  <AbsoluteFill style={{ backgroundColor: COLORS.obsidian }}>
    <KenBurnsImage
      src={staticFile('img/graded/collection.jpg')}
      direction="in"
      intensity={0.14}
      opacity={0.85}
    />
    <Scrim />
    <SafeStage>
      <AnimatedText delay={0} fontSize={88} weight={600} lineHeight={1.08}>
        There's a watch
        <br />
        in your father's
        <br />
        drawer.
      </AnimatedText>
    </SafeStage>
  </AbsoluteFill>
);

/** Beat 2 — specificity is what makes it feel personal rather than generic. */
const StoppedScene: React.FC = () => (
  <AbsoluteFill style={{ backgroundColor: COLORS.obsidian }}>
    <KenBurnsImage
      src={staticFile('img/graded/pocketwatch-hero.jpg')}
      direction="out"
      intensity={0.16}
      opacity={0.8}
    />
    <Scrim />
    <SafeStage gap={30}>
      <AnimatedText delay={0} fontSize={62} weight={400} lineHeight={1.22}>
        It stopped running
        <br />
        years ago.
      </AnimatedText>
      <AnimatedText
        delay={22}
        fontSize={46}
        font="serif"
        weight={600}
        color={COLORS.luxuryGold}
        lineHeight={1.25}
      >
        He still won't
        <br />
        throw it away.
      </AnimatedText>
    </SafeStage>
  </AbsoluteFill>
);

/** Beat 3 — name the emotional truth, then pivot to the practical gap. */
const WorthScene: React.FC = () => (
  <AbsoluteFill style={{ backgroundColor: COLORS.obsidian }}>
    <KenBurnsImage
      src={staticFile('img/graded/collection-alt.jpg')}
      direction="in"
      intensity={0.15}
      opacity={0.6}
    />
    <Scrim strength={1.15} />
    <SafeStage gap={26}>
      <AnimatedText
        delay={0}
        fontSize={44}
        font="sans"
        weight={300}
        color={`${COLORS.beige}CC`}
        lineHeight={1.35}
      >
        Because it was never
        <br />
        about the watch.
      </AnimatedText>
      <GoldRule delay={16} width={170} />
      <AnimatedText delay={22} fontSize={58} weight={600} lineHeight={1.18}>
        But most families
        <br />
        never find out
        <br />
        what it's worth.
      </AnimatedText>
    </SafeStage>
  </AbsoluteFill>
);

/** Beat 4 — the offer, in concrete verifiable steps. */
const OfferScene: React.FC = () => (
  <AbsoluteFill style={{ backgroundColor: COLORS.obsidian }}>
    <KenBurnsImage
      src={staticFile('img/graded/watchmaker.jpg')}
      direction="in"
      intensity={0.12}
      opacity={0.42}
    />
    <Scrim strength={1.35} />
    <SafeStage gap={22}>
      <AnimatedText
        delay={0}
        fontSize={25}
        font="sans"
        weight={700}
        color={COLORS.luxuryGold}
        letterSpacing="0.3em"
        textTransform="uppercase"
      >
        What we do
      </AnimatedText>
      <AnimatedText delay={8} fontSize={54} weight={600} lineHeight={1.2}>
        We authenticate it.
        <br />
        Verify what it is.
        <br />
        Find it a collector.
      </AnimatedText>
      <AnimatedText
        delay={30}
        fontSize={31}
        font="sans"
        weight={300}
        color={`${COLORS.beige}AA`}
        lineHeight={1.4}
        style={{ marginTop: 10 }}
      >
        Your identity stays private.
      </AnimatedText>
    </SafeStage>
  </AbsoluteFill>
);

/** Beat 5 — CTA framed as respect for the object, not a transaction. */
const HeirloomCta: React.FC = () => {
  return (
    <AbsoluteFill style={{ backgroundColor: COLORS.obsidian }}>
      <KenBurnsImage
        src={staticFile('img/graded/movement-macro.jpg')}
        direction="out"
        intensity={0.18}
        opacity={0.42}
      />
      <Scrim strength={1.2} />
      <AbsoluteFill
        style={{
          background: `radial-gradient(ellipse 55% 38% at 50% 44%, ${COLORS.luxuryGold}1F 0%, transparent 70%)`,
        }}
      />
      <SafeStage gap={24}>
        <AnimatedText delay={0} fontSize={70} weight={600} lineHeight={1.12}>
          An heirloom
          <br />
          deserves better
          <br />
          than a drawer.
        </AnimatedText>
        <GoldRule delay={20} width={200} />
        <AnimatedText
          delay={26}
          fontSize={38}
          font="sans"
          weight={600}
          color={COLORS.luxuryGold}
          style={{
            padding: '22px 48px',
            border: `2px solid ${COLORS.luxuryGold}`,
            borderRadius: 999,
            background: `${COLORS.luxuryGold}14`,
            marginTop: 16,
          }}
        >
          thecollectorsexchange.in
        </AnimatedText>
        <AnimatedText
          delay={36}
          fontSize={27}
          font="sans"
          weight={400}
          color={`${COLORS.beige}88`}
          letterSpacing="0.12em"
        >
          @the_collectors_exchange
        </AnimatedText>
      </SafeStage>
    </AbsoluteFill>
  );
};

/* ------------------------------------------------------------------ */
/*  COMPOSITION                                                        */
/* ------------------------------------------------------------------ */

const SCENES = [
  { component: DrawerScene, bars: 1.25 },
  { component: StoppedScene, bars: 1.5 },
  { component: WorthScene, bars: 1.5 },
  { component: OfferScene, bars: 1.75 },
  { component: HeirloomCta, bars: 1.5 },
] as const;

const DURATIONS = SCENES.map((s) => Math.round(s.bars * BAR));

export const HEIRLOOM_DURATION =
  DURATIONS.reduce((a, b) => a + b, 0) - TRANSITION * (SCENES.length - 1);

const STARTS: number[] = [];
{
  let cursor = 0;
  DURATIONS.forEach((d, i) => {
    STARTS.push(cursor);
    cursor += d - (i < SCENES.length - 1 ? TRANSITION : 0);
  });
}

export const HeirloomReel: React.FC = () => {
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

      {/* Sparse mix: this film is carried by the copy, so the music stays out
          of its way. No pulse, no melody, longer transitions. */}
      <MusicBed
        src={SFX.musicSparse}
        volume={0.44}
        fadeOutStart={durationInFrames - 55}
        totalFrames={durationInFrames}
      />
      {STARTS.slice(1).map((s, i) => (
        <Sfx key={`w${i}`} src={SFX.whoosh} at={s - 11} volume={0.2} />
      ))}
      <Sfx src={SFX.chime} at={STARTS[4] + 24} volume={0.28} />
    </AbsoluteFill>
  );
};
