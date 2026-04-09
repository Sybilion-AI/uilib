/**
 * Format number for display (with k/m abbreviations)
 */
export declare const formatNumber: (value: number) => string;
/**
 * Format Y-axis number with smart rounding based on magnitude
 */
export declare const formatYAxisNumber: (value: number) => string;
/**
 * Generate simple Y-axis ticks
 * - Get the highest chart point (max)
 * - Round max to nearest appropriate value
 * - Divide rounded max by 10 and round to get the step
 * - Add legend for every step from top to bottom
 * - No extra gaps from top/bottom
 */
export declare const generateRoundedYTicks: (min: number, max: number) => number[];
/**
 * Format date for display
 */
export declare const formatDate: (dateStr: string, long?: boolean) => string;
