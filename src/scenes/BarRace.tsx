import React, {useMemo} from 'react';
import {
  AbsoluteFill,
  Easing,
  interpolate,
  spring,
  useCurrentFrame,
  useVideoConfig,
} from 'remotion';
import {Flag} from '../components/Flag';
import {CALLOUT_FRAMES, Callout, HERO, RIVAL, callouts, copy} from '../config';
import {
  FIRST_YEAR,
  LAST_YEAR,
  dataset,
  formatCompact,
  getCountry,
  rankedAt,
  valueAt,
} from '../lib/data';
import {useLayout} from '../lib/layout';
import {makeRaceTimeline} from '../lib/timeline';
import {colors, fonts, radii, springs} from '../theme';

const VISIBLE = 10;
/** Frames over which a rank change is smoothed (Hann-window kernel → eased slide). */
const RANK_SMOOTH = 16;

const hann = Array.from({length: RANK_SMOOTH}, (_, i) =>
  Math.sin((Math.PI * (i + 0.5)) / RANK_SMOOTH) ** 2,
);
const hannSum = hann.reduce((a, b) => a + b, 0);

const barColor = (iso3: string) =>
  iso3 === HERO ? colors.accent : iso3 === RIVAL ? colors.rival : colors.bar;

const nameColor = (iso3: string) =>
  iso3 === HERO ? colors.accent : iso3 === RIVAL ? colors.rival : colors.barText;

/** Scene 2 — bar chart race, 1960 → latest year. */
export const BarRace: React.FC = () => {
  const frame = useCurrentFrame();
  const {fps, durationInFrames} = useVideoConfig();
  const {box, u, isPortrait} = useLayout();

  const timeline = useMemo(
    () => makeRaceTimeline(durationInFrames, callouts.map((c) => c.year)),
    [durationInFrames],
  );
  const year = timeline.yearAt(frame);

  // --- Smoothed ranks: average of the discrete rank over the last N frames.
  const smoothRank = useMemo(() => {
    const acc: Record<string, number> = {};
    dataset.countries.forEach((c) => (acc[c.iso3] = 0));
    for (let i = 0; i < RANK_SMOOTH; i++) {
      const ranked = rankedAt(timeline.yearAt(Math.max(0, frame - i)));
      ranked.forEach((r, idx) => (acc[r.iso3] += idx * hann[i]));
    }
    Object.keys(acc).forEach((k) => (acc[k] /= hannSum));
    return acc;
  }, [frame, timeline]);

  const ranked = rankedAt(year);
  const maxValue = ranked[0].value;

  // --- Layout regions
  const headerH = isPortrait ? 320 * u : 0;
  const calloutH = isPortrait ? 130 * u : 0;
  const footerH = 44 * u;
  const chart = isPortrait
    ? {
        x: box.x,
        y: box.y + headerH + calloutH,
        width: box.width,
        height: box.height - headerH - calloutH - footerH,
      }
    : {
        x: box.x + box.width * 0.36,
        y: box.y,
        width: box.width * 0.64,
        height: box.height - footerH,
      };
  const side = isPortrait
    ? {x: box.x, y: box.y, width: box.width}
    : {x: box.x, y: box.y + 40 * u, width: box.width * 0.32};

  const rowH = chart.height / VISIBLE;
  const labelW = isPortrait ? 0 : 250 * u;
  const valueW = isPortrait ? 150 * u : 150 * u;
  const barMax = chart.width - labelW - valueW;
  const barH = isPortrait ? rowH * 0.46 : rowH * 0.62;
  const labelSize = isPortrait ? 30 * u : 30 * u;

  // --- Active callout
  const calloutWindows = callouts.map((c, i) => {
    const start = timeline.frameOfYear(c.year);
    const next = callouts[i + 1] ? timeline.frameOfYear(callouts[i + 1].year) : Infinity;
    return {c, start, end: Math.min(start + CALLOUT_FRAMES, next - 2)};
  });
  const heroGlow = calloutWindows
    .filter((w) => w.c.country === HERO && w.c.title.includes('lead'))
    .map((w) =>
      interpolate(frame, [w.start - 6, w.start + 6, w.end, w.end + 30], [0, 1, 1, 0.35], {
        extrapolateLeft: 'clamp',
        extrapolateRight: 'clamp',
      }),
    )[0] ?? 0;

  const progress = (year - FIRST_YEAR) / (LAST_YEAR - FIRST_YEAR);
  const headerIn = spring({frame, fps, config: springs.soft});

  return (
    <AbsoluteFill style={{fontFamily: fonts.stack, color: colors.text}}>
      {/* Header: title + big year counter + timeline progress */}
      <div
        style={{
          position: 'absolute',
          left: side.x,
          top: side.y,
          width: side.width,
          opacity: headerIn,
          transform: `translateY(${interpolate(headerIn, [0, 1], [24, 0])}px)`,
        }}
      >
        <div
          style={{
            fontSize: 30 * u,
            fontWeight: fonts.weights.bold,
            letterSpacing: '0.14em',
            textTransform: 'uppercase',
            color: colors.textMuted,
          }}
        >
          {copy.raceTitle}
        </div>
        <div
          style={{
            fontSize: (isPortrait ? 210 : 230) * u,
            fontWeight: fonts.weights.black,
            letterSpacing: '-0.05em',
            lineHeight: 1,
            marginTop: 8 * u,
            fontVariantNumeric: 'tabular-nums',
          }}
        >
          {Math.floor(year + 1e-6)}
        </div>
        <div style={{marginTop: 18 * u, width: isPortrait ? '100%' : '92%'}}>
          <div
            style={{
              height: 8 * u,
              borderRadius: 4 * u,
              background: colors.grid,
              overflow: 'hidden',
            }}
          >
            <div
              style={{
                height: '100%',
                width: `${progress * 100}%`,
                background: colors.accent,
                borderRadius: 4 * u,
              }}
            />
          </div>
          <div
            style={{
              display: 'flex',
              justifyContent: 'space-between',
              marginTop: 10 * u,
              fontSize: 22 * u,
              fontWeight: fonts.weights.semibold,
              color: colors.textFaint,
            }}
          >
            <span>{FIRST_YEAR}</span>
            <span>{LAST_YEAR}</span>
          </div>
        </div>

        {/* Callouts (portrait: below header; landscape: under the year) */}
        <div
          style={{
            position: 'relative',
            height: isPortrait ? calloutH : 200 * u,
            marginTop: isPortrait ? 24 * u : 70 * u,
          }}
        >
          {calloutWindows.map((w) => (
            <CalloutCard key={w.c.title} callout={w.c} start={w.start} end={w.end} />
          ))}
        </div>
      </div>

      {/* Bars */}
      {dataset.countries.map((c, idx) => {
        const r = smoothRank[c.iso3];
        if (r > VISIBLE + 0.5) return null;
        const value = valueAt(c.iso3, year);
        const intro = spring({frame: frame - 2 - idx * 1.5, fps, config: springs.soft});
        // Entering/leaving the top 10: fade out before the midpoint so two rows never overlap.
        const visibility = interpolate(r, [VISIBLE - 0.85, VISIBLE - 0.5], [1, 0], {
          extrapolateLeft: 'clamp',
          extrapolateRight: 'clamp',
        });
        // While two rows slide past each other, the riser stays on top and the
        // faller dims, so the overtake reads cleanly instead of overlapping text.
        const target = ranked.findIndex((x) => x.iso3 === c.iso3);
        const passing = Math.min(1, Math.abs(r - target) * 2);
        const falling = target > r;
        const passDim = falling ? 1 - 0.75 * passing : 1;
        const w = Math.max(barH * 0.2, (value / maxValue) * barMax * intro);
        const y = chart.y + r * rowH;
        const isHero = c.iso3 === HERO;
        const country = getCountry(c.iso3);

        const label = (
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 12 * u,
              fontSize: labelSize,
              fontWeight: isHero || c.iso3 === RIVAL ? fonts.weights.extrabold : fonts.weights.semibold,
              color: nameColor(c.iso3),
              whiteSpace: 'nowrap',
            }}
          >
            <Flag iso2={country.iso2} height={labelSize * 1.05} />
            <span>{country.shortName}</span>
          </div>
        );

        return (
          <div
            key={c.iso3}
            style={{
              position: 'absolute',
              left: chart.x,
              top: y,
              width: chart.width,
              height: rowH,
              opacity: visibility * intro * passDim,
              zIndex: falling ? 1 : 2,
              display: 'flex',
              flexDirection: isPortrait ? 'column' : 'row',
              justifyContent: isPortrait ? 'center' : 'flex-start',
              alignItems: isPortrait ? 'flex-start' : 'center',
              gap: isPortrait ? 8 * u : 0,
            }}
          >
            {isPortrait ? label : <div style={{width: labelW, flexShrink: 0}}>{label}</div>}
            <div style={{display: 'flex', alignItems: 'center'}}>
              <div
                style={{
                  width: w,
                  height: barH,
                  borderRadius: radii.bar * u,
                  background: barColor(c.iso3),
                  boxShadow: isHero
                    ? `0 0 ${40 * heroGlow * u}px ${10 * heroGlow * u}px ${colors.accent}66`
                    : 'none',
                }}
              />
              <div
                style={{
                  marginLeft: 14 * u,
                  fontSize: labelSize * 0.95,
                  fontWeight: fonts.weights.bold,
                  color: isHero ? colors.accent : colors.textMuted,
                  fontVariantNumeric: 'tabular-nums',
                  whiteSpace: 'nowrap',
                }}
              >
                {formatCompact(value)}
              </div>
            </div>
          </div>
        );
      })}

      {/* Footer source line */}
      <div
        style={{
          position: 'absolute',
          left: isPortrait ? box.x : chart.x,
          top: box.y + box.height - footerH * 0.7,
          fontSize: 20 * u,
          fontWeight: fonts.weights.semibold,
          color: colors.textFaint,
          opacity: headerIn,
        }}
      >
        Source: World Bank (SP.POP.TOTL)
      </div>
    </AbsoluteFill>
  );
};

const CalloutCard: React.FC<{callout: Callout; start: number; end: number}> = ({
  callout,
  start,
  end,
}) => {
  const frame = useCurrentFrame();
  const {fps} = useVideoConfig();
  const {u} = useLayout();
  if (frame < start - 1 || frame > end + 16) return null;

  const enter = spring({frame: frame - start, fps, config: springs.snappy});
  const exit = interpolate(frame, [end, end + 14], [0, 1], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
    easing: Easing.in(Easing.cubic),
  });
  const opacity = enter * (1 - exit);
  const country = callout.country ? getCountry(callout.country) : null;
  const isHero = callout.country === HERO;

  return (
    <div
      style={{
        position: 'absolute',
        left: 0,
        top: 0,
        display: 'flex',
        alignItems: 'center',
        gap: 22 * u,
        padding: `${20 * u}px ${28 * u}px`,
        borderRadius: 22 * u,
        background: colors.surface,
        border: `2px solid ${isHero ? colors.accent : colors.surfaceBorder}`,
        opacity,
        transform: `translateX(${interpolate(enter, [0, 1], [-60, 0]) + exit * 30}px) scale(${interpolate(enter, [0, 1], [0.94, 1])})`,
        transformOrigin: 'left center',
        filter: `blur(${(1 - enter) * 8}px)`,
      }}
    >
      <div
        style={{
          fontSize: 48 * u,
          fontWeight: fonts.weights.black,
          color: colors.accent,
          letterSpacing: '-0.03em',
          fontVariantNumeric: 'tabular-nums',
        }}
      >
        {callout.year}
      </div>
      <div style={{width: 2, alignSelf: 'stretch', background: colors.surfaceBorder}} />
      {country ? <Flag iso2={country.iso2} height={34 * u} /> : null}
      <div
        style={{
          fontSize: 34 * u,
          fontWeight: fonts.weights.extrabold,
          color: colors.text,
          letterSpacing: '-0.01em',
          lineHeight: 1.15,
          maxWidth: 520 * u,
        }}
      >
        {callout.title}
      </div>
    </div>
  );
};
