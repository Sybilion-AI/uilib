const FORECAST_KEY_RE = /^forecast_(\d+)$/;
function collectForecastSeriesIds(chartData) {
    const ids = new Set();
    for (const row of chartData) {
        for (const key of Object.keys(row)) {
            const m = key.match(FORECAST_KEY_RE);
            if (m)
                ids.add(Number(m[1]));
        }
    }
    return [...ids].sort((a, b) => a - b);
}
function forecastSeriesKey(id) {
    return `forecast_${id}`;
}
function hasForecastValue(point, id) {
    const v = point[forecastSeriesKey(id)];
    return v !== null && v !== undefined && typeof v === 'number';
}
/**
 * Injects `forecast_{id}` on the row before each series’ first forecast month (historical value)
 * so dashed forecast lines meet the historical line. Matches sybilion-client bridge behavior.
 * Never overwrites an existing forecast value on that row.
 */
function ensureChartForecastBridge(chartData, options) {
    if (options?.disabled || chartData.length === 0) {
        return chartData;
    }
    const sorted = [...chartData].sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
    const seriesIds = options?.forecastSeriesIds?.length
        ? [...options.forecastSeriesIds]
        : collectForecastSeriesIds(sorted);
    if (seriesIds.length === 0) {
        return sorted;
    }
    const rows = sorted.map(p => ({ ...p }));
    for (const id of seriesIds) {
        const dataKey = forecastSeriesKey(id);
        let firstForecastDate = null;
        for (const row of rows) {
            if (hasForecastValue(row, id)) {
                firstForecastDate = row.date;
                break;
            }
        }
        if (!firstForecastDate)
            continue;
        const prevMonthNorm = normalizeToMonthStart(getPreviousMonth(firstForecastDate));
        const prevMonthIdx = rows.findIndex(row => normalizeToMonthStart(row.date) === prevMonthNorm);
        if (prevMonthIdx >= 0) {
            const existing = rows[prevMonthIdx][dataKey];
            const hPrev = rows[prevMonthIdx].historical;
            if ((existing === undefined || existing === null) &&
                hPrev !== undefined &&
                hPrev !== null) {
                rows[prevMonthIdx] = {
                    ...rows[prevMonthIdx],
                    [dataKey]: hPrev,
                };
            }
        }
        const lastHist = findLastValidHistoricalChartPoint(rows);
        if (!lastHist)
            continue;
        const normLast = normalizeToMonthStart(lastHist.date);
        const normFirst = normalizeToMonthStart(firstForecastDate);
        if (normLast >= normFirst)
            continue;
        const idxLast = rows.findIndex(r => r.date === lastHist.date);
        if (idxLast < 0)
            continue;
        const existingAtLast = rows[idxLast][dataKey];
        if (existingAtLast !== undefined && existingAtLast !== null)
            continue;
        const hLast = rows[idxLast].historical;
        if (hLast !== undefined && hLast !== null) {
            rows[idxLast] = { ...rows[idxLast], [dataKey]: hLast };
        }
    }
    return rows;
}
/**
 * Find the last valid historical data point from ChartDataPoint array
 */
function findLastValidHistoricalChartPoint(historical) {
    const validPoints = historical.filter(point => point.historical !== null && point.historical !== undefined);
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
 * Get the previous month date (first day of previous month)
 */
function getPreviousMonth(date) {
    const d = new Date(date);
    d.setMonth(d.getMonth() - 1);
    return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-01`;
}

export { ensureChartForecastBridge, findLastValidHistoricalChartPoint, getPreviousMonth, normalizeToMonthStart };
