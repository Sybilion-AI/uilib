interface HistoricalLineProps {
    color: string;
    isDarkTheme: boolean;
    hidden: boolean;
    animate: boolean;
    animationDuration: number;
    animationBegin: number;
    name?: string;
    dataKey?: string;
}
export declare function HistoricalLine({ color, isDarkTheme, hidden, animate, animationDuration, animationBegin, name, dataKey, }: HistoricalLineProps): import("react/jsx-runtime").JSX.Element;
export {};
