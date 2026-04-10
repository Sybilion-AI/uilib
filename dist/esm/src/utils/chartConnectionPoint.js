/**
 * Find the last valid historical data point (filtering out null/undefined values)
 */
function findLastValidHistoricalPoint(historical) {
    const validPoints = historical.filter(([, value]) => value !== null && value !== undefined);
    return validPoints.length > 0 ? validPoints[validPoints.length - 1] : null;
}
/**
 * Normalize date to first day of month for comparison (YYYY-MM-01)
 */
function normalizeToMonthStart(date) {
    const d = new Date(date);
    return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-01`;
}
/**
 * Find the earliest date from forecast_series keys
 * This represents the first forecast date
 */
function findEarliestForecastDate(forecastSeries) {
    const dates = Object.keys(forecastSeries).sort((a, b) => new Date(a).getTime() - new Date(b).getTime());
    return dates.length > 0 ? dates[0] : null;
}
/**
 * Get the previous month date (first day of previous month)
 */
function getPreviousMonth(date) {
    const d = new Date(date);
    d.setMonth(d.getMonth() - 1);
    return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-01`;
}

export { findEarliestForecastDate, findLastValidHistoricalPoint, getPreviousMonth, normalizeToMonthStart };
