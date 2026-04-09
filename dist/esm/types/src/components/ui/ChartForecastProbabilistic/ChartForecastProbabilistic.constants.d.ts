/**
 * Chart margins
 */
export declare const CHART_MARGINS: {
    top: number;
    right: number;
    bottom: number;
    left: number;
};
/**
 * Default chart height
 */
export declare const DEFAULT_CHART_HEIGHT = 400;
/**
 * Animation settings
 */
export declare const ANIMATION_DURATION = 800;
export declare const ANIMATION_BEGIN = 0;
/**
 * Color schemes for light and dark themes
 */
export declare const COLORS: {
    historical: {
        light: string;
        dark: string;
    };
    forecast: {
        light: string;
        dark: string;
    };
    quantileBands: {
        light: string;
        dark: string;
    };
};
/**
 * Quantile data keys mapping
 */
export declare const QUANTILE_KEYS: {
    readonly '0.1': "q10";
    readonly '0.15': "q15";
    readonly '0.25': "q25";
    readonly '0.5': "q50";
    readonly '0.75': "q75";
    readonly '0.85': "q85";
    readonly '0.9': "q90";
};
