import React from 'react';
import * as Flags from 'country-flag-icons/react/3x2';
import {radii} from '../theme';

type FlagComponent = React.FC<React.SVGAttributes<SVGElement>>;

/** SVG flag (3:2). SVG rather than emoji so it renders identically everywhere. */
export const Flag: React.FC<{iso2: string; height: number; style?: React.CSSProperties}> = ({
  iso2,
  height,
  style,
}) => {
  const Svg = (Flags as unknown as Record<string, FlagComponent>)[iso2];
  const width = (height * 3) / 2;
  return (
    <div
      style={{
        width,
        height,
        borderRadius: radii.flag,
        overflow: 'hidden',
        flexShrink: 0,
        boxShadow: '0 0 0 1.5px rgba(255,255,255,0.14)',
        ...style,
      }}
    >
      {Svg ? <Svg style={{width: '100%', height: '100%', display: 'block'}} /> : null}
    </div>
  );
};
