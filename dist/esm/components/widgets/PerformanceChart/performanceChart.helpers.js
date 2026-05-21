import { normalizeToMonthStart, getPreviousMonth } from '../../../utils/chartConnectionPoint.js';

/** Legacy: API backtest spaghetti lines used `SPAGHETTI_FORECAST_ID_BASE + i` (spaghetti view now uses drift per-horizon instead). */
const SPAGHETTI_FORECAST_ID_BASE = 6000;
/** Model PER_HORIZON_TO_SPAGHETTI lines use `SPAGHETTI_MODEL_PER_HORIZON_ID_BASE + i`. */
const SPAGHETTI_MODEL_PER_HORIZON_ID_BASE = 7000;
/** Drift PER_HORIZON_TO_SPAGHETTI lines use `SPAGHETTI_DRIFT_PER_HORIZON_ID_BASE + i`. */
const SPAGHETTI_DRIFT_PER_HORIZON_ID_BASE = 8000;
const SPAGHETTI_DRIFT_ID_RANGE_END = 9000;
function isSpaghettiModelPerHorizonLineId(id) {
    return (id >= SPAGHETTI_MODEL_PER_HORIZON_ID_BASE &&
        id < SPAGHETTI_DRIFT_PER_HORIZON_ID_BASE);
}
function isSpaghettiDriftPerHorizonLineId(id) {
    return (id >= SPAGHETTI_DRIFT_PER_HORIZON_ID_BASE &&
        id < SPAGHETTI_DRIFT_ID_RANGE_END);
}
/**
 * Anchor a spaghetti forecast line to the historical curve at the month before
 * the earliest forecast point (same strategy as ensureForecastConnectionPoint).
 */
function addSpaghettiHistoricalBridgeForSeries(map, dataKey, earliestForecastDate) {
    if (earliestForecastDate === null)
        return;
    const connectionDate = normalizeToMonthStart(getPreviousMonth(earliestForecastDate));
    const row = map.get(connectionDate);
    if (row === undefined)
        return;
    const hist = row.historical;
    if (typeof hist !== 'number' || !Number.isFinite(hist))
        return;
    const existingVal = row[dataKey];
    if (typeof existingVal === 'number' && Number.isFinite(existingVal)) {
        return;
    }
    row[dataKey] = hist;
    map.set(connectionDate, row);
}
/**
 * Converts `performance.model` / `performance.drift` per-horizon forecasts into synthetic
 * backtest-shaped entries: each line is [horizon_1[i], …, horizon_n[i]] as date→value points
 * (aligned by sorted key index per horizon).
 */
function buildPerHorizonSpaghettiEntries(forecastRoot, horizonKeys) {
    if (!forecastRoot?.forecasts || horizonKeys.length === 0)
        return [];
    const forecasts = forecastRoot.forecasts;
    const sortedHorizons = [...horizonKeys].sort((a, b) => {
        const na = parseInt(a.replace(/\D/g, ''), 10) || 0;
        const nb = parseInt(b.replace(/\D/g, ''), 10) || 0;
        return na - nb;
    });
    const normalizeDateKey = (d) => d.split(' ')[0];
    const perHorizonKeyLists = sortedHorizons.map(h => {
        const m = forecasts[h];
        if (!m || typeof m !== 'object')
            return [];
        return Object.keys(m).sort((a, b) => normalizeDateKey(a).localeCompare(normalizeDateKey(b)));
    });
    const lengths = perHorizonKeyLists.map(l => l.length).filter(l => l > 0);
    if (lengths.length === 0)
        return [];
    const n = Math.min(...lengths);
    const entries = [];
    for (let i = 0; i < n; i++) {
        const forecast_series = {};
        for (let hi = 0; hi < sortedHorizons.length; hi++) {
            const h = sortedHorizons[hi];
            const keys = perHorizonKeyLists[hi];
            const dateKey = keys[i];
            const rawVal = forecasts[h]?.[dateKey];
            if (typeof rawVal !== 'number' || !Number.isFinite(rawVal))
                continue;
            const norm = normalizeToMonthStart(normalizeDateKey(dateKey));
            forecast_series[norm] = rawVal;
        }
        const dates = Object.keys(forecast_series).sort();
        if (dates.length === 0)
            continue;
        entries.push({
            forecast_start: dates[0],
            forecast_end: dates[dates.length - 1],
            forecast_series,
        });
    }
    return entries;
}
/**
 * Same row alignment as {@link buildPerHorizonSpaghettiEntries}: row `i` uses each horizon's
 * i-th sorted forecast month; `dates[i]` is horizon_1's month at that row (Date column).
 * Use this for custom dialog seed + “copy statistical baseline (drift)” prefill.
 */
function buildDriftSpaghettiMatrixForCustomDialog(driftRoot, horizonKeys) {
    if (!driftRoot?.forecasts || horizonKeys.length === 0)
        return null;
    const forecasts = driftRoot.forecasts;
    const sortedHorizons = [...horizonKeys].sort((a, b) => {
        const na = parseInt(a.replace(/\D/g, ''), 10) || 0;
        const nb = parseInt(b.replace(/\D/g, ''), 10) || 0;
        return na - nb;
    });
    const normalizeDateKey = (d) => d.split(' ')[0];
    const perHorizonKeyLists = sortedHorizons.map(h => {
        const m = forecasts[h];
        if (!m || typeof m !== 'object')
            return [];
        return Object.keys(m).sort((a, b) => normalizeDateKey(a).localeCompare(normalizeDateKey(b)));
    });
    const lengths = perHorizonKeyLists.map(l => l.length).filter(l => l > 0);
    if (lengths.length === 0)
        return null;
    const n = Math.min(...lengths);
    const dates = [];
    const grid = [];
    const perHorizonDates = [];
    for (let i = 0; i < n; i++) {
        const row = [];
        const dateRow = [];
        for (let hi = 0; hi < sortedHorizons.length; hi++) {
            const h = sortedHorizons[hi];
            const keys = perHorizonKeyLists[hi];
            const dateKey = keys[i];
            dateRow.push(normalizeToMonthStart(normalizeDateKey(dateKey)));
            const rawVal = forecasts[h]?.[dateKey];
            const v = typeof rawVal === 'number' && Number.isFinite(rawVal) ? rawVal : NaN;
            row.push(v);
        }
        const d0 = perHorizonKeyLists[0][i];
        dates.push(normalizeToMonthStart(normalizeDateKey(d0)));
        perHorizonDates.push(dateRow);
        grid.push(row.map(c => (Number.isFinite(c) ? c : 0)));
    }
    return {
        dates,
        grid,
        perHorizonDates,
    };
}
/**
 * Prefill for custom performance when copying drift layout: each spaghetti row is flat at the
 * historical value for the month before the earliest forecast month in that row (same anchor as
 * chart connection-point logic).
 */
function spaghettiGridFromHistoricalPreviousMonth(perHorizonDates, horizonCount, historicalByDate) {
    const norm = (d) => normalizeToMonthStart(String(d).split(' ')[0] ?? d);
    return perHorizonDates.map(row => {
        if (!Array.isArray(row) || row.length === 0) {
            return Array.from({ length: horizonCount }, () => 0);
        }
        const sorted = [...row]
            .map(d => norm(String(d)))
            .filter(Boolean)
            .sort((a, b) => a.localeCompare(b));
        const earliest = sorted[0];
        if (!earliest) {
            return Array.from({ length: horizonCount }, () => 0);
        }
        const prevMonth = normalizeToMonthStart(getPreviousMonth(earliest));
        const v = historicalByDate.get(prevMonth);
        const flat = typeof v === 'number' && Number.isFinite(v) ? v : 0;
        return Array.from({ length: horizonCount }, () => flat);
    });
}
/** Mean absolute error / MAPE vs historical for one horizon column of a spaghetti matrix (aligned by month). */
function averageForecastErrorsVsHistoricalForMatrixColumn(matrix, horizonColumnIndex, historicalByDate) {
    const norm = (d) => normalizeToMonthStart(String(d).split(' ')[0] ?? d);
    const maeList = [];
    const mapeList = [];
    const nR = matrix.grid.length;
    for (let r = 0; r < nR; r++) {
        const dSrc = matrix.perHorizonDates?.[r]?.[horizonColumnIndex] ?? matrix.dates[r];
        const d = norm(String(dSrc));
        const actual = historicalByDate.get(d);
        const fc = matrix.grid[r]?.[horizonColumnIndex];
        if (actual === undefined ||
            typeof fc !== 'number' ||
            !Number.isFinite(fc)) {
            continue;
        }
        const err = Math.abs(fc - actual);
        maeList.push(err);
        if (Math.abs(actual) > 1e-9)
            mapeList.push(err / Math.abs(actual));
    }
    if (maeList.length === 0)
        return null;
    return {
        mae: maeList.reduce((a, b) => a + b, 0) / maeList.length,
        mape: mapeList.length > 0
            ? mapeList.reduce((a, b) => a + b, 0) / mapeList.length
            : 0,
    };
}
function mergeSpaghettiMergedBases(a, b) {
    const norm = (d) => normalizeToMonthStart(d);
    const map = new Map();
    const mergePoints = (points) => {
        points.forEach(point => {
            const k = norm(point.date);
            const prev = map.get(k);
            if (!prev) {
                map.set(k, { ...point, date: k });
                return;
            }
            const merged = { ...prev };
            Object.keys(point).forEach(key => {
                if (key === 'date')
                    return;
                if (key.startsWith('forecast_')) {
                    merged[key] = point[key];
                }
            });
            if (point.historical !== undefined) {
                merged.historical = point.historical;
            }
            map.set(k, merged);
        });
    };
    mergePoints(a.mergedData);
    mergePoints(b.mergedData);
    const mergedData = Array.from(map.values()).sort((a, b) => a.date.localeCompare(b.date));
    return {
        mergedData,
        seriesMeta: [...a.seriesMeta, ...b.seriesMeta],
    };
}
function buildSpaghettiMergedChartData(entries, historicalChartData, idBase = SPAGHETTI_FORECAST_ID_BASE) {
    const norm = (d) => normalizeToMonthStart(d);
    const map = new Map();
    historicalChartData.forEach(point => {
        const k = norm(point.date);
        map.set(k, { ...point, date: k });
    });
    const seriesMeta = [];
    entries.forEach((entry, i) => {
        const id = idBase + i;
        const dataKey = `forecast_${id}`;
        seriesMeta.push({
            id,
            label: `${entry.forecast_start} – ${entry.forecast_end}`,
        });
        let earliestForecastDate = null;
        Object.entries(entry.forecast_series).forEach(([dateStr, val]) => {
            if (typeof val !== 'number' || !Number.isFinite(val))
                return;
            const k = norm(dateStr);
            if (earliestForecastDate === null ||
                k.localeCompare(earliestForecastDate) < 0) {
                earliestForecastDate = k;
            }
            const existing = map.get(k) ?? { date: k };
            existing[dataKey] = val;
            map.set(k, existing);
        });
        addSpaghettiHistoricalBridgeForSeries(map, dataKey, earliestForecastDate);
    });
    const mergedData = Array.from(map.values()).sort((a, b) => a.date.localeCompare(b.date));
    return { mergedData, seriesMeta };
}
function mergeUserSeriesForecastIntoSpaghettiPoints(mergedData, seriesId, dates, forecastValues) {
    const norm = (d) => normalizeToMonthStart(d);
    const map = new Map();
    mergedData.forEach(point => {
        const k = norm(point.date);
        map.set(k, { ...point, date: k });
    });
    const dataKey = `forecast_${seriesId}`;
    let earliestForecastDate = null;
    dates.forEach((dateStr, i) => {
        const val = forecastValues[i];
        if (typeof val !== 'number' || !Number.isFinite(val))
            return;
        const k = norm(dateStr);
        if (earliestForecastDate === null ||
            k.localeCompare(earliestForecastDate) < 0) {
            earliestForecastDate = k;
        }
        const existing = map.get(k) ?? { date: k };
        existing[dataKey] = val;
        map.set(k, existing);
    });
    addSpaghettiHistoricalBridgeForSeries(map, dataKey, earliestForecastDate);
    return Array.from(map.values()).sort((a, b) => a.date.localeCompare(b.date));
}
/** Appends forecast-backed user series (from dataset context) onto spaghetti backtest lines. */
function mergeSpaghettiUserSeriesFromForecastData(base, userSeries, forecastData) {
    let mergedData = base.mergedData;
    const extendedMeta = [...base.seriesMeta];
    userSeries.forEach(analysis => {
        const fd = forecastData[String(analysis.id)];
        if (!fd)
            return;
        const { dates, forecastValues } = fd;
        if (dates.length === 0 || forecastValues.length !== dates.length)
            return;
        if (extendedMeta.some(m => m.id === analysis.id))
            return;
        mergedData = mergeUserSeriesForecastIntoSpaghettiPoints(mergedData, analysis.id, dates, forecastValues);
        extendedMeta.push({
            id: analysis.id,
            label: analysis.name?.trim() || 'User series',
        });
    });
    return { mergedData, seriesMeta: extendedMeta };
}
function filterChartDataLast24Months(data, months) {
    if (data.length === 0)
        return [];
    const sorted = [...data].sort((a, b) => a.date.localeCompare(b.date));
    const cutoffDate = new Date(sorted[sorted.length - 1].date);
    cutoffDate.setMonth(cutoffDate.getMonth() - months);
    return sorted.filter(point => new Date(point.date) >= cutoffDate);
}
/** Earlier month string (ISO-style sortable). */
function earlierMonthStart(a, b) {
    return a.localeCompare(b) < 0 ? a : b;
}
/**
 * Spaghetti chart x-range: from two months before the earliest forecast_start
 * (per-horizon synthetic entries + mergeable user forecast series), inclusive.
 * Falls back to last N months when no forecast candidates exist.
 *
 * When `historicalWindowFloor` is set (e.g. first month of per-horizon `filtered24mData`),
 * the range start is floored to that month so the historical line matches the per-horizon tab.
 *
 * When `historicalWindowCeiling` is set (e.g. last month of `filtered24mData`), drops points after
 * that month so spaghetti X matches per-horizon (per-horizon chart trims forecasts past last historical).
 */
function filterSpaghettiDataFromEarliestForecastStart(mergedData, entries, userSeries, forecastData, 
/** Series meta from the first merged batch (e.g. drift) — used to skip duplicate user-series ids. */
firstBatchSeriesMeta, fallbackMonths, extraForecastCandidates, historicalWindowFloor, historicalWindowCeiling) {
    const candidates = [];
    for (const e of entries) {
        candidates.push(normalizeToMonthStart(e.forecast_start));
    }
    extraForecastCandidates?.forEach(e => {
        candidates.push(normalizeToMonthStart(e.forecast_start));
    });
    userSeries.forEach(analysis => {
        const fd = forecastData[String(analysis.id)];
        if (!fd)
            return;
        const { dates, forecastValues } = fd;
        if (dates.length === 0 || forecastValues.length !== dates.length)
            return;
        if (firstBatchSeriesMeta.some(m => m.id === analysis.id))
            return;
        candidates.push(normalizeToMonthStart(dates[0]));
    });
    if (candidates.length === 0) {
        let result = filterChartDataLast24Months(mergedData, fallbackMonths);
        if (historicalWindowFloor && result.length > 0 && mergedData.length > 0) {
            const floor = normalizeToMonthStart(historicalWindowFloor);
            const start = earlierMonthStart(floor, result[0].date);
            const maxDate = result[result.length - 1].date;
            const sorted = [...mergedData].sort((a, b) => a.date.localeCompare(b.date));
            result = sorted.filter(p => p.date >= start && p.date <= maxDate);
        }
        if (historicalWindowCeiling && result.length > 0) {
            const cap = normalizeToMonthStart(historicalWindowCeiling);
            result = result.filter(p => normalizeToMonthStart(String(p.date).split(' ')[0] ?? p.date) <= cap);
        }
        return result;
    }
    const normalizedMin = candidates.reduce((min, c) => c.localeCompare(min) < 0 ? c : min);
    let rangeStart = normalizeToMonthStart(getPreviousMonth(getPreviousMonth(normalizedMin)));
    if (historicalWindowFloor) {
        const floor = normalizeToMonthStart(historicalWindowFloor);
        rangeStart = earlierMonthStart(floor, rangeStart);
    }
    const sorted = [...mergedData].sort((a, b) => a.date.localeCompare(b.date));
    let result = sorted.filter(point => point.date >= rangeStart);
    if (historicalWindowCeiling && result.length > 0) {
        const cap = normalizeToMonthStart(historicalWindowCeiling);
        result = result.filter(p => normalizeToMonthStart(String(p.date).split(' ')[0] ?? p.date) <= cap);
    }
    return result;
}
/**
 * Ensure each spaghetti row has `historical` from {@link historicalChartData} when that month
 * falls in the filtered window — matches per-horizon chart (actuals line), and fills months that
 * exist in history but were missing after merge/filter.
 */
function mergeHistoricalIntoSpaghettiChartData(filteredRows, historicalChartData) {
    if (filteredRows.length === 0 || historicalChartData.length === 0) {
        return filteredRows;
    }
    const norm = (d) => normalizeToMonthStart(String(d).split(' ')[0] ?? d);
    const histByDate = new Map();
    historicalChartData.forEach(p => {
        const v = p.historical;
        if (typeof v !== 'number' || !Number.isFinite(v))
            return;
        histByDate.set(norm(p.date), v);
    });
    const sorted = [...filteredRows].sort((a, b) => a.date.localeCompare(b.date));
    const minD = norm(sorted[0].date);
    const maxD = norm(sorted[sorted.length - 1].date);
    const rowMap = new Map();
    sorted.forEach(p => {
        const k = norm(p.date);
        const fromHist = histByDate.get(k);
        const merged = { ...p, date: k };
        if (fromHist !== undefined) {
            merged.historical = fromHist;
        }
        rowMap.set(k, merged);
    });
    histByDate.forEach((histVal, dateKey) => {
        if (dateKey < minD || dateKey > maxD)
            return;
        if (!rowMap.has(dateKey)) {
            rowMap.set(dateKey, { date: dateKey, historical: histVal });
        }
    });
    return [...rowMap.values()].sort((a, b) => a.date.localeCompare(b.date));
}
/**
 * Calculate Accuracy: 100% - MAPE
 * @param mape - MAPE value as decimal (e.g., 0.0436 for 4.36%)
 * @returns Accuracy percentage
 */
function calculateAccuracy(mape) {
    return 100 - mape * 100;
}
/**
 * Format Accuracy as percentage
 * @param value - Accuracy value
 * @returns Formatted accuracy string (e.g., "97%")
 */
function formatAccuracy(value) {
    if (value < 10)
        return `< 10%`;
    return `${Math.round(value)}%`;
}
/**
 * Format Error as "$/Ton"
 * @param mae - MAE value from metrics_summary.24m.mae
 * @returns Formatted error string (e.g., "0.05$/Ton")
 */
function formatError(mae) {
    return `${mae.toFixed(2)} $/Ton`;
}
/**
 * Calculate ROI
 * Reference: ROI/calculatons.ts for example logic
 * @param totalBenefit - Total annual benefit
 * @param operatingCost - Annual operating cost
 * @returns ROI percentage
 */
function calculateROI(totalBenefit, operatingCost) {
    if (operatingCost <= 0)
        return 0;
    const netBenefit = totalBenefit - operatingCost;
    return (netBenefit / operatingCost) * 100;
}
/**
 * Calculate ROI Multiple
 * Formula: ROI Multiple = ROI / 100
 * Where ROI = (AB - IC) / IC × 100
 * @param totalBenefit - Total annual benefit (AB)
 * @param operatingCost - Annual operating cost (IC)
 * @returns ROI multiple (e.g., 1.0 for 100% ROI, 2.0 for 200% ROI)
 */
function calculateROIMultiple(totalBenefit, operatingCost) {
    if (operatingCost <= 0)
        return 0;
    const roi = calculateROI(totalBenefit, operatingCost);
    return roi / 100;
}
/**
 * Format ROI as multiplier (xN format)
 * Formula: ROI Multiple = ROI / 100
 * Examples: 100% ROI = x1, 200% ROI = x2, 0% ROI = x0
 * Note: Negative ROI (when benefit < cost) is displayed as x1
 * @param totalBenefit - Total annual benefit (AB)
 * @param operatingCost - Annual operating cost (IC)
 * @returns Formatted ROI string (e.g., "x1.5")
 */
function formatROI(totalBenefit, operatingCost) {
    const multiple = calculateROIMultiple(totalBenefit, operatingCost);
    // If multiple is negative (benefit < cost), show as x1
    const adjustedMultiple = multiple < 0 ? 1 : multiple;
    // Round to 1 decimal place
    const rounded = Math.round(adjustedMultiple * 10) / 10;
    // Format: show as integer if whole number, otherwise 1 decimal place
    const formatted = rounded % 1 === 0 ? rounded.toString() : rounded.toFixed(1);
    return `x${formatted}`;
}
/**
 * Calculate Benefit p/a
 * Formula: Annual Benefit = PV × V × C × PI
 * Where:
 * - PV = Procurement Volume
 * - V = Variable Raw Material Share (as decimal)
 * - C = Controllable Cost Share (as decimal)
 * - PI = Price Improvement = |FA_new - FA_current| × 0.2 (correlation factor)
 * @param mae - MAE value (not used in calculation, kept for backward compatibility)
 * @param mape - MAPE value (used to calculate actual forecast accuracy)
 * @param adjustParams - Adjust parameters from dialog
 * @param baselineAccuracy - Optional baseline accuracy for comparison (if provided, uses actual improvement)
 * @returns Benefit per annum
 */
function calculateBenefit(mae, mape, adjustParams, baselineAccuracy) {
    // Calculate Price Improvement (PI) as decimal
    // If baselineAccuracy is provided, use actual accuracy improvement
    // Otherwise, use user-entered expected improvement
    let accuracyImprovement;
    if (baselineAccuracy !== undefined) {
        // Use actual forecast accuracy improvement
        const currentAccuracy = calculateAccuracy(mape);
        accuracyImprovement = Math.abs(currentAccuracy - baselineAccuracy);
    }
    else {
        // Use user-entered expected improvement
        accuracyImprovement = adjustParams.expectedImprovement;
    }
    // PI = accuracyImprovement × 0.2 (correlation factor)
    const priceImprovement = (accuracyImprovement / 100) * 0.2;
    // Convert percentages to decimals
    const variableShare = adjustParams.variableRawMaterialCostShare / 100;
    const controllableShare = adjustParams.controllableCosts / 100;
    // Annual Benefit = PV × V × C × PI
    const annualBenefit = adjustParams.procurementVolume *
        variableShare *
        controllableShare *
        priceImprovement;
    return Math.round(annualBenefit);
}
/**
 * Format Benefit as euros
 * @param value - Benefit value
 * @returns Formatted benefit string (e.g., "€616.640")
 */
function formatBenefit(value) {
    return new Intl.NumberFormat('de-DE', {
        style: 'currency',
        currency: 'EUR',
        minimumFractionDigits: 0,
        maximumFractionDigits: 0,
    }).format(value);
}
/**
 * Map forecast model key to display name
 * @param key - Forecast model key (e.g., "mean", "drift", "seasonal")
 * @returns Display name (e.g., "Mean", "Drift", "Seasonal")
 */
function getForecastModelDisplayName(key) {
    const nameMap = {
        mean: 'Mean',
        drift: 'Statistical baseline',
        seasonal: 'Seasonal',
        ARMA: 'ARMA',
        ARIMA: 'ARIMA',
        linear: 'Linear',
        theta: 'Theta',
        model: 'Sybilion AI',
    };
    return nameMap[key] || key.charAt(0).toUpperCase() + key.slice(1);
}
/**
 * Calculate Y range (min/max) from chart data points
 * Extracts all numeric values from chart data points and calculates min/max with padding
 * @param chartData - Array of chart data points
 * @returns Object with yMin and yMax values
 */
function calculateYRangeFromChartData(chartData) {
    const allValues = [];
    chartData.forEach(point => {
        Object.entries(point).forEach(([key, value]) => {
            if (key === 'date')
                return;
            // Include only numeric values (historical and forecast line values)
            if (typeof value === 'number') {
                allValues.push(value);
            }
        });
    });
    if (allValues.length === 0) {
        return { yMin: 0, yMax: 100 };
    }
    const min = Math.min(...allValues);
    const max = Math.max(...allValues);
    const diff = max - min;
    return {
        yMin: min - diff * 0.1,
        yMax: max + diff * 0.1,
    };
}

export { SPAGHETTI_DRIFT_PER_HORIZON_ID_BASE, SPAGHETTI_FORECAST_ID_BASE, SPAGHETTI_MODEL_PER_HORIZON_ID_BASE, averageForecastErrorsVsHistoricalForMatrixColumn, buildDriftSpaghettiMatrixForCustomDialog, buildPerHorizonSpaghettiEntries, buildSpaghettiMergedChartData, calculateAccuracy, calculateBenefit, calculateROI, calculateROIMultiple, calculateYRangeFromChartData, filterChartDataLast24Months, filterSpaghettiDataFromEarliestForecastStart, formatAccuracy, formatBenefit, formatError, formatROI, getForecastModelDisplayName, isSpaghettiDriftPerHorizonLineId, isSpaghettiModelPerHorizonLineId, mergeHistoricalIntoSpaghettiChartData, mergeSpaghettiMergedBases, mergeSpaghettiUserSeriesFromForecastData, spaghettiGridFromHistoricalPreviousMonth };
