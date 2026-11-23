import {FIRST_YEAR, LAST_YEAR} from './data';

/**
 * Maps race-scene frames to a (fractional) year.
 *
 * Time per year is not constant: early decades move briskly and the clock
 * smoothly slows down approaching the India/China crossover so the key
 * moment gets screen time. The speed change follows a smoothstep curve, so
 * there is no visible jump in pace.
 */

const smoothstep = (a: number, b: number, x: number) => {
  const t = Math.min(1, Math.max(0, (x - a) / (b - a)));
  return t * t * (3 - 2 * t);
};

export type RaceTimeline = {
  introFrames: number;
  playFrames: number;
  /** Frame (within the race scene) → fractional year. */
  yearAt: (frame: number) => number;
  /** Year → frame (within the race scene) at which the clock reaches it. */
  frameOfYear: (year: number) => number;
};

export const makeRaceTimeline = (
  totalFrames: number,
  /** Years to linger on (callouts): the clock eases into a slow-mo around each. */
  focusYears: number[] = [],
  introFrames = 24,
  outroFrames = 66,
): RaceTimeline => {
  const playFrames = totalFrames - introFrames - outroFrames;
  const weight = (y: number) =>
    1 +
    1.5 * smoothstep(2006, 2019, y) +
    focusYears.reduce((acc, fy) => acc + 1.6 * Math.exp(-(((y - fy - 0.6) / 1.6) ** 2)), 0);

  const intervals = LAST_YEAR - FIRST_YEAR;
  const raw: number[] = [];
  for (let i = 0; i < intervals; i++) raw.push(weight(FIRST_YEAR + i + 0.5));
  const sum = raw.reduce((a, b) => a + b, 0);
  const durations = raw.map((w) => (w / sum) * playFrames);
  const starts: number[] = [0];
  for (let i = 0; i < intervals; i++) starts.push(starts[i] + durations[i]);

  const yearAt = (frame: number) => {
    const f = frame - introFrames;
    if (f <= 0) return FIRST_YEAR;
    if (f >= playFrames) return LAST_YEAR;
    let i = 0;
    while (i < intervals - 1 && starts[i + 1] <= f) i++;
    return FIRST_YEAR + i + (f - starts[i]) / durations[i];
  };

  const frameOfYear = (year: number) => {
    const y = Math.min(LAST_YEAR, Math.max(FIRST_YEAR, year));
    const i = Math.min(intervals - 1, Math.floor(y - FIRST_YEAR));
    return introFrames + starts[i] + (y - FIRST_YEAR - i) * durations[i];
  };

  return {introFrames, playFrames, yearAt, frameOfYear};
};
