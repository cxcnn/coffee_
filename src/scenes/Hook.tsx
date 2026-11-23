import React from 'react';
import {AbsoluteFill, interpolate, spring, useCurrentFrame, useVideoConfig} from 'remotion';
import {copy} from '../config';
import {useLayout} from '../lib/layout';
import {colors, fonts, springs} from '../theme';

const Word: React.FC<{
  text: string;
  delay: number;
  style: React.CSSProperties;
}> = ({text, delay, style}) => {
  const frame = useCurrentFrame();
  const {fps} = useVideoConfig();
  const p = spring({frame: frame - delay, fps, config: springs.snappy});
  return (
    <span
      style={{
        display: 'inline-block',
        opacity: interpolate(p, [0, 1], [0, 1]),
        transform: `translateY(${interpolate(p, [0, 1], [40, 0])}px)`,
        filter: `blur(${interpolate(p, [0, 1], [12, 0])}px)`,
        marginRight: '0.26em',
        ...style,
      }}
    >
      {text}
    </span>
  );
};

/** Scene 1 — the hook. Words spring in one by one, then the punchline lands. */
export const Hook: React.FC = () => {
  const frame = useCurrentFrame();
  const {fps, durationInFrames} = useVideoConfig();
  const {box, u, isPortrait} = useLayout();

  const line1 = copy.hookLine1.split(' ');
  const line2 = copy.hookLine2.split(' ');
  const line2Start = 4 + line1.length * 4 + 8;

  const punch = spring({frame: frame - line2Start, fps, config: springs.pop});
  const underline = spring({frame: frame - line2Start - 6, fps, config: springs.soft});
  const drift = interpolate(frame, [0, durationInFrames], [1, 1.04]);

  return (
    <AbsoluteFill>
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
          fontFamily: fonts.stack,
          transform: `scale(${drift})`,
        }}
      >
        <div
          style={{
            display: 'flex',
            flexWrap: 'wrap',
            justifyContent: isPortrait ? 'flex-start' : 'center',
            fontSize: (isPortrait ? 108 : 96) * u,
            fontWeight: fonts.weights.extrabold,
            color: colors.text,
            lineHeight: 1.08,
            letterSpacing: '-0.03em',
          }}
        >
          {line1.map((w, i) => (
            <Word key={i} text={w} delay={4 + i * 4} style={{}} />
          ))}
        </div>
        <div
          style={{
            marginTop: 36 * u,
            position: 'relative',
            fontSize: 132 * u,
            fontWeight: fonts.weights.black,
            color: colors.accent,
            letterSpacing: '-0.04em',
            lineHeight: 1,
            transform: `scale(${interpolate(punch, [0, 1], [0.85, 1])})`,
            transformOrigin: isPortrait ? 'left center' : 'center',
            opacity: interpolate(punch, [0, 0.4], [0, 1], {extrapolateRight: 'clamp'}),
          }}
        >
          {line2.map((w, i) => (
            <Word key={i} text={w} delay={line2Start + i * 3} style={{}} />
          ))}
          <div
            style={{
              height: 12 * u,
              marginTop: 18 * u,
              borderRadius: 6 * u,
              background: colors.accent,
              width: `${underline * 100}%`,
              marginLeft: isPortrait ? 0 : 'auto',
              marginRight: isPortrait ? 0 : 'auto',
            }}
          />
        </div>
      </div>
    </AbsoluteFill>
  );
};
