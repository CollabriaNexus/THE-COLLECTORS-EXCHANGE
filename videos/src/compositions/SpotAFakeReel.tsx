import React from 'react';
import {
  AbsoluteFill,
  staticFile,
  useCurrentFrame,
  useVideoConfig,
  spring,
  interpolate,
} from 'remotion';
import { TransitionSeries, linearTiming } from '@remotion/transitions';
import { fade } from '@remotion/transitions/fade';
import { loadFont as loadPlayfair } from '@remotion/google-fonts/PlayfairDisplay';
import { loadFont as loadInter } from '@remotion/google-fonts/Inter';
import { COLORS, FONTS } from '../brand';
import { AnimatedText, GoldRule } from '../components/AnimatedText';
import { KenBurnsImage } from '../components/KenBurnsImage';
import { SafeStage, Scrim } from '../components/Layout';
import { MusicBed, Sfx, SFX } from '../components/SoundLayer';

loadPlayfair();
loadInter();

/**
 * "3 Ways to Spot a Fake" — the educational / authority film.
 *
 * STRATEGY
 * Audience: the first-time buyer. Research surfaced counterfeit anxiety as the
 * single biggest blocker to a first vintage purchase in India, where the
 * in-person authentication network is still thin and most buying happens online.
 *
 * Why educational: on Instagram, teach-something content earns *saves* and
 * *sends*, which weigh more heavily for reach than likes. A viewer who saves
 * this has effectively bookmarked the brand against a future purchase.
 *
 * The close reframes the lesson as the product: you could learn to do this
 * yourself, or buy somewhere it's already been done. That converts the
 * education into a reason to trust the marketplace rather than a reason to
 * go shop elsewhere more carefully.
 *
 * Every tip below is factually accurate and independently checkable — the whole
 * film is an authority play, so a wrong claim would cost more than it earns.
 */

const BAR = 86;
const TRANSITION = 10; // snappier than the story film — this one should move

/* ------------------------------------------------------------------ */
/*  TIP CARD                                                           */
/* ------------------------------------------------------------------ */

const TipScene: React.FC<{
  number: string;
  title: string;
  body: string;
  image: string;
  direction?: 'in' | 'out';
}> = ({ number, title, body, image, direction = 'in' }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const numIn = spring({
    frame,
    fps,
    config: { damping: 200, stiffness: 120, mass: 0.4 },
  });

  return (
    <AbsoluteFill style={{ backgroundColor: COLORS.obsidian }}>
      {/* Held back further than the story films: these cards carry dense body
          copy, and busy gold detail behind small text kills legibility on a
          phone. The photograph is atmosphere here, not the subject. */}
      <KenBurnsImage
        src={staticFile(image)}
        direction={direction}
        intensity={0.14}
        opacity={0.48}
      />
      <Scrim strength={1.35} />
      <SafeStage gap={18}>
        {/* Oversized numeral anchors the "list" format that viewers recognise
            and stay for — they want to see all three. */}
        <div
          style={{
            fontFamily: FONTS.serif,
            fontSize: 150,
            fontWeight: 600,
            color: COLORS.luxuryGold,
            lineHeight: 1,
            opacity: interpolate(numIn, [0, 1], [0, 0.95]),
            transform: `scale(${interpolate(numIn, [0, 1], [0.6, 1])})`,
          }}
        >
          {number}
        </div>
        <GoldRule delay={6} width={130} />
        <AnimatedText
          delay={9}
          fontSize={66}
          weight={600}
          lineHeight={1.14}
          style={{ marginTop: 6 }}
        >
          {title}
        </AnimatedText>
        <AnimatedText
          delay={20}
          fontSize={36}
          font="sans"
          weight={400}
          color={`${COLORS.beige}EE`}
          lineHeight={1.44}
          maxWidth={840}
          style={{
            marginTop: 6,
            // Cheap insurance for legibility over any busy frame.
            textShadow: '0 2px 18px rgba(0,0,0,0.85)',
          }}
        >
          {body}
        </AnimatedText>
      </SafeStage>
    </AbsoluteFill>
  );
};

/* ------------------------------------------------------------------ */
/*  SCENES                                                             */
/* ------------------------------------------------------------------ */

const HookScene: React.FC = () => (
  <AbsoluteFill style={{ backgroundColor: COLORS.obsidian }}>
    <KenBurnsImage
      src={staticFile('img/graded/movement-macro-alt.jpg')}
      direction="in"
      intensity={0.18}
      opacity={0.75}
    />
    <Scrim />
    <SafeStage gap={22}>
      <AnimatedText delay={0} fontSize={92} weight={600} lineHeight={1.06}>
        3 ways to spot
        <br />
        a fake vintage
        <br />
        watch.
      </AnimatedText>
      <AnimatedText
        delay={22}
        fontSize={34}
        font="sans"
        weight={300}
        color={`${COLORS.beige}BB`}
        style={{ marginTop: 8 }}
      >
        Save this before you buy.
      </AnimatedText>
    </SafeStage>
  </AbsoluteFill>
);

/**
 * Tip 1 — the sweep test.
 * Accurate: a mechanical movement beats 6-10 times per second, so the seconds
 * hand appears to glide. Quartz advances once per second. Cheap counterfeits of
 * mechanical watches almost always hide a quartz movement, which this exposes
 * instantly and without tools.
 */
const Tip1: React.FC = () => (
  <TipScene
    number="01"
    title="Watch the seconds hand"
    body="A mechanical watch sweeps. Quartz ticks once a second. Most fakes hide a cheap quartz movement — this exposes it in seconds, no tools needed."
    image="img/graded/pocketwatch-hero.jpg"
  />
);

/**
 * Tip 2 — dial printing.
 * Accurate: genuine dial text is pad-printed or applied at high precision;
 * reproductions typically show fuzzy edges, uneven spacing and wrong fonts
 * under magnification.
 */
const Tip2: React.FC = () => (
  <TipScene
    number="02"
    title="Zoom in on the text"
    body="Genuine dial printing is razor sharp, even at high magnification. Fakes blur at the edges and get letter spacing subtly wrong."
    image="img/graded/collection.jpg"
    direction="out"
  />
);

/**
 * Tip 3 — the movement.
 * Accurate and the strongest single test: forgers replicate the visible dial
 * and case because that's what sells the photograph. Reproducing a period-correct
 * calibre with the right finishing and engravings is far harder, so a seller's
 * willingness to show the movement is itself a signal.
 */
const Tip3: React.FC = () => (
  <TipScene
    number="03"
    title="Ask to see the movement"
    body="Forgers copy the dial, because that's what sells the photo. Almost none get the movement right. A seller who won't show you inside is telling you something."
    image="img/graded/movement-macro.jpg"
  />
);

/** Close — convert the lesson into a reason to trust the marketplace. */
const FakeCta: React.FC = () => (
  <AbsoluteFill style={{ backgroundColor: COLORS.obsidian }}>
    <KenBurnsImage
      src={staticFile('img/graded/watchmaker.jpg')}
      direction="in"
      intensity={0.14}
      opacity={0.5}
    />
    <Scrim strength={1.2} />
    <AbsoluteFill
      style={{
        background: `radial-gradient(ellipse 55% 38% at 50% 44%, ${COLORS.luxuryGold}1F 0%, transparent 70%)`,
      }}
    />
    <SafeStage gap={22}>
      <AnimatedText delay={0} fontSize={62} weight={600} lineHeight={1.16}>
        Or skip the
        <br />
        guesswork.
      </AnimatedText>
      <GoldRule delay={14} width={180} />
      <AnimatedText
        delay={19}
        fontSize={35}
        font="sans"
        weight={300}
        color={`${COLORS.beige}CC`}
        lineHeight={1.42}
        maxWidth={860}
      >
        Every piece on The Collectors Exchange
        <br />
        is verified before it's listed.
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
          marginTop: 18,
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
  { component: HookScene, bars: 1.25 },
  { component: Tip1, bars: 1.5 },
  { component: Tip2, bars: 1.5 },
  { component: Tip3, bars: 1.5 },
  { component: FakeCta, bars: 1.5 },
] as const;

const DURATIONS = SCENES.map((s) => Math.round(s.bars * BAR));

export const SPOT_A_FAKE_DURATION =
  DURATIONS.reduce((a, b) => a + b, 0) - TRANSITION * (SCENES.length - 1);

const STARTS: number[] = [];
{
  let cursor = 0;
  DURATIONS.forEach((d, i) => {
    STARTS.push(cursor);
    cursor += d - (i < SCENES.length - 1 ? TRANSITION : 0);
  });
}

export const SpotAFakeReel: React.FC = () => {
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

      {/* Full mix here — this one should feel energetic and move quickly. */}
      <MusicBed
        volume={0.48}
        fadeOutStart={durationInFrames - 50}
        totalFrames={durationInFrames}
      />
      <Sfx src={SFX.impact} at={8} volume={0.3} />
      {/* A tick as each numeral lands, reinforcing the countdown feel. */}
      {[1, 2, 3].map((i) => (
        <Sfx key={`t${i}`} src={SFX.tick} at={STARTS[i] + 2} volume={0.3} />
      ))}
      {STARTS.slice(1).map((s, i) => (
        <Sfx key={`w${i}`} src={SFX.whoosh} at={s - 8} volume={0.24} />
      ))}
      <Sfx src={SFX.chime} at={STARTS[4] + 28} volume={0.3} />
    </AbsoluteFill>
  );
};
