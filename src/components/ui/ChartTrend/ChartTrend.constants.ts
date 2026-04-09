/**
 * Colors for trend visualization
 */
export const TREND_COLORS = {
  historical: {
    light: 'rgba(44, 0, 73, 1)',
    dark: 'rgba(139, 92, 246, 1)',
  },
  historicalAverage: {
    light: 'rgb(50, 0, 117)',
    dark: 'rgb(139, 92, 246)',
  },
  boundary: {
    positive: '#77d400',
    negative: '#fc512b',
    neutral: '#8c8c8c',
  },
  area: {
    positive: 'rgba(119, 212, 0, 0.2)',
    negative: 'rgba(252, 81, 43, 0.2)',
    neutral: 'rgba(140, 140, 140, 0.2)',
  },
} as const;

/**
 * Default chart margins
 */
export const CHART_MARGINS = {
  top: 40,
  right: 30,
  bottom: 20,
  left: -10,
} as const;

/**
 * Animation settings
 */
export const ANIMATION_DURATION = 800;
export const ANIMATION_BEGIN = 0;

/**
 * Default chart height
 */
export const DEFAULT_CHART_HEIGHT = 400;

/**
 * Default focus years (how many years to show before last data point)
 */
export const DEFAULT_FOCUS_YEARS = 4;
