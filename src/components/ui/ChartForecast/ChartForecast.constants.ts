/**
 * Default colors for forecast visualization
 */
export const FORECAST_COLORS = {
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
} as const;

/**
 * Line styles for different quantiles (matching Plotly patterns)
 */
export const LINE_STYLES = ['dot', 'solid', 'dashdot', 'longdashdot'] as const;

/**
 * Confidence horizons in order of preference
 */
export const CONFIDENCE_HORIZONS = ['24m', '12m', '6m', '60m'] as const;

/**
 * Default chart margins
 */
export const CHART_MARGINS = {
  top: 20,
  right: 30,
  bottom: 20,
  left: -10,
} as const;

/**
 * Animation durations in milliseconds
 */
export const ANIMATION_DURATION = 800;
export const ANIMATION_BEGIN = 0;

/**
 * Default chart height
 */
export const DEFAULT_CHART_HEIGHT = 400;
