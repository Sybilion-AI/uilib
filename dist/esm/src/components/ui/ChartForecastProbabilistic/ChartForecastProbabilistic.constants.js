/**
 * Chart margins
 */
const CHART_MARGINS = {
    top: 10,
    right: 10,
    bottom: 30,
    left: 10,
};
/**
 * Default chart height
 */
const DEFAULT_CHART_HEIGHT = 400;
/**
 * Animation settings
 */
const ANIMATION_DURATION = 800;
const ANIMATION_BEGIN = 0;
/**
 * Color schemes for light and dark themes
 */
const COLORS = {
    historical: {
        light: '#3b82f6', // blue-500
        dark: '#60a5fa', // blue-400
    },
    forecast: {
        light: '#8b5cf6', // violet-500
        dark: '#a78bfa', // violet-400
    },
    quantileBands: {
        light: '#8b5cf6', // violet-500
        dark: '#a78bfa', // violet-400
    },
};
/**
 * Quantile data keys mapping
 */
const QUANTILE_KEYS = {
    '0.1': 'q10',
    '0.15': 'q15',
    '0.25': 'q25',
    '0.5': 'q50',
    '0.75': 'q75',
    '0.85': 'q85',
    '0.9': 'q90',
};

export { ANIMATION_BEGIN, ANIMATION_DURATION, CHART_MARGINS, COLORS, DEFAULT_CHART_HEIGHT, QUANTILE_KEYS };
