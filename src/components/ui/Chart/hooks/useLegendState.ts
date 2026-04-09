import { useState } from 'react';

/**
 * Hook to manage chart legend state
 * Handles showing/hiding series on legend click
 */
export function useLegendState() {
  const [hiddenSeries, setHiddenSeries] = useState<Set<string>>(new Set());

  const toggleSeries = (seriesName: string) => {
    setHiddenSeries(prev => {
      const newSet = new Set(prev);
      if (newSet.has(seriesName)) {
        newSet.delete(seriesName);
      } else {
        newSet.add(seriesName);
      }
      return newSet;
    });
  };

  const clearHiddenSeries = () => {
    setHiddenSeries(new Set());
  };

  const showOnlySeries = (dataKey: string, allDataKeys: string[]) => {
    setHiddenSeries(
      new Set(allDataKeys.filter(key => key !== dataKey)),
    );
  };

  return { hiddenSeries, toggleSeries, clearHiddenSeries, showOnlySeries };
}
