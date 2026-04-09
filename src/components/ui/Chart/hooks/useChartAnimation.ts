import { useEffect, useState } from 'react';

/**
 * Hook to manage chart animation state
 * Triggers animation on data change and resets after duration
 */
export function useChartAnimation(chartData: unknown[], duration = 1000) {
  const [shouldAnimate, setShouldAnimate] = useState(false);

  useEffect(() => {
    setShouldAnimate(true);
    const timer = setTimeout(() => setShouldAnimate(false), duration);
    return () => clearTimeout(timer);
  }, [chartData, duration]);

  return shouldAnimate;
}
