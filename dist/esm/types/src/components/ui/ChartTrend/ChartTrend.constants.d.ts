/**
 * Colors for trend visualization
 */
export declare const TREND_COLORS: {
    readonly historical: {
        readonly light: "rgba(44, 0, 73, 1)";
        readonly dark: "rgba(139, 92, 246, 1)";
    };
    readonly historicalAverage: {
        readonly light: "rgb(50, 0, 117)";
        readonly dark: "rgb(139, 92, 246)";
    };
    readonly boundary: {
        readonly positive: "#77d400";
        readonly negative: "#fc512b";
        readonly neutral: "#8c8c8c";
    };
    readonly area: {
        readonly positive: "rgba(119, 212, 0, 0.2)";
        readonly negative: "rgba(252, 81, 43, 0.2)";
        readonly neutral: "rgba(140, 140, 140, 0.2)";
    };
};
/**
 * Default chart margins
 */
export declare const CHART_MARGINS: {
    readonly top: 40;
    readonly right: 30;
    readonly bottom: 20;
    readonly left: -10;
};
/**
 * Animation settings
 */
export declare const ANIMATION_DURATION = 800;
export declare const ANIMATION_BEGIN = 0;
/**
 * Default chart height
 */
export declare const DEFAULT_CHART_HEIGHT = 400;
/**
 * Default focus years (how many years to show before last data point)
 */
export declare const DEFAULT_FOCUS_YEARS = 4;
