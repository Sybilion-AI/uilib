/**
 * Format number for display (with k/m abbreviations)
 */
const formatNumber = (value) => {
    if (Math.abs(value) >= 1000000) {
        return (value / 1000000).toFixed(1).replace(/\.0$/, '') + 'M';
    }
    else if (Math.abs(value) >= 1000) {
        return (value / 1000).toFixed(1).replace(/\.0$/, '') + 'K';
    }
    return value.toFixed(0);
};
/**
 * Round a number based on its magnitude
 * - 2 digits (10-99): round to nearest 10
 * - 3 digits (100-999): round to nearest 100
 * - 4 digits (1000-9999): round to nearest 1000
 * - etc.
 */
const roundByMagnitude = (value) => {
    const absValue = Math.abs(value);
    // Handle zero and very small numbers
    if (absValue === 0)
        return 0;
    if (absValue < 10)
        return Math.round(value);
    // Calculate number of digits
    const numDigits = Math.floor(Math.log10(absValue)) + 1;
    // Round to nearest 10^(n-1) where n is number of digits
    const roundingFactor = Math.pow(10, numDigits - 1);
    return Math.round(value / roundingFactor) * roundingFactor;
};
/**
 * Format Y-axis number with smart rounding based on magnitude
 */
const formatYAxisNumber = (value) => {
    const rounded = roundByMagnitude(value);
    return rounded.toFixed(0);
};
/**
 * Generate simple Y-axis ticks
 * - Get the highest chart point (max)
 * - Round max to nearest appropriate value
 * - Divide rounded max by 10 and round to get the step
 * - Add legend for every step from top to bottom
 * - No extra gaps from top/bottom
 */
const generateRoundedYTicks = (min, max) => {
    if (min === max)
        return [min];
    if (max <= 0)
        return [0];
    const rawStep = (max - min) / 10; // generate 10 ticks
    // Round step to nearest power of 10 (10, 100, 1000, ...)
    const magnitude = Math.floor(Math.log10(rawStep));
    const powerOf10 = Math.pow(10, magnitude);
    const step = rawStep >= powerOf10 * 5 ? powerOf10 * 10 : powerOf10;
    // find start round number that > min
    const startMin = Math.ceil(min / step) * step;
    // find end round number that < max
    const endMax = Math.floor(max / step) * step;
    return Array.from({ length: (endMax - startMin) / step + 1 }, (_, i) => startMin + i * step);
};
/**
 * Format date for display
 */
const formatDate = (dateStr, long = false) => {
    const date = new Date(dateStr);
    if (long) {
        return date.toLocaleDateString('en-US', {
            month: 'long',
            year: 'numeric',
        });
    }
    return date.toLocaleDateString('en-US', {
        month: 'short',
        year: '2-digit',
    });
};

export { formatDate, formatNumber, formatYAxisNumber, generateRoundedYTicks };
