const calculateQuantilePercentage = (quantile: string): string =>
  (parseFloat(quantile) * 100).toFixed(0);

export const findClosestQuantile = (
  targetQuantile: string,
  availableQuantiles: string[],
): string => {
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

export const normalizeQuantileKey = (
  quantile: string,
  availableKeys: string[],
): string => {
  if (availableKeys.includes(quantile)) {
    return quantile;
  }
  const normalized = parseFloat(quantile).toFixed(2);
  if (availableKeys.includes(normalized)) {
    return normalized;
  }
  return findClosestQuantile(quantile, availableKeys);
};

export const formatQuantileRangeLabel = (
  lowerQuantile: string,
  upperQuantile: string,
  includeRangeSuffix: boolean = true,
): string => {
  const lower = calculateQuantilePercentage(lowerQuantile);
  const upper = calculateQuantilePercentage(upperQuantile);
  const suffix = includeRangeSuffix ? ' Range' : '';
  return `${lower}% - ${upper}%${suffix}`;
};
