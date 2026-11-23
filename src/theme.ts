/**
 * Visual theme: every color, font and layout constant lives here so the
 * project can be reused as a template. Swap these values to re-skin the video.
 */

export const colors = {
  background: '#0B0D12',
  backgroundGlow: '#161A24',
  surface: '#151924',
  surfaceBorder: '#232838',
  text: '#F4F5F7',
  textMuted: '#8B93A7',
  textFaint: '#4A5168',
  grid: '#1E2330',
  /** The single accent color: used for the "hero" series (India) and highlights. */
  accent: '#FF9F1C',
  /** Secondary series (China) — neutral, not a second accent. */
  rival: '#E6E8EE',
  /** All other bars. */
  bar: '#3A4256',
  barText: '#C9CEDA',
} as const;

export const fonts = {
  family: 'Inter',
  stack: 'Inter, system-ui, -apple-system, "Segoe UI", Roboto, sans-serif',
  weights: {
    regular: 400,
    semibold: 600,
    bold: 700,
    extrabold: 800,
    black: 900,
  },
} as const;

export type Orientation = 'portrait' | 'landscape';

/**
 * Safe zones (in px) per orientation.
 * Portrait: YouTube Shorts overlays the title/channel/description at the
 * bottom and the like/comment/share column on the right, so key content stays
 * well clear of both.
 */
export const safeZones: Record<
  Orientation,
  {top: number; bottom: number; left: number; right: number}
> = {
  portrait: {top: 220, bottom: 460, left: 72, right: 190},
  landscape: {top: 90, bottom: 90, left: 110, right: 110},
};

export const radii = {
  bar: 10,
  card: 28,
  flag: 6,
};

/** Shared spring presets so motion feels consistent across scenes. */
export const springs = {
  soft: {damping: 200, mass: 1, stiffness: 100},
  snappy: {damping: 18, mass: 0.6, stiffness: 140},
  pop: {damping: 12, mass: 0.7, stiffness: 160},
} as const;
