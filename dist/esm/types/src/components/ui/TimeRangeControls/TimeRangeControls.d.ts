export type TimeRangeControlsProps = {
    timeRange: string;
    onTimeRangeChange: (range: string) => void;
    loading?: boolean;
};
export declare const TimeRangeControls: import("react").MemoExoticComponent<({ timeRange, onTimeRangeChange, loading }: TimeRangeControlsProps) => import("react/jsx-runtime").JSX.Element>;
export declare const TimeRangeSelect: import("react").MemoExoticComponent<({ timeRange, onTimeRangeChange, loading, }: TimeRangeControlsProps & {
    loading: boolean;
}) => import("react/jsx-runtime").JSX.Element>;
