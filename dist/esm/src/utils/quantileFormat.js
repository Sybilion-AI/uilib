const calculateQuantilePercentage = (quantile) => (parseFloat(quantile) * 100).toFixed(0);
const findClosestQuantile = (targetQuantile, availableQuantiles) => {
    const target = parseFloat(targetQuantile);
    let closest = availableQuantiles[0];
    let minDiff = Math.abs(parseFloat(closest) - target);
    for (const quantile of availableQuantiles) {
        const diff = Math.abs(parseFloat(quantile) - target);
        if (diff < minDiff) {
            minDiff = diff;
            closest = quantile;
        }
    }
    return closest;
};
const normalizeQuantileKey = (quantile, availableKeys) => {
    if (availableKeys.includes(quantile)) {
        return quantile;
    }
    const normalized = parseFloat(quantile).toFixed(2);
    if (availableKeys.includes(normalized)) {
        return normalized;
    }
    return findClosestQuantile(quantile, availableKeys);
};
const formatQuantileRangeLabel = (lowerQuantile, upperQuantile, includeRangeSuffix = true) => {
    const lower = calculateQuantilePercentage(lowerQuantile);
    const upper = calculateQuantilePercentage(upperQuantile);
    const suffix = includeRangeSuffix ? ' Range' : '';
    return `${lower}% - ${upper}%${suffix}`;
};

export { findClosestQuantile, formatQuantileRangeLabel, normalizeQuantileKey };
