import {loadFont} from '@remotion/fonts';
import {staticFile} from 'remotion';
import {fonts} from './theme';

/**
 * Inter is bundled locally (public/fonts, from @fontsource/inter, OFL-1.1) so
 * renders never depend on a font CDN. loadFont() delays rendering until loaded.
 */
const weights = [400, 600, 700, 800, 900] as const;

export const fontsLoaded = Promise.all(
  weights.map((w) =>
    loadFont({
      family: fonts.family,
      url: staticFile(`fonts/inter-latin-${w}-normal.woff2`),
      weight: String(w),
      format: 'woff2',
    }),
  ),
);
