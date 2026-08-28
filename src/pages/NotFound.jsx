import { Link } from 'react-router-dom';
import SEO from '../components/SEO';

// Mirrors the already-refined static 404.html (scripts/prerender-blogs.mjs,
// build404Html) — same dark obsidian backdrop, gold serif code, gradient
// rule, and rounded-full CTAs — so a user landing here via a bad in-app
// route (client-side, no full page load) sees the same considered page a
// crawler or direct hit gets from the prerendered shell, not a plain
// mismatched fallback.
const NotFound = () => (
  <div className="hero-bleed min-h-screen flex items-center justify-center bg-obsidian text-center px-6">
    <SEO title="Page Not Found" noindex />
    <div className="max-w-lg">
      <p className="font-serif text-luxury-gold leading-none text-[clamp(4rem,14vw,7rem)]">404</p>
      <div className="w-32 h-0.5 mx-auto my-7 bg-gradient-to-r from-transparent via-luxury-gold to-transparent" />
      <h1 className="font-serif text-white text-2xl sm:text-3xl font-semibold mb-4">
        This record could not be located.
      </h1>
      <p className="text-cream/60 leading-relaxed mb-10">
        The page you're looking for may have been moved, or the listing may have already found its
        collector.
      </p>
      <div className="flex flex-col sm:flex-row gap-4 justify-center">
        <Link
          to="/category"
          className="rounded-full bg-luxury-gold text-obsidian font-semibold px-8 py-4 text-[11px] uppercase tracking-[0.18em] transition-transform duration-300 hover:scale-[1.02] active:scale-[0.97]"
        >
          Browse The Exchange
        </Link>
        <Link
          to="/"
          className="rounded-full border border-luxury-gold/45 text-luxury-gold px-8 py-4 text-[11px] uppercase tracking-[0.18em] transition-colors hover:bg-luxury-gold/10"
        >
          Return Home
        </Link>
      </div>
    </div>
  </div>
);

export default NotFound;
