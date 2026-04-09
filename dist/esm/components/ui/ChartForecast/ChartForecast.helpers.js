import { findEarliestForecastDate, getPreviousMonth, normalizeToMonthStart } from '../../../utils/chartConnectionPoint.js';

/**
 * Transform historical and forecast data into Recharts format
 */
const transformToChartData = (historical, forecast, horizon = '24m') => {
    const chartData = [];
    // Find earliest forecast date and connection point
    const earliestForecastDate = findEarliestForecastDate(forecast.forecast_series);
    const connectionDate = earliestForecastDate
        ? getPreviousMonth(earliestForecastDate)
        : null;
    const normalizedConnectionDate = connectionDate
        ? normalizeToMonthStart(connectionDate)
        : null;
    // Add historical data points
    historical.forEach(([date, value]) => {
        chartData.push({
            date,
            historical: value,
        });
    });
    // Add ALL original forecast data points FIRST - this preserves all forecast values
    Object.entries(forecast.forecast_series).forEach(([date, values]) => {
        const existingPoint = chartData.find(p => p.date === date);
        normalizeToMonthStart(date);
        if (existingPoint) {
            // Point exists from historical data
            // CRITICAL: Always use the forecast value for actual forecast dates
            // Only use historical value if this is the connection point date
            if (connectionDate && date === connectionDate) {
                // This is the connection point - use historical value
                existingPoint.forecast = existingPoint.historical;
            }
            else {
                // This is an actual forecast date - preserve forecast value
                existingPoint.forecast = values.forecast;
            }
            existingPoint.lower_boundary = values.lower_boundary?.[horizon];
            existingPoint.upper_boundary = values.upper_boundary?.[horizon];
        }
        else {
            // New point - add forecast data
            chartData.push({
                date,
                forecast: values.forecast,
                lower_boundary: values.lower_boundary?.[horizon],
                upper_boundary: values.upper_boundary?.[horizon],
            });
        }
    });
    // Add connection point if needed (at previous month before first forecast)
    if (connectionDate && normalizedConnectionDate) {
        const connectionPointExists = chartData.find(p => p.date === connectionDate);
        const historicalPointForConnection = historical.find(([date]) => {
            const normalizedDate = normalizeToMonthStart(date);
            return normalizedDate === normalizedConnectionDate;
        });
        if (!connectionPointExists && historicalPointForConnection) {
            const [, historicalValue] = historicalPointForConnection;
            // Add connection point at previous month
            chartData.push({
                date: connectionDate,
                historical: historicalValue,
                forecast: historicalValue, // Connection point uses historical value
            });
        }
    }
    // Sort by date
    return chartData.sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
};

export { transformToChartData };
