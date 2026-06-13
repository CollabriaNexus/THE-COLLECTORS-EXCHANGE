import React from 'react';
import HeroManifesto from '../components/About/HeroManifesto';
import MissionValues from '../components/About/MissionValues';
import Genesis from '../components/About/Genesis';
import OdysseyTimeline from '../components/About/OdysseyTimeline';
import SEO from '../components/SEO';

const AboutUs = () => {
  return (
    <div className="font-sans text-text-main">
      <SEO
        title="About Us"
        description="Discover the story behind The Collectors Exchange — a curated marketplace for authentic pre-owned collectibles, antiques, and limited pieces. Explore our mission, values, and journey."
        canonical="/about-us"
      />
      <HeroManifesto />
      <MissionValues />
      <Genesis />
      <OdysseyTimeline />
    </div>
  );
};

export default AboutUs;
