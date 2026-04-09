/**
 * Hook to manage chart legend state
 * Handles showing/hiding series on legend click
 */
export declare function useLegendState(): {
    hiddenSeries: Set<string>;
    toggleSeries: (seriesName: string) => void;
    clearHiddenSeries: () => void;
    showOnlySeries: (dataKey: string, allDataKeys: string[]) => void;
};
