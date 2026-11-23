import React from 'react';
import {AbsoluteFill, Sequence} from 'remotion';
import {Background} from './components/Background';
import {SceneFade} from './components/SceneFade';
import {sceneFrames} from './config';
import {BarRace} from './scenes/BarRace';
import {Crossing} from './scenes/Crossing';
import {EndCard} from './scenes/EndCard';
import {Hook} from './scenes/Hook';
import './fonts';

/**
 * The full story. Orientation-agnostic: scenes read width/height from the
 * composition and lay themselves out inside the matching safe zone.
 */
export const PopulationStory: React.FC = () => {
  const scenes = [
    {key: 'hook', C: Hook, d: sceneFrames.hook},
    {key: 'race', C: BarRace, d: sceneFrames.race},
    {key: 'crossing', C: Crossing, d: sceneFrames.crossing},
    {key: 'end', C: EndCard, d: sceneFrames.endCard},
  ];
  let from = 0;
  return (
    <AbsoluteFill>
      <Background />
      {scenes.map(({key, C, d}, i) => {
        const start = from;
        from += d;
        return (
          <Sequence key={key} from={start} durationInFrames={d} name={key}>
            <SceneFade duration={d} fadeIn={i > 0} fadeOut={i < scenes.length - 1}>
              <C />
            </SceneFade>
          </Sequence>
        );
      })}
    </AbsoluteFill>
  );
};
