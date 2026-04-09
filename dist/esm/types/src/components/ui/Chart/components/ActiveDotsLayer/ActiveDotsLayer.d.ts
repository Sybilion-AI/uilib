interface ActiveDot {
    x: number;
    y: number;
    color: string;
}
interface ActiveDotsLayerProps {
    data: ActiveDot[];
    isDarkTheme: boolean;
}
export declare function ActiveDotsLayer({ data, isDarkTheme }: ActiveDotsLayerProps): import("react/jsx-runtime").JSX.Element;
export {};
