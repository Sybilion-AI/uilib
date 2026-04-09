/**
 * Default colors for forecast visualization
 */
const FORECAST_COLORS = {
    historical: {
        light: '#000000',
        dark: '#ffffff',
    },
    forecast: {
        light: '#3a0087',
        dark: '#8b5cf6',
    },
    confidence: {
        light: 'rgba(58, 0, 135, 0.35)',
        dark: 'rgba(139, 92, 246, 0.35)',
    },
    boundary: {
        positive: '#77d400',
        negative: '#fc512b',
        neutral: '#ffae00',
    },
};
/**
 * Default chart margins
 */
const CHART_MARGINS = {
    top: 20,
    right: 30,
    bottom: 20,
    left: -10,
};
/**
 * Animation durations in milliseconds
 */
const ANIMATION_DURATION = 800;
const ANIMATION_BEGIN = 0;
/**
 * Default chart height
 */
const DEFAULT_CHART_HEIGHT = 400;

export { ANIMATION_BEGIN, ANIMATION_DURATION, CHART_MARGINS, DEFAULT_CHART_HEIGHT, FORECAST_COLORS };
