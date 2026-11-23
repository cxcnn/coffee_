import React from 'react';
import {
  AbsoluteFill,
  Easing,
  interpolate,
  spring,
  useCurrentFrame,
  useVideoConfig,
} from 'remotion';
import {Flag} from '../components/Flag';
import {HERO, RIVAL, copy} from '../config';
import {
  FIRST_YEAR,
  LAST_YEAR,
  crossoverYear,
  formatCompact,
  formatFull,
  getCountry,
  valueAt,
  valueInYear,
} from '../lib/data';
import {useLayout} from '../lib/layout';
import {colors, fonts, springs} from '../theme';

/** 1/2/5 × 10^k step closest to the raw step. */
const niceStep = (raw: number) => {
  const k = 10 ** Math.floor(Math.log10(raw));
  const m = raw / k;
  return (m < 1.5 ? 1 : m < 3.5 ? 2 : m < 7.5 ? 5 : 10) * k;
};

const lerp = (a: number, b: number, t: number) => a + (b - a) * t;

/** Exact point where the two interpolated lines intersect (between two yearly values). */
const intersection = () => {
  const cross = crossoverYear(HERO, RIVAL);
  if (!cross) return null;
  const y0 = cross - 1;
  const d0 = valueInYear(HERO, y0) - valueInYear(RIVAL, y0);
  const d1 = valueInYear(HERO, cross) - valueInYear(RIVAL, cross);
  const t = d0 / (d0 - d1);
  return {year: y0 + t, value: valueAt(HERO, y0 + t), crossYear: cross};
};

// Full and zoomed domains (data-driven so they adapt to new data vintages).
const FULL = {x0: FIRST_YEAR, x1: LAST_YEAR, y0: 0, y1: 1.6e9};
const zoomDomain = () => {
  const x0 = Math.max(FIRST_YEAR, LAST_YEAR - 13);
  let lo = Infinity;
  let hi = -Infinity;
  for (let y = x0; y <= LAST_YEAR; y++) {
    for (const c of [HERO, RIVAL]) {
      lo = Math.min(lo, valueInYear(c, y));
      hi = Math.max(hi, valueInYear(c, y));
    }
  }
  const span = hi - lo;
  return {x0, x1: LAST_YEAR, y0: lo - span * 0.12, y1: hi + span * 0.12};
};

/** Scene 3 — zoom into the India/China crossover, then the final numbers. */
export const Crossing: React.FC = () => {
  const frame = useCurrentFrame();
  const {fps} = useVideoConfig();
  const {box, u, isPortrait} = useLayout();

  const ZOOM = zoomDomain();
  const X = intersection();

  // Timeline (frames within this scene)
  const reveal = interpolate(frame, [4, 52], [0, 1], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
    easing: Easing.inOut(Easing.cubic),
  });
  const zoom = spring({frame: frame - 56, fps, config: {damping: 200, stiffness: 60, mass: 1}});
  const marker = spring({frame: frame - 92, fps, config: springs.pop});
  const cardA = spring({frame: frame - 112, fps, config: springs.snappy});
  const cardB = spring({frame: frame - 120, fps, config: springs.snappy});
  const gapIn = spring({frame: frame - 140, fps, config: springs.snappy});
  const titleIn = spring({frame, fps, config: springs.soft});

  const dom = {
    x0: lerp(FULL.x0, ZOOM.x0, zoom),
    x1: lerp(FULL.x1, ZOOM.x1, zoom),
    y0: lerp(FULL.y0, ZOOM.y0, zoom),
    y1: lerp(FULL.y1, ZOOM.y1, zoom),
  };

  // Regions
  const titleH = 120 * u;
  const chart = isPortrait
    ? {x: box.x, y: box.y + titleH + 20 * u, w: box.width, h: 680 * u}
    : {x: box.x, y: box.y + titleH, w: box.width * 0.6, h: box.height - titleH - 20 * u};
  const cards = isPortrait
    ? {x: box.x, y: chart.y + chart.h + 50 * u, w: box.width}
    : {x: box.x + box.width * 0.65, y: box.y + titleH + 10 * u, w: box.width * 0.35};

  const plotPadL = 0;
  const plotPadR = 150 * u; // room for end labels
  const plotW = chart.w - plotPadL - plotPadR;
  const sx = (yr: number) => chart.x + plotPadL + ((yr - dom.x0) / (dom.x1 - dom.x0)) * plotW;
  const sy = (v: number) => chart.y + chart.h - ((v - dom.y0) / (dom.y1 - dom.y0)) * chart.h;

  const revealYear = lerp(FIRST_YEAR, LAST_YEAR, reveal);
  const pathFor = (iso3: string) => {
    const pts: string[] = [];
    for (let y = FIRST_YEAR; y <= Math.floor(revealYear); y++) {
      pts.push(`${sx(y).toFixed(2)},${sy(valueInYear(iso3, y)).toFixed(2)}`);
    }
    if (revealYear % 1 > 0) {
      pts.push(`${sx(revealYear).toFixed(2)},${sy(valueAt(iso3, revealYear)).toFixed(2)}`);
    }
    return pts.length > 1 ? `M${pts.join(' L')}` : '';
  };

  const fullGrid = [0, 0.5e9, 1.0e9, 1.5e9];
  const zoomGrid: number[] = [];
  const zoomStep = niceStep((ZOOM.y1 - ZOOM.y0) / 4);
  for (let v = Math.ceil(ZOOM.y0 / zoomStep) * zoomStep; v <= ZOOM.y1; v += zoomStep) zoomGrid.push(v);
  const fullYears = [1960, 1980, 2000, 2020];
  const zoomYears: number[] = [];
  for (let y = Math.ceil(ZOOM.x0 / 3) * 3; y <= ZOOM.x1; y += 3) zoomYears.push(y);

  const fmtAxis = (v: number) =>
    v === 0 ? '0' : `${(v / 1e9).toFixed(Math.round(v / 1e7) % 10 === 0 ? 1 : 2)}B`;

  const series = [HERO, RIVAL].map((iso3) => ({
    iso3,
    color: iso3 === HERO ? colors.accent : colors.rival,
    country: getCountry(iso3),
  }));

  const stroke = 7 * u;
  const final = {hero: valueInYear(HERO, LAST_YEAR), rival: valueInYear(RIVAL, LAST_YEAR)};
  const gap = final.hero - final.rival;

  return (
    <AbsoluteFill style={{fontFamily: fonts.stack, color: colors.text}}>
      {/* Title */}
      <div
        style={{
          position: 'absolute',
          left: box.x,
          top: box.y,
          width: box.width,
          fontSize: (isPortrait ? 58 : 60) * u,
          fontWeight: fonts.weights.black,
          letterSpacing: '-0.03em',
          lineHeight: 1.05,
          opacity: titleIn,
          transform: `translateY(${interpolate(titleIn, [0, 1], [24, 0])}px)`,
        }}
      >
        {copy.crossingTitle}
      </div>

      {/* Chart */}
      <svg
        width="100%"
        height="100%"
        style={{position: 'absolute', inset: 0, overflow: 'visible'}}
      >
        <defs>
          <clipPath id="plot">
            <rect x={chart.x} y={chart.y - 20 * u} width={plotW + stroke} height={chart.h + 40 * u} />
          </clipPath>
        </defs>

        {/* Gridlines: full-view set fades out, zoomed set fades in */}
        {[
          {vals: fullGrid, op: 1 - zoom},
          {vals: zoomGrid, op: zoom},
        ].map((g, gi) =>
          g.vals.map((v) => {
            const y = sy(v);
            if (y < chart.y - 2 || y > chart.y + chart.h + 2) return null;
            return (
              <g key={`${gi}-${v}`} opacity={g.op * titleIn}>
                <line x1={chart.x} x2={chart.x + plotW} y1={y} y2={y} stroke={colors.grid} strokeWidth={2} />
              </g>
            );
          }),
        )}
        {[
          {vals: fullYears, op: 1 - zoom},
          {vals: zoomYears, op: zoom},
        ].map((g, gi) =>
          g.vals.map((yr) => {
            const x = sx(yr);
            if (x < chart.x - 2 || x > chart.x + plotW + 2) return null;
            return (
              <text
                key={`x${gi}-${yr}`}
                x={x}
                y={chart.y + chart.h + 34 * u}
                fill={colors.textFaint}
                fontSize={22 * u}
                fontWeight={600}
                textAnchor="middle"
                fontFamily={fonts.stack}
                opacity={g.op * titleIn}
              >
                {yr}
              </text>
            );
          }),
        )}

        {/* Lines */}
        <g clipPath="url(#plot)">
          {series
            .slice()
            .reverse()
            .map((s) => (
              <path
                key={s.iso3}
                d={pathFor(s.iso3)}
                fill="none"
                stroke={s.color}
                strokeWidth={stroke}
                strokeLinejoin="round"
                strokeLinecap="round"
              />
            ))}
        </g>

        {/* Axis values drawn above the lines, with a background halo */}
        {[
          {vals: fullGrid, op: 1 - zoom},
          {vals: zoomGrid, op: zoom},
        ].map((g, gi) =>
          g.vals.map((v) => {
            const y = sy(v);
            if (y < chart.y - 2 || y > chart.y + chart.h + 2) return null;
            return (
              <text
                key={`t${gi}-${v}`}
                x={chart.x}
                y={y - 10 * u}
                fill={colors.textMuted}
                stroke={colors.background}
                strokeWidth={8 * u}
                paintOrder="stroke"
                fontSize={22 * u}
                fontWeight={600}
                fontFamily={fonts.stack}
                opacity={g.op * titleIn}
              >
                {fmtAxis(v)}
              </text>
            );
          }),
        )}

        {/* Crossover marker */}
        {X ? (
          <g opacity={marker}>
            <circle
              cx={sx(X.year)}
              cy={sy(X.value)}
              r={(26 + 16 * ((frame % 40) / 40)) * u * marker}
              fill="none"
              stroke={colors.accent}
              strokeWidth={3 * u}
              opacity={1 - (frame % 40) / 40}
            />
            <circle cx={sx(X.year)} cy={sy(X.value)} r={14 * u * marker} fill={colors.accent} />
            <circle cx={sx(X.year)} cy={sy(X.value)} r={6 * u * marker} fill={colors.background} />
          </g>
        ) : null}
      </svg>

      {/* End-of-line labels (HTML so they can use flags) */}
      {series.map((s) => {
        const yr = Math.min(revealYear, LAST_YEAR);
        const y = sy(valueAt(s.iso3, yr));
        const x = sx(yr);
        const above = s.iso3 === HERO;
        return (
          <div
            key={`lbl-${s.iso3}`}
            style={{
              position: 'absolute',
              left: x + 18 * u,
              top: y + (above ? -46 : 6) * u,
              display: 'flex',
              alignItems: 'center',
              gap: 10 * u,
              fontSize: 28 * u,
              fontWeight: fonts.weights.extrabold,
              color: s.color,
              whiteSpace: 'nowrap',
              opacity: interpolate(reveal, [0, 0.15], [0, 1], {extrapolateRight: 'clamp'}),
            }}
          >
            <Flag iso2={s.country.iso2} height={28 * u} />
            {s.country.shortName}
          </div>
        );
      })}

      {/* Marker label */}
      {X ? (
        <div
          style={{
            position: 'absolute',
            left: sx(X.year) + 10 * u,
            top: sy(X.value) + 96 * u,
            transform: `translateY(${interpolate(marker, [0, 1], [20, 0])}px)`,
            opacity: marker,
            padding: `${10 * u}px ${18 * u}px`,
            borderRadius: 14 * u,
            background: colors.accent,
            color: colors.background,
            fontSize: 28 * u,
            fontWeight: fonts.weights.black,
            whiteSpace: 'nowrap',
          }}
        >
          {X.crossYear}: {getCountry(HERO).shortName} ahead
        </div>
      ) : null}

      {/* Final numbers, side by side */}
      <div
        style={{
          position: 'absolute',
          left: cards.x,
          top: cards.y,
          width: cards.w,
          display: 'flex',
          flexDirection: isPortrait ? 'row' : 'column',
          gap: 22 * u,
        }}
      >
        {[
          {iso3: HERO, v: final.hero, p: cardA},
          {iso3: RIVAL, v: final.rival, p: cardB},
        ].map(({iso3, v, p}) => {
          const c = getCountry(iso3);
          const hero = iso3 === HERO;
          return (
            <div
              key={iso3}
              style={{
                flex: 1,
                padding: `${26 * u}px ${28 * u}px`,
                borderRadius: 28 * u,
                background: colors.surface,
                border: `2px solid ${hero ? colors.accent : colors.surfaceBorder}`,
                opacity: p,
                transform: `translateY(${interpolate(p, [0, 1], [50, 0])}px) scale(${interpolate(p, [0, 1], [0.92, 1])})`,
              }}
            >
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 12 * u,
                  fontSize: 30 * u,
                  fontWeight: fonts.weights.extrabold,
                  color: hero ? colors.accent : colors.rival,
                }}
              >
                <Flag iso2={c.iso2} height={30 * u} />
                {c.shortName}
              </div>
              <div
                style={{
                  fontSize: 92 * u,
                  fontWeight: fonts.weights.black,
                  letterSpacing: '-0.04em',
                  lineHeight: 1.05,
                  marginTop: 10 * u,
                  fontVariantNumeric: 'tabular-nums',
                }}
              >
                {formatCompact(v)}
              </div>
              <div
                style={{
                  fontSize: 22 * u,
                  fontWeight: fonts.weights.semibold,
                  color: colors.textMuted,
                  marginTop: 6 * u,
                  fontVariantNumeric: 'tabular-nums',
                }}
              >
                {formatFull(v)} · {LAST_YEAR}
              </div>
            </div>
          );
        })}
      </div>
      <div
        style={{
          position: 'absolute',
          left: cards.x,
          top: isPortrait ? cards.y + 250 * u : cards.y + 560 * u,
          width: cards.w,
          display: 'flex',
          justifyContent: isPortrait ? 'center' : 'flex-start',
          opacity: gapIn,
          transform: `translateY(${interpolate(gapIn, [0, 1], [24, 0])}px)`,
        }}
      >
        <div
          style={{
            padding: `${12 * u}px ${24 * u}px`,
            borderRadius: 999,
            border: `2px solid ${colors.accent}`,
            color: colors.accent,
            fontSize: 30 * u,
            fontWeight: fonts.weights.extrabold,
          }}
        >
          {getCountry(HERO).shortName} leads by {formatCompact(gap)}
        </div>
      </div>
    </AbsoluteFill>
  );
};
