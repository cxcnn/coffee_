import raw from '../data/population.json';

export type Country = {
  iso3: string;
  iso2: string;
  name: string;
  shortName: string;
  sourceUrl: string;
  apiUrl: string;
  values: number[];
};

export const dataset = raw as {
  meta: {
    indicator: string;
    indicatorName: string;
    source: string;
    sourceUrl: string;
    wbLastUpdated: string;
    firstYear: number;
    lastYear: number;
  };
  years: number[];
  countries: Country[];
};

export const FIRST_YEAR = dataset.meta.firstYear;
export const LAST_YEAR = dataset.meta.lastYear;

const byIso3 = new Map(dataset.countries.map((c) => [c.iso3, c]));

export const getCountry = (iso3: string): Country => {
  const c = byIso3.get(iso3);
  if (!c) throw new Error(`Country ${iso3} not in population.json`);
  return c;
};

/** Exact World Bank value for an integer year. */
export const valueInYear = (iso3: string, year: number): number =>
  getCountry(iso3).values[year - FIRST_YEAR];

/**
 * Value at a fractional year, linearly interpolated between two published
 * yearly values — used only for in-between animation frames. Integer years
 * always return the exact World Bank figure.
 */
export const valueAt = (iso3: string, year: number): number => {
  const c = getCountry(iso3);
  const clamped = Math.min(LAST_YEAR, Math.max(FIRST_YEAR, year));
  const i = Math.floor(clamped - FIRST_YEAR);
  const t = clamped - FIRST_YEAR - i;
  const a = c.values[i];
  const b = c.values[Math.min(i + 1, c.values.length - 1)];
  return a + (b - a) * t;
};

/** First year in which `a`'s population exceeds `b`'s (and stays ahead). */
export const crossoverYear = (a: string, b: string): number | null => {
  let found: number | null = null;
  for (let y = FIRST_YEAR; y <= LAST_YEAR; y++) {
    const ahead = valueInYear(a, y) > valueInYear(b, y);
    if (ahead && found === null) found = y;
    if (!ahead) found = null;
  }
  return found;
};

export const firstYearAbove = (iso3: string, threshold: number): number | null => {
  for (let y = FIRST_YEAR; y <= LAST_YEAR; y++) {
    if (valueInYear(iso3, y) >= threshold) return y;
  }
  return null;
};

export const peakYear = (iso3: string): number => {
  let best = FIRST_YEAR;
  for (let y = FIRST_YEAR; y <= LAST_YEAR; y++) {
    if (valueInYear(iso3, y) > valueInYear(iso3, best)) best = y;
  }
  return best;
};

/** Countries sorted by (interpolated) population at a fractional year. */
export const rankedAt = (year: number) =>
  dataset.countries
    .map((c) => ({iso3: c.iso3, value: valueAt(c.iso3, year)}))
    .sort((x, y) => y.value - x.value);

/** "1.46B", "341.8M" — compact and punchy. */
export const formatCompact = (n: number): string => {
  if (n >= 1e9) return `${(n / 1e9).toFixed(2)}B`;
  if (n >= 1e6) return `${(n / 1e6).toFixed(1)}M`;
  return Math.round(n).toLocaleString('en-US');
};

/** "1,463,865,525" — exact figure. */
export const formatFull = (n: number): string => Math.round(n).toLocaleString('en-US');
