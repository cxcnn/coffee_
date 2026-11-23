import React from 'react';
import {AbsoluteFill, interpolate, spring, useCurrentFrame, useVideoConfig} from 'remotion';
import {copy} from '../config';
import {dataset} from '../lib/data';
import {useLayout} from '../lib/layout';
import {colors, fonts, springs} from '../theme';

/** Scene 4 — end card: source, channel name, call to action. */
export const EndCard: React.FC = () => {
  const frame = useCurrentFrame();
  const {fps} = useVideoConfig();
  const {box, u, isPortrait} = useLayout();

  const items = [0, 8, 16, 26].map((d) => spring({frame: frame - d, fps, config: springs.snappy}));
  const rise = (p: number) => ({
    opacity: p,
    transform: `translateY(${interpolate(p, [0, 1], [36, 0])}px)`,
    filter: `blur(${(1 - p) * 8}px)`,
  });
  const line = spring({frame: frame - 20, fps, config: springs.soft});
  const pulse = 1 + 0.03 * Math.sin((frame / fps) * Math.PI * 2 * 0.8) * items[3];

  return (
    <AbsoluteFill style={{fontFamily: fonts.stack, color: colors.text}}>
      <div
        style={{
          position: 'absolute',
          left: box.x,
          top: box.y,
          width: box.width,
          height: box.height,
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'center',
          alignItems: isPortrait ? 'flex-start' : 'center',
          textAlign: isPortrait ? 'left' : 'center',
        }}
      >
        <div
          style={{
            ...rise(items[0]),
            fontSize: 30 * u,
            fontWeight: fonts.weights.bold,
            letterSpacing: '0.14em',
            textTransform: 'uppercase',
            color: colors.textMuted,
          }}
        >
          {copy.endSource}
        </div>
        <div
          style={{
            ...rise(items[0]),
            fontSize: 24 * u,
            fontWeight: fonts.weights.semibold,
            color: colors.textFaint,
            marginTop: 10 * u,
            lineHeight: 1.4,
          }}
        >
          {copy.endSourceDetail}
          <br />
          Data last updated {dataset.meta.wbLastUpdated}
        </div>

        <div
          style={{
            height: 4 * u,
            width: 160 * u * line,
            background: colors.accent,
            borderRadius: 2 * u,
            margin: `${44 * u}px 0`,
          }}
        />

        <div
          style={{
            ...rise(items[1]),
            fontSize: (isPortrait ? 96 : 104) * u,
            fontWeight: fonts.weights.black,
            letterSpacing: '-0.04em',
            lineHeight: 1,
          }}
        >
          {copy.channelName}
        </div>

        <div
          style={{
            ...rise(items[2]),
            fontSize: (isPortrait ? 52 : 50) * u,
            fontWeight: fonts.weights.bold,
            color: colors.textMuted,
            marginTop: 28 * u,
            lineHeight: 1.15,
            maxWidth: 760 * u,
          }}
        >
          {copy.endCta}
        </div>

        <div
          style={{
            ...rise(items[3]),
            marginTop: 52 * u,
            transform: `${rise(items[3]).transform} scale(${pulse})`,
            transformOrigin: isPortrait ? 'left center' : 'center',
            padding: `${20 * u}px ${44 * u}px`,
            borderRadius: 999,
            background: colors.accent,
            color: colors.background,
            fontSize: 38 * u,
            fontWeight: fonts.weights.black,
            letterSpacing: '-0.01em',
          }}
        >
          Follow +
        </div>
      </div>
    </AbsoluteFill>
  );
};
