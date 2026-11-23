import {useVideoConfig} from 'remotion';
import {Orientation, safeZones} from '../theme';

/** Content box inside the platform safe zones, plus a scale unit for type. */
export const useLayout = () => {
  const {width, height} = useVideoConfig();
  const orientation: Orientation = height > width ? 'portrait' : 'landscape';
  const safe = safeZones[orientation];
  const box = {
    x: safe.left,
    y: safe.top,
    width: width - safe.left - safe.right,
    height: height - safe.top - safe.bottom,
  };
  /** 1 unit = 1px on a 1080-wide portrait frame; scales type for landscape. */
  const u = orientation === 'portrait' ? width / 1080 : height / 1080;
  return {width, height, orientation, safe, box, u, isPortrait: orientation === 'portrait'};
};
