// Helper function to format large numbers with k/m abbreviations
const timeRangeToMonths = {
    '6m': 6,
    '1y': 12,
    '3y': 36,
    '5y': 60,
    All: 12,
};
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
    if (currentTimeRange === 'All')
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

export { filterDataForTimeRange, longDateFormatter, shortDateFormatter };
