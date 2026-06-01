import React from 'react';
import HeroManifesto from '../components/About/HeroManifesto';
import MissionValues from '../components/About/MissionValues';
import Genesis from '../components/About/Genesis';
import OdysseyTimeline from '../components/About/OdysseyTimeline';

const AboutUs = () => {
  return (
    <div className="font-sans text-text-main">
      <HeroManifesto />
      <MissionValues />
      <Genesis />
      <OdysseyTimeline />
    </div>
  );
};

export default AboutUs;
