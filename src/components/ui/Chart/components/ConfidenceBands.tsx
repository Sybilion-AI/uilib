import { Area } from 'recharts';

import {
  ANIMATION_BEGIN,
  ANIMATION_DURATION,
} from '../../ChartForecast/ChartForecast.constants';

interface ConfidenceBandsProps {
  color: string;
  hidden?: boolean;
  animate?: boolean;
}

export function ConfidenceBands({
  color,
  hidden = false,
  animate = false,
}: ConfidenceBandsProps) {
  return (
    <>
      {/* Lower boundary (invisible baseline) */}
      <Area
        type="monotone"
        dataKey="lower_boundary"
        stroke="transparent"
        fill="transparent"
        isAnimationActive={animate}
        animationDuration={ANIMATION_DURATION}
        animationBegin={ANIMATION_BEGIN}
        connectNulls
        hide={hidden}
      />

      {/* Upper boundary (creates fill between) */}
      <Area
        type="monotone"
        dataKey="upper_boundary"
        stroke="transparent"
        fill={color}
        fillOpacity={0.35}
        isAnimationActive={animate}
        animationDuration={ANIMATION_DURATION}
        animationBegin={ANIMATION_BEGIN}
        connectNulls
        hide={hidden}
      />
    </>
  );
}
