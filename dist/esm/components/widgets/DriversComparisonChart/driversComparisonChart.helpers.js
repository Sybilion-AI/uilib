import { normalizeToMonthStart, getPreviousMonth, getNextMonth } from '../../../utils/chartConnectionPoint.js';

const DRIVER_FORECAST_ID_BASE = 8_000_000;
const INITIAL_VISIBLE_SERIES_COUNT = 3;
/** Months of historical context before the earliest forecast month (inclusive). */
const DRIVER_COMPARISON_CHART_LEAD_MONTHS = 6;
/** Ignore leading months where drivers are numerically zero (API often fills 0; lines look empty until real signal). */
const DRIVER_FORECAST_NONZERO_EPS = 1e-9;
function formatSeriesImportance(value) {
    if (value === null)
        return '—';
    return `${value.toFixed(1)}%`;
}
function mergeBacktestsChartData(payload) {
    if (!payload?.target?.normalized_series)
        return [];
    const norm = (d) => normalizeToMonthStart(d);
    const map = new Map();
    const targetSeries = payload.target.normalized_series;
    Object.entries(targetSeries).forEach(([dateStr, val]) => {
        if (val === null || val === undefined)
            return;
        const k = norm(dateStr);
        const existing = map.get(k) ?? { date: k };
        existing.historical = val;
        map.set(k, existing);
    });
    if (payload.drivers?.length) {
        const sorted = [...payload.drivers]
            .filter(d => d.normalized_series &&
            Object.keys(d.normalized_series).some(key => d.normalized_series[key] != null))
            .sort((a, b) => String(a.id).localeCompare(String(b.id)));
        sorted.forEach((driver, idx) => {
            const fid = DRIVER_FORECAST_ID_BASE + idx;
            const series = driver.normalized_series;
            Object.entries(series).forEach(([dateStr, val]) => {
                if (val === null || val === undefined)
                    return;
                const k = norm(dateStr);
                const existing = map.get(k) ?? { date: k };
                existing[`forecast_${fid}`] = val;
                map.set(k, existing);
            });
        });
    }
    return Array.from(map.values()).sort((a, b) => a.date.localeCompare(b.date));
}
/** While drivers comparison is not loaded: dataset historical only. After load: normalized historical from target.normalized_series (see mergeBacktestsChartData) replaces it. */
function mergeDatasetHistoricalWithBacktestsChartData(datasetHistorical, backtestsMerged) {
    if (backtestsMerged.length === 0) {
        if (datasetHistorical.length === 0)
            return [];
        return datasetHistorical
            .map(p => {
            const k = normalizeToMonthStart(p.date);
            const histVal = p.historical;
            return {
                date: k,
                ...(typeof histVal === 'number' ? { historical: histVal } : {}),
            };
        })
            .sort((a, b) => a.date.localeCompare(b.date));
    }
    return backtestsMerged;
}
/** Lower-median of ISO month strings (YYYY-MM-01 sorts lexicographically). */
function medianSortedIsoMonth(months) {
    const s = [...months].sort((a, b) => a.localeCompare(b));
    return s[Math.floor((s.length - 1) / 2)];
}
/**
 * For each driver, first month with materially non-zero value; anchor = median of those months.
 * (Min is too early with outliers; max matched logs where one driver started 2017-12 while most started 2015-01.)
 */
function getZoomAnchorMonthFromDriverMaterialStarts(points, forecastIds) {
    const perDriverFirstMaterial = [];
    for (const id of forecastIds) {
        let minForId = null;
        for (const p of points) {
            const v = p[`forecast_${id}`];
            if (typeof v !== 'number' ||
                !Number.isFinite(v) ||
                Math.abs(v) <= DRIVER_FORECAST_NONZERO_EPS) {
                continue;
            }
            const d = normalizeToMonthStart(p.date);
            if (minForId === null || d.localeCompare(minForId) < 0)
                minForId = d;
        }
        if (minForId === null) {
            return { anchor: null, perDriverFirstMaterial };
        }
        perDriverFirstMaterial.push(minForId);
    }
    const anchor = medianSortedIsoMonth(perDriverFirstMaterial);
    return { anchor, perDriverFirstMaterial };
}
function subtractMonthsFromMonthStart(date, count) {
    let result = date;
    for (let i = 0; i < count; i++) {
        result = getPreviousMonth(result);
    }
    return result;
}
/**
 * Backtests payload often starts at the same month for target + drivers, so xMin falls
 * in a range with no rows. Prepend historical-only months from raw dataset series
 * (scaled to the first normalized point) so the lead-in shows the target line alone.
 */
function prependHistoricalLeadFromDataset(points, datasetHistorical, xMin) {
    if (points.length === 0)
        return points;
    const firstMonth = normalizeToMonthStart(points[0].date);
    if (xMin.localeCompare(firstMonth) >= 0)
        return points;
    const rawByMonth = new Map();
    for (const p of datasetHistorical) {
        const k = normalizeToMonthStart(p.date);
        const v = p.historical;
        if (typeof v === 'number' && Number.isFinite(v))
            rawByMonth.set(k, v);
    }
    const histFirst = points[0].historical;
    const rawFirst = rawByMonth.get(firstMonth);
    if (typeof histFirst !== 'number' ||
        !Number.isFinite(histFirst) ||
        typeof rawFirst !== 'number' ||
        !Number.isFinite(rawFirst) ||
        Math.abs(rawFirst) <= 1e-15) {
        return points;
    }
    const lead = [];
    let m = xMin;
    while (m.localeCompare(firstMonth) < 0) {
        const rawM = rawByMonth.get(m);
        if (typeof rawM === 'number' && Number.isFinite(rawM)) {
            lead.push({
                date: m,
                historical: histFirst * (rawM / rawFirst),
            });
        }
        m = getNextMonth(m);
    }
    return [...lead, ...points];
}
function buildDriversComparisonChartData(mergedWithHistorical, datasetHistorical, forecastIds) {
    if (mergedWithHistorical.length === 0)
        return mergedWithHistorical;
    if (forecastIds.length === 0)
        return mergedWithHistorical;
    const { anchor: anchorMonth } = getZoomAnchorMonthFromDriverMaterialStarts(mergedWithHistorical, forecastIds);
    if (anchorMonth === null)
        return mergedWithHistorical;
    const xMin = subtractMonthsFromMonthStart(anchorMonth, DRIVER_COMPARISON_CHART_LEAD_MONTHS);
    const withLead = prependHistoricalLeadFromDataset(mergedWithHistorical, datasetHistorical, xMin);
    return withLead.filter(p => normalizeToMonthStart(p.date) >= xMin);
}

export { DRIVER_COMPARISON_CHART_LEAD_MONTHS, DRIVER_FORECAST_ID_BASE, INITIAL_VISIBLE_SERIES_COUNT, buildDriversComparisonChartData, formatSeriesImportance, getZoomAnchorMonthFromDriverMaterialStarts, mergeBacktestsChartData, mergeDatasetHistoricalWithBacktestsChartData, prependHistoricalLeadFromDataset, subtractMonthsFromMonthStart };
