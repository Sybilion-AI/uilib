import { useState } from 'react';

/**
 * Hook to manage chart legend state
 * Handles showing/hiding series on legend click
 */
function useLegendState() {
    const [hiddenSeries, setHiddenSeries] = useState(new Set());
    const toggleSeries = (seriesName) => {
        setHiddenSeries(prev => {
            const newSet = new Set(prev);
            if (newSet.has(seriesName)) {
                newSet.delete(seriesName);
            }
            else {
                newSet.add(seriesName);
            }
            return newSet;
        });
    };
    const clearHiddenSeries = () => {
        setHiddenSeries(new Set());
    };
    const showOnlySeries = (dataKey, allDataKeys) => {
        setHiddenSeries(new Set(allDataKeys.filter(key => key !== dataKey)));
    };
    return { hiddenSeries, toggleSeries, clearHiddenSeries, showOnlySeries };
}

export { useLegendState };
