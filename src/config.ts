/**
 * Content & timing configuration. Edit copy, callouts and channel name here.
 * (Colors/fonts live in theme.ts.)
 */
import {crossoverYear, firstYearAbove} from './lib/data';

export const FPS = 30;

/** Scene lengths in seconds. Total = 50s. */
export const sceneSeconds = {
  hook: 3,
  race: 35,
  crossing: 7,
  endCard: 5,
} as const;

export const sceneFrames = {
  hook: sceneSeconds.hook * FPS,
  race: sceneSeconds.race * FPS,
  crossing: sceneSeconds.crossing * FPS,
  endCard: sceneSeconds.endCard * FPS,
};

export const TOTAL_FRAMES =
  sceneFrames.hook + sceneFrames.race + sceneFrames.crossing + sceneFrames.endCard;

/** Frames each scene uses to fade in/out (avoids hard cuts). */
export const SCENE_FADE = 10;

export const copy = {
  hookLine1: 'For centuries, China was #1.',
  hookLine2: 'Not anymore.',
  raceTitle: 'Most populous countries',
  crossingTitle: 'The moment India passed China',
  endSource: 'Source: World Bank',
  endSourceDetail: 'World Development Indicators · SP.POP.TOTL',
  channelName: '@YourChannel',
  endCta: 'Follow for more data stories',
};

/** The two countries the story is about (ISO3). */
export const HERO = 'IND';
export const RIVAL = 'CHN';

export type Callout = {year: number; title: string; country?: string};

const CROSS = crossoverYear(HERO, RIVAL);
const BILLION = firstYearAbove(HERO, 1e9);

/**
 * Callouts during the race. Historical events are policy dates; data-driven
 * ones (crossover, 1 billion) are computed from population.json so they
 * always match the numbers on screen.
 */
export const callouts: Callout[] = [
  {year: 1980, title: "China's one-child policy", country: RIVAL},
  ...(BILLION ? [{year: BILLION, title: 'India passes 1 billion', country: HERO}] : []),
  {year: 2016, title: 'China ends the one-child policy', country: RIVAL},
  ...(CROSS ? [{year: CROSS, title: 'India takes the lead', country: HERO}] : []),
];

/** How long each callout stays on screen (frames). */
export const CALLOUT_FRAMES = 78;
