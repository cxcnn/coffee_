import React from 'react';
import {Composition} from 'remotion';
import {FPS, TOTAL_FRAMES} from './config';
import {PopulationStory} from './PopulationStory';

export const RemotionRoot: React.FC = () => (
  <>
    {/* YouTube Shorts / Reels / TikTok */}
    <Composition
      id="Short"
      component={PopulationStory}
      durationInFrames={TOTAL_FRAMES}
      fps={FPS}
      width={1080}
      height={1920}
    />
    {/* Same story, landscape */}
    <Composition
      id="Landscape"
      component={PopulationStory}
      durationInFrames={TOTAL_FRAMES}
      fps={FPS}
      width={1920}
      height={1080}
    />
  </>
);
