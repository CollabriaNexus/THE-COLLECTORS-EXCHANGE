import React, { useState, useEffect, useRef } from 'react';

/**
 * Heritage Motion System
 * Dependency-free scroll animations tuned for a luxury feel:
 * weighted easing, directional reveals, staggered cascades, subtle parallax,
 * and count-ups. Everything degrades to instant/visible under prefers-reduced-motion.
 */

const reduceMotion = () =>
  typeof window !== 'undefined' &&
  window.matchMedia &&
  window.matchMedia('(prefers-reduced-motion: reduce)').matches;

// One-shot in-view hook. Triggers slightly before the element is fully in view so
// the motion feels anticipatory rather than late.
export function useReveal({ threshold = 0.15, rootMargin = '0px 0px -8% 0px', once = true } = {}) {
  const ref = useRef(null);
  const [inView, setInView] = useState(() => reduceMotion());

  useEffect(() => {
    const el = ref.current;
    if (!el || reduceMotion()) return;
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setInView(true);
          if (once) observer.unobserve(el);
        } else if (!once) {
          setInView(false);
        }
      },
      { threshold, rootMargin },
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, [threshold, rootMargin, once]);

  return [ref, inView];
}

const hiddenTransform = (direction, distance) =>
  ({
    // a touch of scale on top of the slide gives the motion more weight/drama
    up: `translate3d(0, ${distance}px, 0) scale(0.97)`,
    down: `translate3d(0, -${distance}px, 0) scale(0.97)`,
    // named by the side the element ENTERS from
    right: `translate3d(${distance}px, 0, 0) scale(0.97)`,
    left: `translate3d(-${distance}px, 0, 0) scale(0.97)`,
    scale: 'scale(0.9)',
    none: 'none',
  })[direction] || `translate3d(0, ${distance}px, 0) scale(0.97)`;

/**
 * Reveal — fades + glides (and optionally focus-blurs) its children into place as
 * they scroll into view. Bolder, more cinematic defaults.
 * direction: up | down | left | right | scale | none  (named by the side it enters from)
 */
export function Reveal({
  children,
  as: Tag = 'div',
  direction = 'up',
  distance = 64,
  duration = 950,
  delay = 0,
  threshold = 0.15,
  blur = false,
  className = '',
  style = {},
  ...rest
}) {
  const [ref, inView] = useReveal({ threshold });
  const merged = {
    transitionProperty: 'opacity, transform, filter',
    transitionDuration: `${duration}ms`,
    transitionTimingFunction: 'var(--ease-heritage, cubic-bezier(0.22, 1, 0.36, 1))',
    transitionDelay: `${delay}ms`,
    opacity: inView ? 1 : 0,
    transform: inView ? 'translate3d(0,0,0) scale(1)' : hiddenTransform(direction, distance),
    filter: inView || !blur ? 'blur(0px)' : 'blur(12px)',
    willChange: 'opacity, transform, filter',
    ...style,
  };
  return (
    <Tag ref={ref} className={className} style={merged} {...rest}>
      {children}
    </Tag>
  );
}

/**
 * Stagger — wraps each direct child in a Reveal with an incrementing delay,
 * producing a curated one-by-one cascade. Pass the layout classes (e.g. a grid)
 * via `className`; each child keeps its own styling.
 */
export function Stagger({
  children,
  step = 90,
  baseDelay = 0,
  direction = 'up',
  distance = 40,
  duration = 800,
  className = '',
  childClassName = '',
  as: Tag = 'div',
  ...rest
}) {
  const items = React.Children.toArray(children);
  return (
    <Tag className={className} {...rest}>
      {items.map((child, i) => (
        <Reveal
          key={child.key ?? i}
          direction={direction}
          distance={distance}
          duration={duration}
          delay={baseDelay + i * step}
          className={childClassName}
        >
          {child}
        </Reveal>
      ))}
    </Tag>
  );
}

/**
 * Parallax — translates its content against the scroll for depth.
 * Positive speed moves the layer slower than the page (recedes). Disabled on
 * small screens and under reduced-motion, where it renders as a plain wrapper.
 */
export function Parallax({ children, speed = 0.12, className = '', ...rest }) {
  const ref = useRef(null);
  useEffect(() => {
    const el = ref.current;
    if (!el || reduceMotion()) return;
    if (!window.matchMedia('(min-width: 768px)').matches) return;

    let raf = 0;
    const update = () => {
      raf = 0;
      const rect = el.getBoundingClientRect();
      const fromCenter = rect.top + rect.height / 2 - window.innerHeight / 2;
      el.style.transform = `translate3d(0, ${(-fromCenter * speed).toFixed(2)}px, 0)`;
    };
    const onScroll = () => {
      if (!raf) raf = requestAnimationFrame(update);
    };
    update();
    window.addEventListener('scroll', onScroll, { passive: true });
    window.addEventListener('resize', onScroll, { passive: true });
    return () => {
      window.removeEventListener('scroll', onScroll);
      window.removeEventListener('resize', onScroll);
      if (raf) cancelAnimationFrame(raf);
      el.style.transform = '';
    };
  }, [speed]);

  return (
    <div ref={ref} className={className} style={{ willChange: 'transform' }} {...rest}>
      {children}
    </div>
  );
}

const hoverCapable = () =>
  typeof window !== 'undefined' &&
  window.matchMedia &&
  window.matchMedia('(hover: hover) and (pointer: fine)').matches;

/**
 * Magnetic — the child gently pulls toward the cursor, springing back on leave.
 * Great for hero CTAs. No-op on touch / reduced-motion.
 */
export function Magnetic({ children, strength = 0.4, className = '' }) {
  const ref = useRef(null);
  useEffect(() => {
    const el = ref.current;
    if (!el || reduceMotion() || !hoverCapable()) return;
    const onMove = (e) => {
      const r = el.getBoundingClientRect();
      const x = e.clientX - (r.left + r.width / 2);
      const y = e.clientY - (r.top + r.height / 2);
      el.style.transform = `translate(${(x * strength).toFixed(1)}px, ${(y * strength).toFixed(1)}px)`;
    };
    const onLeave = () => {
      el.style.transform = 'translate(0, 0)';
    };
    el.addEventListener('mousemove', onMove);
    el.addEventListener('mouseleave', onLeave);
    return () => {
      el.removeEventListener('mousemove', onMove);
      el.removeEventListener('mouseleave', onLeave);
    };
  }, [strength]);
  return (
    <span
      ref={ref}
      className={`inline-block transition-transform duration-300 ease-out will-change-transform ${className}`}
    >
      {children}
    </span>
  );
}

/**
 * Tilt — 3D-tilts its child toward the cursor for a tactile, premium hover.
 * No-op on touch / reduced-motion.
 */
export function Tilt({ children, max = 8, className = '', style = {} }) {
  const ref = useRef(null);
  useEffect(() => {
    const el = ref.current;
    if (!el || reduceMotion() || !hoverCapable()) return;
    const onMove = (e) => {
      const r = el.getBoundingClientRect();
      const px = (e.clientX - r.left) / r.width - 0.5;
      const py = (e.clientY - r.top) / r.height - 0.5;
      el.style.transform = `perspective(900px) rotateX(${(-py * max).toFixed(2)}deg) rotateY(${(px * max).toFixed(2)}deg)`;
    };
    const onLeave = () => {
      el.style.transform = 'perspective(900px) rotateX(0deg) rotateY(0deg)';
    };
    el.addEventListener('mousemove', onMove);
    el.addEventListener('mouseleave', onLeave);
    return () => {
      el.removeEventListener('mousemove', onMove);
      el.removeEventListener('mouseleave', onLeave);
    };
  }, [max]);
  return (
    <div
      ref={ref}
      className={`transition-transform duration-300 ease-out will-change-transform ${className}`}
      style={style}
    >
      {children}
    </div>
  );
}

/**
 * Marquee — seamless horizontal ticker of words/phrases with a gold diamond
 * separator. Pauses on hover.
 */
export function Marquee({ items = [], duration = 32, className = '', itemClassName = '' }) {
  const strip = (
    <div className="flex shrink-0 items-center" aria-hidden="true">
      {items.map((t, i) => (
        <span key={i} className="flex items-center">
          <span className={`px-6 md:px-10 whitespace-nowrap ${itemClassName}`}>{t}</span>
          <span className="text-luxury-gold text-[8px]">◆</span>
        </span>
      ))}
    </div>
  );
  return (
    <div className={`group flex overflow-hidden ${className}`}>
      <div
        className="flex animate-marquee-x group-hover:[animation-play-state:paused]"
        style={{ animationDuration: `${duration}s` }}
      >
        {strip}
        {strip}
      </div>
    </div>
  );
}

/**
 * ScrollProgress — a thin bar that fills left→right with page scroll.
 */
export function ScrollProgress({ className = '' }) {
  const fillRef = useRef(null);
  useEffect(() => {
    const fill = fillRef.current;
    if (!fill) return;
    let raf = 0;
    const update = () => {
      raf = 0;
      const h = document.documentElement;
      const max = h.scrollHeight - h.clientHeight;
      const p = max > 0 ? Math.min(Math.max(h.scrollTop / max, 0), 1) : 0;
      fill.style.transform = `scaleX(${p.toFixed(4)})`;
    };
    const onScroll = () => {
      if (!raf) raf = requestAnimationFrame(update);
    };
    update();
    window.addEventListener('scroll', onScroll, { passive: true });
    window.addEventListener('resize', onScroll, { passive: true });
    return () => {
      window.removeEventListener('scroll', onScroll);
      window.removeEventListener('resize', onScroll);
      if (raf) cancelAnimationFrame(raf);
    };
  }, []);
  return (
    <div
      className={`fixed top-0 left-0 right-0 h-[3px] z-[80] pointer-events-none bg-transparent ${className}`}
    >
      <div
        ref={fillRef}
        className="h-full origin-left bg-gradient-to-r from-luxury-gold via-[#f0d68a] to-luxury-gold"
        style={{ transform: 'scaleX(0)' }}
      />
    </div>
  );
}

/**
 * CountUp — animates a number up to `end` when it scrolls into view.
 */
export function CountUp({ end = 0, duration = 1600, prefix = '', suffix = '', className = '' }) {
  const [ref, inView] = useReveal({ threshold: 0.4 });
  const [value, setValue] = useState(() => (reduceMotion() ? end : 0));

  useEffect(() => {
    if (!inView || reduceMotion()) {
      setValue(end);
      return;
    }
    let raf = 0;
    let startTs = 0;
    const tick = (ts) => {
      if (!startTs) startTs = ts;
      const p = Math.min((ts - startTs) / duration, 1);
      const eased = 1 - Math.pow(1 - p, 3); // easeOutCubic
      setValue(Math.round(end * eased));
      if (p < 1) raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [inView, end, duration]);

  return (
    <span ref={ref} className={className}>
      {prefix}
      {value.toLocaleString('en-IN')}
      {suffix}
    </span>
  );
}
