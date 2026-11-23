import React from 'react';
import {AbsoluteFill, useCurrentFrame, useVideoConfig} from 'remotion';
import {colors} from '../theme';

/** Dark background with a slow-drifting soft glow (never static, never distracting). */
export const Background: React.FC = () => {
  const frame = useCurrentFrame();
  const {width, height, fps} = useVideoConfig();
  const t = frame / fps;
  const x = 50 + Math.sin(t * 0.25) * 12;
  const y = 30 + Math.cos(t * 0.2) * 8;
  const size = Math.max(width, height);
  return (
    <AbsoluteFill style={{backgroundColor: colors.background}}>
      <AbsoluteFill
        style={{
          background: `radial-gradient(${size * 0.7}px circle at ${x}% ${y}%, ${colors.backgroundGlow} 0%, ${colors.background} 70%)`,
        }}
      />
      <AbsoluteFill
        style={{
          background: `radial-gradient(${size * 0.5}px circle at ${100 - x}% ${100 - y * 0.6}%, ${colors.accent}0D 0%, transparent 70%)`,
        }}
      />
    </AbsoluteFill>
  );
};
