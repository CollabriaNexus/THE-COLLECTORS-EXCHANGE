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
 * "HMT — India's forgotten heirloom" — the category-desire film.
 *
 * STRATEGY
 * TCE's live inventory is currently 17 products, every one of them in the
 * Timepieces category, and most Indian vintage watch stock is HMT. So this film
 * builds appetite for the category the marketplace can actually fulfil rather
 * than advertising anything it doesn't hold. It is also the most culturally
 * resonant story available in this market: HMT is the watch a very large number
 * of Indian families already own without knowing what it is.
 *
 * Shape: heritage (1961) → cultural memory (the retirement gift) → texture (the
 * model names) → craft (the calibre) → scarcity (production has ended) → trust.
 * The scarcity beat is the engine — desire for a category with a hard supply
 * ceiling is durable in a way that a discount never is.
 *
 * CLAIMS DISCIPLINE
 * Every historical statement below is independently checkable: the Bangalore
 * watch division and the Citizen collaboration (1961), the retirement-gift
 * tradition, the Janata / Pilot / Sona models, the hand-wound calibre 0231 with
 * 17 jewels and HMT's own Parashock, and the closure of the last factory at
 * Tumakuru on 1 May 2016.
 *
 * Deliberately NOT claimed: that TCE has any specific HMT model in stock, any
 * price, any valuation, or any repair/restoration service. TCE authenticates
 * and brokers — the close says only that, plus the verified policy facts
 * (authentication before listing, KYC-checked sellers, 48-hour returns).
 */

const BAR = 86; // 84 BPM @ 30fps — cuts land on downbeats
const TRANSITION = 14; // between the story film (16) and the teach film (10)

/* ------------------------------------------------------------------ */
/*  SCENES                                                             */
/* ------------------------------------------------------------------ */

/**
 * Beat 1 — the hook is a curiosity gap, not an emotion: a whole domestic watch
 * industry, stated in the past tense. "Then the last factory closed" is paid
 * off in beat 5, which is what buys the middle of the film.
 */
const HeritageScene: React.FC = () => (
  <AbsoluteFill style={{ backgroundColor: COLORS.obsidian }}>
    <KenBurnsImage
      src={staticFile('img/graded/movement-macro-alt.jpg')}
      direction="in"
      intensity={0.16}
      opacity={0.66}
    />
    <Scrim />
    <SafeStage gap={20}>
      <AnimatedText delay={0} fontSize={82} weight={600} lineHeight={1.08}>
        India made its own
        <br />
        mechanical watches
        <br />
        for 55 years.
      </AnimatedText>
      <AnimatedText
        delay={24}
        fontSize={34}
        font="sans"
        weight={300}
        color={`${COLORS.beige}BB`}
        style={{ marginTop: 8, textShadow: '0 2px 18px rgba(0,0,0,0.85)' }}
      >
        It started in Bangalore, 1961.
      </AnimatedText>
    </SafeStage>
  </AbsoluteFill>
);

/**
 * Beat 2 — name the maker, then immediately give the viewer the reason they
 * already have a personal connection to it. The retirement-gift tradition is
 * the fact that converts a history lesson into a memory.
 */
const OriginScene: React.FC = () => (
  <AbsoluteFill style={{ backgroundColor: COLORS.obsidian }}>
    {/* Three text blocks over a face — held well back so the copy wins. */}
    <KenBurnsImage
      src={staticFile('img/graded/watchmaker.jpg')}
      direction="in"
      intensity={0.13}
      opacity={0.45}
    />
    <Scrim strength={1.32} />
    <SafeStage gap={20}>
      <AnimatedText
        delay={0}
        fontSize={24}
        font="sans"
        weight={700}
        color={COLORS.luxuryGold}
        letterSpacing="0.3em"
        textTransform="uppercase"
      >
        Hindustan Machine Tools
      </AnimatedText>
      <AnimatedText delay={7} fontSize={56} weight={600} lineHeight={1.18}>
        A watch division, built
        <br />
        with Citizen of Japan.
      </AnimatedText>
      <AnimatedText
        delay={24}
        fontSize={31}
        font="sans"
        weight={300}
        color={`${COLORS.beige}CC`}
        lineHeight={1.44}
        maxWidth={840}
        style={{ marginTop: 4, textShadow: '0 2px 18px rgba(0,0,0,0.85)' }}
      >
        {/* Line broken by hand: left to wrap it orphans a single word. */}
        For decades it was the retirement gift for
        <br />
        government and public-sector employees.
      </AnimatedText>
    </SafeStage>
  </AbsoluteFill>
);

/**
 * Beat 3 — the model names. Insider texture: these are the words a collector
 * searches for, and the words a family recognises off the dial in the drawer.
 */
const NamesScene: React.FC = () => (
  <AbsoluteFill style={{ backgroundColor: COLORS.obsidian }}>
    <KenBurnsImage
      src={staticFile('img/graded/collection.jpg')}
      direction="out"
      intensity={0.15}
      opacity={0.5}
    />
    <Scrim strength={1.28} />
    <SafeStage gap={18}>
      <AnimatedText
        delay={0}
        fontSize={24}
        font="sans"
        weight={700}
        color={COLORS.luxuryGold}
        letterSpacing="0.3em"
        textTransform="uppercase"
      >
        The models
      </AnimatedText>
      <AnimatedText
        delay={7}
        fontSize={64}
        weight={600}
        color={COLORS.luxuryGold}
        lineHeight={1.2}
      >
        Janata. Pilot. Sona.
      </AnimatedText>
      <AnimatedText
        delay={22}
        fontSize={31}
        font="sans"
        weight={400}
        color={`${COLORS.beige}EE`}
        lineHeight={1.44}
        maxWidth={840}
        style={{ marginTop: 4, textShadow: '0 2px 18px rgba(0,0,0,0.85)' }}
      >
        {/* One gloss per name, one line each, in the same order as the
            headline — so the mapping is readable at a glance. */}
        &ldquo;The people.&rdquo;
        <br />
        A black dial with luminous numerals.
        <br />
        A gold-toned dress watch.
      </AnimatedText>
    </SafeStage>
  </AbsoluteFill>
);

/** Beat 4 — the calibre. Specificity is the whole reason this reads as expert. */
const CaliberScene: React.FC = () => (
  <AbsoluteFill style={{ backgroundColor: COLORS.obsidian }}>
    <KenBurnsImage
      src={staticFile('img/graded/movement-macro.jpg')}
      direction="in"
      intensity={0.16}
      opacity={0.5}
    />
    <Scrim strength={1.3} />
    <SafeStage gap={20}>
      <AnimatedText delay={0} fontSize={60} weight={600} lineHeight={1.2}>
        Caliber 0231.
        <br />
        17 jewels.
        <br />
        Hand-wound.
      </AnimatedText>
      <GoldRule delay={20} width={160} />
      <AnimatedText
        delay={26}
        fontSize={31}
        font="sans"
        weight={300}
        color={`${COLORS.beige}CC`}
        lineHeight={1.44}
        maxWidth={820}
        style={{ textShadow: '0 2px 18px rgba(0,0,0,0.85)' }}
      >
        The movement inside most hand-wound HMTs, with the company's own
        Parashock shock protection.
      </AnimatedText>
    </SafeStage>
  </AbsoluteFill>
);

/**
 * Beat 5 — scarcity, stated as fact rather than as a sales line. Production
 * has ended, so the supply is closed. This is the beat that creates want.
 */
const FiniteScene: React.FC = () => (
  <AbsoluteFill style={{ backgroundColor: COLORS.obsidian }}>
    <KenBurnsImage
      src={staticFile('img/graded/pocketwatch-hero.jpg')}
      direction="out"
      intensity={0.14}
      opacity={0.44}
    />
    {/* The brightest photograph in the film (a white enamel dial) sits directly
        behind this copy, so it gets the heaviest scrim. */}
    <Scrim strength={1.36} />
    <SafeStage gap={20}>
      <AnimatedText delay={0} fontSize={58} weight={600} lineHeight={1.18}>
        The last factory closed
        <br />
        on 1 May 2016.
      </AnimatedText>
      <AnimatedText
        delay={18}
        fontSize={32}
        font="sans"
        weight={300}
        color={`${COLORS.beige}CC`}
        lineHeight={1.44}
        maxWidth={840}
        style={{ textShadow: '0 2px 18px rgba(0,0,0,0.85)' }}
      >
        Production has ended.
        <br />
        What exists is all there will ever be.
      </AnimatedText>
      <AnimatedText
        delay={34}
        fontSize={42}
        weight={600}
        color={COLORS.luxuryGold}
        style={{ marginTop: 6 }}
      >
        Collectors noticed.
      </AnimatedText>
    </SafeStage>
  </AbsoluteFill>
);

/** Beat 6 — CTA. Scarcity raises the stakes on provenance, so trust is the close. */
const HmtCta: React.FC = () => (
  <AbsoluteFill style={{ backgroundColor: COLORS.obsidian }}>
    <KenBurnsImage
      src={staticFile('img/graded/collection-alt.jpg')}
      direction="in"
      intensity={0.14}
      opacity={0.45}
    />
    <Scrim strength={1.24} />
    <AbsoluteFill
      style={{
        background: `radial-gradient(ellipse 55% 38% at 50% 44%, ${COLORS.luxuryGold}1F 0%, transparent 70%)`,
      }}
    />
    <SafeStage gap={22}>
      <AnimatedText delay={0} fontSize={62} weight={600} lineHeight={1.16}>
        So it matters who
        <br />
        you buy one from.
      </AnimatedText>
      <GoldRule delay={14} width={180} />
      <AnimatedText
        delay={19}
        fontSize={33}
        font="sans"
        weight={300}
        color={`${COLORS.beige}CC`}
        lineHeight={1.42}
        maxWidth={860}
        style={{ textShadow: '0 2px 18px rgba(0,0,0,0.85)' }}
      >
        Every piece authenticated before it's listed.
        <br />
        KYC-checked sellers. 48-hour returns.
      </AnimatedText>
      <AnimatedText
        delay={30}
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
        delay={40}
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

/* ------------------------------------------------------------------ */
/*  COMPOSITION                                                        */
/* ------------------------------------------------------------------ */

const SCENES = [
  { component: HeritageScene, bars: 1.25 },
  { component: OriginScene, bars: 1.25 },
  { component: NamesScene, bars: 1.25 },
  { component: CaliberScene, bars: 1.25 },
  { component: FiniteScene, bars: 1.25 },
  { component: HmtCta, bars: 1.5 },
] as const;

const DURATIONS = SCENES.map((s) => Math.round(s.bars * BAR));

export const HMT_DURATION =
  DURATIONS.reduce((a, b) => a + b, 0) - TRANSITION * (SCENES.length - 1);

const STARTS: number[] = [];
{
  let cursor = 0;
  DURATIONS.forEach((d, i) => {
    STARTS.push(cursor);
    cursor += d - (i < SCENES.length - 1 ? TRANSITION : 0);
  });
}

export const HmtReel: React.FC = () => {
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

      {/* Sparse mix, same reasoning as the story film: this one is carried by
          its facts, and it is reflective rather than energetic. The full mix's
          counter-melody and pulse would push a piece of cultural memory toward
          advertising, and would compete with dense on-screen copy. */}
      <MusicBed
        src={SFX.musicSparse}
        volume={0.44}
        fadeOutStart={durationInFrames - 55}
        totalFrames={durationInFrames}
      />
      {STARTS.slice(1).map((s, i) => (
        <Sfx key={`w${i}`} src={SFX.whoosh} at={s - 10} volume={0.2} />
      ))}
      {/* A single tick as the calibre lands — the only mechanical sound in the
          film, on the only scene that is about the mechanism. */}
      <Sfx src={SFX.tick} at={STARTS[3] + 3} volume={0.28} />
      <Sfx src={SFX.chime} at={STARTS[5] + 24} volume={0.28} />
    </AbsoluteFill>
  );
};
