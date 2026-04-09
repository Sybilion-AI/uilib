/**
 * Default colors for forecast visualization
 */
export declare const FORECAST_COLORS: {
    readonly historical: {
        readonly light: "#000000";
        readonly dark: "#ffffff";
    };
    readonly forecast: {
        readonly light: "#3a0087";
        readonly dark: "#8b5cf6";
    };
    readonly confidence: {
        readonly light: "rgba(58, 0, 135, 0.35)";
        readonly dark: "rgba(139, 92, 246, 0.35)";
    };
    readonly boundary: {
        readonly positive: "#77d400";
        readonly negative: "#fc512b";
        readonly neutral: "#ffae00";
    };
};
/**
 * Line styles for different quantiles (matching Plotly patterns)
 */
export declare const LINE_STYLES: readonly ["dot", "solid", "dashdot", "longdashdot"];
/**
 * Confidence horizons in order of preference
 */
export declare const CONFIDENCE_HORIZONS: readonly ["24m", "12m", "6m", "60m"];
/**
 * Default chart margins
 */
export declare const CHART_MARGINS: {
    readonly top: 20;
    readonly right: 30;
    readonly bottom: 20;
    readonly left: -10;
};
/**
 * Animation durations in milliseconds
 */
export declare const ANIMATION_DURATION = 800;
export declare const ANIMATION_BEGIN = 0;
/**
 * Default chart height
 */
export declare const DEFAULT_CHART_HEIGHT = 400;
