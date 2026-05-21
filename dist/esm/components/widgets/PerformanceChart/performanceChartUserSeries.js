import { normalizeToMonthStart } from '../../../utils/chartConnectionPoint.js';

const SPAGHETTI_TIME_SERIES_MATRIX_V = 2;
const SPAGHETTI_MATRIX_SYNTHETIC_BASE = 9_800_000;
const SPAGHETTI_MATRIX_MAX_COLS = 128;
const SPAGHETTI_LOCAL_LS_USER_SERIES_ROW_ID = 9_000_001;
const PER_HORIZON_VIEW_CUSTOM_LINE_ID_BASE = SPAGHETTI_MATRIX_SYNTHETIC_BASE + 4_000_000;
function spaghettiMatrixSyntheticId(userSeriesRowId, horizonIndex) {
    return (SPAGHETTI_MATRIX_SYNTHETIC_BASE +
        userSeriesRowId * SPAGHETTI_MATRIX_MAX_COLS +
        horizonIndex);
}
function isSpaghettiMatrixSyntheticLineId(id) {
    return id >= SPAGHETTI_MATRIX_SYNTHETIC_BASE;
}
function perHorizonViewCustomMatrixSyntheticId(colIdx) {
    return PER_HORIZON_VIEW_CUSTOM_LINE_ID_BASE + colIdx;
}
function matrixHasValidPerHorizonDates(matrix) {
    const ph = matrix.perHorizonDates;
    if (!ph || ph.length !== matrix.grid.length)
        return false;
    const h = matrix.horizonKeys.length;
    return ph.every((row, r) => Array.isArray(row) &&
        row.length === h &&
        row.length === matrix.grid[r].length);
}
function getCustomMatrixSeriesForHorizonTab(matrix, horizonKey, rowId, forecastData) {
    const colIdx = matrix.horizonKeys.indexOf(horizonKey);
    if (colIdx < 0)
        return null;
    if (matrixHasValidPerHorizonDates(matrix)) {
        const ph = matrix.perHorizonDates;
        const dates = [];
        const forecastValues = [];
        for (let r = 0; r < matrix.grid.length; r++) {
            const rawD = ph[r][colIdx];
            const v = matrix.grid[r][colIdx];
            if (typeof v !== 'number' || !Number.isFinite(v))
                continue;
            dates.push(normalizeToMonthStart(typeof rawD === 'string' ? rawD : String(rawD)));
            forecastValues.push(v);
        }
        if (dates.length === 0)
            return null;
        return {
            lineId: perHorizonViewCustomMatrixSyntheticId(colIdx),
            dates,
            forecastValues,
        };
    }
    const lineId = spaghettiMatrixSyntheticId(rowId, colIdx);
    const fd = forecastData?.[String(lineId)];
    if (!fd?.dates?.length || fd.forecastValues.length !== fd.dates.length) {
        return null;
    }
    return {
        lineId,
        dates: fd.dates,
        forecastValues: fd.forecastValues,
    };
}
function isRecord(value) {
    return typeof value === 'object' && value !== null;
}
function tryParseSpaghettiPerformanceMatrix(parsed) {
    if (!isRecord(parsed))
        return null;
    if (parsed.v !== SPAGHETTI_TIME_SERIES_MATRIX_V)
        return null;
    const dates = parsed.dates;
    const horizonKeys = parsed.horizonKeys;
    const grid = parsed.grid;
    if (!Array.isArray(dates) ||
        !Array.isArray(horizonKeys) ||
        !Array.isArray(grid)) {
        return null;
    }
    if (dates.length === 0 ||
        horizonKeys.length === 0 ||
        grid.length !== dates.length) {
        return null;
    }
    const h = horizonKeys.length;
    if (!grid.every(row => Array.isArray(row) && row.length === h))
        return null;
    const perHorizonDates = parsed.perHorizonDates;
    let ph;
    if (perHorizonDates !== undefined) {
        if (!Array.isArray(perHorizonDates) ||
            perHorizonDates.length !== grid.length) {
            return null;
        }
        ph = perHorizonDates.map(row => {
            if (!Array.isArray(row) || row.length !== h)
                return [];
            return row.map(d => String(d));
        });
    }
    return {
        v: SPAGHETTI_TIME_SERIES_MATRIX_V,
        dates: dates.map(d => String(d)),
        horizonKeys: horizonKeys.map(k => String(k)),
        grid: grid.map(row => row.map(v => Number(v))),
        ...(ph ? { perHorizonDates: ph } : {}),
    };
}

export { SPAGHETTI_LOCAL_LS_USER_SERIES_ROW_ID, SPAGHETTI_MATRIX_MAX_COLS, SPAGHETTI_MATRIX_SYNTHETIC_BASE, SPAGHETTI_TIME_SERIES_MATRIX_V, getCustomMatrixSeriesForHorizonTab, isSpaghettiMatrixSyntheticLineId, spaghettiMatrixSyntheticId, tryParseSpaghettiPerformanceMatrix };
