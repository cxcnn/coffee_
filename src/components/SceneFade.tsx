import React from 'react';
import {AbsoluteFill, Easing, interpolate, useCurrentFrame} from 'remotion';
import {SCENE_FADE} from '../config';

/** Eased fade in/out at the edges of a scene so nothing cuts abruptly. */
export const SceneFade: React.FC<{
  duration: number;
  fadeIn?: boolean;
  fadeOut?: boolean;
  children: React.ReactNode;
}> = ({duration, fadeIn = true, fadeOut = true, children}) => {
  const frame = useCurrentFrame();
  const inOp = fadeIn
    ? interpolate(frame, [0, SCENE_FADE], [0, 1], {
        extrapolateLeft: 'clamp',
        extrapolateRight: 'clamp',
        easing: Easing.out(Easing.cubic),
      })
    : 1;
  const outOp = fadeOut
    ? interpolate(frame, [duration - SCENE_FADE, duration], [1, 0], {
        extrapolateLeft: 'clamp',
        extrapolateRight: 'clamp',
        easing: Easing.in(Easing.cubic),
      })
    : 1;
  return <AbsoluteFill style={{opacity: inOp * outOp}}>{children}</AbsoluteFill>;
};
