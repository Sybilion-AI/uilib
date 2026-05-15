// Helper function to format large numbers with k/m abbreviations
const timeRangeToMonths = {
    '6m': 6,
    '1y': 12,
    '3y': 36,
    '5y': 60,
    All: 12,
};
const DRAG_TIME_RANGE_PREFIX = '__drag:';
function encodeDragTimeRange(a, b) {
    const t0 = Math.min(a.getTime(), b.getTime());
    const t1 = Math.max(a.getTime(), b.getTime());
    return `${DRAG_TIME_RANGE_PREFIX}${t0},${t1}`;
}
function parseDragTimeRange(s) {
    if (!s.startsWith(DRAG_TIME_RANGE_PREFIX))
        return null;
    const body = s.slice(DRAG_TIME_RANGE_PREFIX.length);
    const comma = body.indexOf(',');
    if (comma === -1)
        return null;
    const a = Number(body.slice(0, comma));
    const b = Number(body.slice(comma + 1));
    if (!Number.isFinite(a) || !Number.isFinite(b))
        return null;
    const t0 = Math.min(a, b);
    const t1 = Math.max(a, b);
    return { start: new Date(t0), end: new Date(t1) };
}
function isTimeRangePreset(s) {
    return Object.prototype.hasOwnProperty.call(timeRangeToMonths, s);
}
function isPlottableNumber(value) {
    return typeof value === 'number' && Number.isFinite(value);
}
/** Any row the chart can draw a number for (excludes date-only or empty rows) */
function hasPlottableChartSeriesValue(item) {
    for (const [key, v] of Object.entries(item)) {
        if (key === 'date')
            continue;
        if (isPlottableNumber(v))
            return true;
        if (Array.isArray(v) && v.some(x => isPlottableNumber(x))) {
            return true;
        }
    }
    return false;
}
/**
 * Row counts toward the "end" of the window when anchoring the time range to a
 * selected forecast (shared historical + that analysis line / quantiles).
 */
function rowContributesToAnchoredTimeRange(item, analysisId) {
    if (isPlottableNumber(item.historical)) {
        return true;
    }
    const forecastKey = `forecast_${analysisId}`;
    if (isPlottableNumber(item[forecastKey])) {
        return true;
    }
    for (const key of Object.keys(item)) {
        if (key.startsWith('q') && key.endsWith(`_${analysisId}`)) {
            if (isPlottableNumber(item[key])) {
                return true;
            }
        }
    }
    return false;
}
function computeLatestPlottableDate(data, options) {
    const anchorId = options?.endDateAnchorAnalysisId;
    const pick = (item, useAnchor) => {
        if (!item.date)
            return null;
        if (useAnchor && anchorId != null) {
            if (!rowContributesToAnchoredTimeRange(item, anchorId)) {
                return null;
            }
        }
        else if (!hasPlottableChartSeriesValue(item)) {
            return null;
        }
        return new Date(item.date);
    };
    let latest = null;
    for (const item of data) {
        const d = pick(item, true);
        if (d && (!latest || d > latest)) {
            latest = d;
        }
    }
    if (latest == null && anchorId != null) {
        for (const item of data) {
            const d = pick(item, false);
            if (d && (!latest || d > latest)) {
                latest = d;
            }
        }
    }
    return latest;
}
const filterDataForTimeRange = (data, currentTimeRange, options) => {
    const dragRange = parseDragTimeRange(currentTimeRange);
    if (dragRange) {
        const { start, end } = dragRange;
        return data.filter(item => {
            if (!item.date)
                return false;
            const d = new Date(item.date);
            return d >= start && d <= end;
        });
    }
    if (currentTimeRange === 'All')
        return data;
    if (!isTimeRangePreset(currentTimeRange))
        return data;
    const latestDate = computeLatestPlottableDate(data, options);
    // Pre-compute start date based on latest date in data
    let startDate = null;
    if (latestDate) {
        const monthsToSubtract = timeRangeToMonths[currentTimeRange] || timeRangeToMonths.All;
        startDate = new Date(latestDate);
        startDate.setMonth(startDate.getMonth() - monthsToSubtract);
    }
    // Slice by date for every row. Rows with forecast_* keys must not bypass the
    // window (e.g. spaghetti plots), or the X range stays stuck at full history.
    const filteredData = data.filter(item => {
        if (!item.date)
            return false;
        if (startDate) {
            const date = new Date(item.date);
            return date >= startDate;
        }
        return true;
    });
    return filteredData;
};
const shortDateFormatter = (value) => {
    return new Date(value).toLocaleDateString('en-US', {
        month: 'short',
        year: '2-digit',
    });
};
const longDateFormatter = (value) => {
    return new Date(value).toLocaleDateString('en-US', {
        month: 'long',
        year: 'numeric',
    });
};

export { DRAG_TIME_RANGE_PREFIX, encodeDragTimeRange, filterDataForTimeRange, isTimeRangePreset, longDateFormatter, parseDragTimeRange, shortDateFormatter };
