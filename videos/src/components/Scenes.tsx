import React from 'react';
import {
  AbsoluteFill,
  useCurrentFrame,
  useVideoConfig,
  spring,
  interpolate,
  Img,
  staticFile,
} from 'remotion';
import { COLORS, FONTS } from '../brand';
import { AnimatedText, GoldRule } from './AnimatedText';
import { KenBurnsImage } from './KenBurnsImage';
import { SafeStage, Scrim } from './Layout';

/* ------------------------------------------------------------------ */
/*  SCENE 1 — HOOK                                                     */
/* ------------------------------------------------------------------ */

export const HookScene: React.FC = () => {
  return (
    <AbsoluteFill style={{ backgroundColor: COLORS.obsidian }}>
      <KenBurnsImage
        src={staticFile('img/graded/pocketwatch-hero.jpg')}
        direction="in"
        intensity={0.16}
      />
      <Scrim />
      <SafeStage>
        <AnimatedText
          delay={2}
          fontSize={25}
          font="sans"
          weight={700}
          color={COLORS.luxuryGold}
          letterSpacing="0.36em"
          textTransform="uppercase"
        >
          India
        </AnimatedText>
        <GoldRule delay={7} width={150} />
        <AnimatedText delay={10} fontSize={94} weight={600} lineHeight={1.06}>
          Every vintage
          <br />
          watch has
          <br />
          a story.
        </AnimatedText>
        <AnimatedText
          delay={30}
          fontSize={39}
          font="sans"
          weight={300}
          color={`${COLORS.beige}CC`}
          lineHeight={1.4}
          maxWidth={820}
          style={{ marginTop: 6 }}
        >
          Most of them can't be verified.
        </AnimatedText>
      </SafeStage>
    </AbsoluteFill>
  );
};

/* ------------------------------------------------------------------ */
/*  SCENE 2 — BRAND REVEAL                                             */
/* ------------------------------------------------------------------ */

export const BrandScene: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const logoIn = spring({
    frame: frame - 4,
    fps,
    config: { damping: 200, stiffness: 75, mass: 0.7 },
  });

  // Ring sweeps around the medallion as it lands.
  const ringDash = interpolate(logoIn, [0, 1], [760, 0]);

  return (
    <AbsoluteFill style={{ backgroundColor: COLORS.obsidian }}>
      <KenBurnsImage
        src={staticFile('img/graded/movement-macro.jpg')}
        direction="out"
        intensity={0.14}
        opacity={0.42}
      />
      <Scrim strength={1.1} />
      <SafeStage gap={26}>
        {/* Logo presented as a struck medallion — the circular crop makes the
            logo's own light background read as intentional, not a pasted box. */}
        <div
          style={{
            position: 'relative',
            width: 260,
            height: 260,
            transform: `scale(${interpolate(logoIn, [0, 1], [0.7, 1])})`,
            opacity: logoIn,
          }}
        >
          <div
            style={{
              position: 'absolute',
              inset: 0,
              borderRadius: '50%',
              overflow: 'hidden',
              // The logo art sits on its own light ground; matching that colour
              // turns the circular crop into a deliberate medallion instead of
              // a pasted rectangle. `contain` keeps the full seal visible —
              // `cover` was clipping the lettering around its edge.
              background: COLORS.cream,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              boxShadow: `0 0 70px ${COLORS.luxuryGold}44`,
            }}
          >
            <Img
              src={staticFile('img/logo-trimmed.png')}
              style={{
                width: '82%',
                height: '82%',
                objectFit: 'contain',
              }}
            />
          </div>
          <svg
            width={260}
            height={260}
            style={{ position: 'absolute', inset: 0, transform: 'rotate(-90deg)' }}
          >
            <circle
              cx={130}
              cy={130}
              r={126}
              fill="none"
              stroke={COLORS.luxuryGold}
              strokeWidth={3}
              strokeDasharray={792}
              strokeDashoffset={ringDash}
            />
          </svg>
        </div>

        <AnimatedText delay={20} fontSize={68} weight={600} lineHeight={1.08}>
          The Collectors
          <br />
          Exchange
        </AnimatedText>
        <GoldRule delay={32} width={180} />
        <AnimatedText
          delay={36}
          fontSize={36}
          font="sans"
          weight={300}
          color={`${COLORS.beige}DD`}
          lineHeight={1.45}
          maxWidth={880}
        >
          India's marketplace for authenticated
          <br />
          vintage watches &amp; rare collectibles.
        </AnimatedText>
      </SafeStage>
    </AbsoluteFill>
  );
};

/* ------------------------------------------------------------------ */
/*  SCENE 3 — VALUE PROPS                                              */
/* ------------------------------------------------------------------ */

const PILLARS = [
  { title: 'Expert Verified', body: 'Authenticated before it is ever listed.' },
  { title: 'Vetted Sellers', body: 'KYC-checked. No anonymous listings.' },
  { title: '48-Hour Returns', body: 'Not as described? Send it back.' },
];

const PillarRow: React.FC<{ title: string; body: string; delay: number }> = ({
  title,
  body,
  delay,
}) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const p = spring({
    frame: frame - delay,
    fps,
    config: { damping: 200, stiffness: 110, mass: 0.4 },
  });

  return (
    <div
      style={{
        display: 'flex',
        alignItems: 'center',
        gap: 26,
        width: '100%',
        transform: `translateX(${interpolate(p, [0, 1], [-44, 0])}px)`,
        opacity: p,
      }}
    >
      <div
        style={{
          width: 66,
          height: 66,
          borderRadius: '50%',
          border: `2px solid ${COLORS.luxuryGold}`,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          flexShrink: 0,
          background: `${COLORS.luxuryGold}18`,
        }}
      >
        <svg width="32" height="32" viewBox="0 0 24 24" fill="none">
          <path
            d="M20 6L9 17l-5-5"
            stroke={COLORS.luxuryGold}
            strokeWidth="2.5"
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeDasharray={30}
            strokeDashoffset={interpolate(p, [0.35, 1], [30, 0], {
              extrapolateLeft: 'clamp',
              extrapolateRight: 'clamp',
            })}
          />
        </svg>
      </div>
      <div style={{ flex: 1 }}>
        <div
          style={{
            fontFamily: FONTS.serif,
            fontSize: 45,
            fontWeight: 600,
            color: COLORS.white,
            marginBottom: 5,
            lineHeight: 1.14,
          }}
        >
          {title}
        </div>
        <div
          style={{
            fontFamily: FONTS.sans,
            fontSize: 28,
            fontWeight: 300,
            color: `${COLORS.beige}A8`,
            lineHeight: 1.35,
          }}
        >
          {body}
        </div>
      </div>
    </div>
  );
};

export const ValueScene: React.FC = () => {
  return (
    <AbsoluteFill style={{ backgroundColor: COLORS.obsidian }}>
      <KenBurnsImage
        src={staticFile('img/graded/watchmaker.jpg')}
        direction="in"
        intensity={0.13}
        opacity={0.55}
      />
      <Scrim strength={1.15} />
      <SafeStage gap={0}>
        <AnimatedText
          delay={0}
          fontSize={25}
          font="sans"
          weight={700}
          color={COLORS.luxuryGold}
          letterSpacing="0.32em"
          textTransform="uppercase"
        >
          What you get
        </AnimatedText>
        <div
          style={{
            display: 'flex',
            flexDirection: 'column',
            gap: 42,
            width: '100%',
            marginTop: 44,
          }}
        >
          {PILLARS.map((p, i) => (
            <PillarRow
              key={p.title}
              title={p.title}
              body={p.body}
              delay={8 + i * 14}
            />
          ))}
        </div>
      </SafeStage>
    </AbsoluteFill>
  );
};

/* ------------------------------------------------------------------ */
/*  SCENE 4 — CATEGORY BREADTH                                         */
/* ------------------------------------------------------------------ */

const CATEGORIES = [
  'Timepieces',
  'Antiques',
  'Jewelry',
  'Collectibles',
  'Accessories',
  'Pop Culture',
];

export const CategoriesScene: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  return (
    <AbsoluteFill style={{ backgroundColor: COLORS.obsidian }}>
      <KenBurnsImage
        src={staticFile('img/graded/collection.jpg')}
        direction="in"
        intensity={0.15}
        opacity={0.5}
      />
      <Scrim strength={1.1} />
      <SafeStage gap={20}>
        <AnimatedText
          delay={0}
          fontSize={25}
          font="sans"
          weight={700}
          color={COLORS.luxuryGold}
          letterSpacing="0.32em"
          textTransform="uppercase"
        >
          Browse the Exchange
        </AnimatedText>
        <GoldRule delay={5} width={140} />
        <div
          style={{
            display: 'flex',
            flexWrap: 'wrap',
            gap: 17,
            justifyContent: 'center',
            marginTop: 22,
          }}
        >
          {CATEGORIES.map((c, i) => {
            const p = spring({
              frame: frame - (8 + i * 5),
              fps,
              config: { damping: 200, stiffness: 140, mass: 0.35 },
            });
            return (
              <div
                key={c}
                style={{
                  fontFamily: FONTS.sans,
                  fontSize: 32,
                  fontWeight: 400,
                  color: COLORS.beige,
                  padding: '18px 34px',
                  border: `1px solid ${COLORS.luxuryGold}70`,
                  borderRadius: 999,
                  background: `${COLORS.charcoal}CC`,
                  transform: `scale(${interpolate(p, [0, 1], [0.82, 1])})`,
                  opacity: p,
                  whiteSpace: 'nowrap',
                }}
              >
                {c}
              </div>
            );
          })}
        </div>
      </SafeStage>
    </AbsoluteFill>
  );
};

/* ------------------------------------------------------------------ */
/*  SCENE 5 — CTA                                                      */
/* ------------------------------------------------------------------ */

export const CtaScene: React.FC = () => {
  const frame = useCurrentFrame();
  const pulse = 1 + Math.sin(frame / 8) * 0.016;

  return (
    <AbsoluteFill style={{ backgroundColor: COLORS.obsidian }}>
      <KenBurnsImage
        src={staticFile('img/graded/collection-alt.jpg')}
        direction="out"
        intensity={0.18}
        opacity={0.4}
      />
      <Scrim strength={1.2} />
      <AbsoluteFill
        style={{
          background: `radial-gradient(ellipse 55% 38% at 50% 44%, ${COLORS.luxuryGold}1F 0%, transparent 70%)`,
        }}
      />
      <SafeStage gap={22}>
        <AnimatedText delay={2} fontSize={82} weight={600} lineHeight={1.08}>
          Start your
          <br />
          collection.
        </AnimatedText>
        <GoldRule delay={14} width={200} />
        <AnimatedText
          delay={19}
          fontSize={33}
          font="sans"
          weight={300}
          color={`${COLORS.beige}CC`}
          lineHeight={1.45}
        >
          Verified pieces. Trusted sellers.
        </AnimatedText>

        <div style={{ transform: `scale(${pulse})`, marginTop: 26 }}>
          <AnimatedText
            delay={28}
            fontSize={40}
            font="sans"
            weight={600}
            color={COLORS.luxuryGold}
            style={{
              padding: '24px 52px',
              border: `2px solid ${COLORS.luxuryGold}`,
              borderRadius: 999,
              background: `${COLORS.luxuryGold}14`,
            }}
          >
            thecollectorsexchange.in
          </AnimatedText>
        </div>

        <AnimatedText
          delay={38}
          fontSize={27}
          font="sans"
          weight={400}
          color={`${COLORS.beige}88`}
          letterSpacing="0.12em"
          style={{ marginTop: 12 }}
        >
          @the_collectors_exchange
        </AnimatedText>
      </SafeStage>
    </AbsoluteFill>
  );
};
