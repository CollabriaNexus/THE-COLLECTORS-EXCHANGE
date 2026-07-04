// Using external placeholder image
import { Reveal, Parallax } from '../Motion';

const heroImgUrl =
  'https://images.unsplash.com/photo-1526045478516-99145907023c?auto=format&fit=crop&w=800&q=80';

const HeroManifesto = () => (
  <section className="grid md:grid-cols-2 items-center min-h-screen bg-obsidian text-white px-6 md:px-12 lg:px-24 snap-start">
    {/* Left side – number and copy */}
    <Reveal direction="left" blur className="space-y-6 sm:space-y-8 max-w-lg">
      <div className="text-2xl sm:text-3xl md:text-4xl font-serif uppercase tracking-widest text-brass">
        01 / PURPOSE
      </div>
      <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-serif font-bold">
        Preserving the Pieces That Matter.
      </h1>
      <p className="text-sm sm:text-base md:text-lg font-light leading-relaxed">
        We believe that every collector deserves more than just an object; they deserve a legacy
        they can trust. Finding your dream timepiece or a rare relic that honors the memory of your
        forefathers should not require endless hours lost in digital rabbit holes or navigating the
        unpredictable waves of unregulated local markets.
      </p>
      <p className="font-serif italic text-sm sm:text-base md:text-lg lg:text-xl mt-3 sm:mt-4">
        We exist to bridge the gap between the hunt and the heritage. By sourcing exclusively 100%
        original, verified, and authentic articles, we handle the heavy lifting of authentication
        and curation. You focus on what truly matters: keeping history close to your heart.
      </p>
    </Reveal>
    {/* Right side – macro image */}
    <Reveal
      direction="right"
      distance={90}
      blur
      className="flex items-center justify-center mt-8 sm:mt-12 md:mt-0"
    >
      <Parallax speed={0.1}>
        <img
          src={heroImgUrl}
          alt="Vintage watch movement macro"
          loading="lazy"
          width="800"
          height="800"
          className="max-w-full h-auto object-cover rounded-lg shadow-heritage"
        />
      </Parallax>
    </Reveal>
  </section>
);

export default HeroManifesto;
