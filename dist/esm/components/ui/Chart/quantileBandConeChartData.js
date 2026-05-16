function isFiniteBandTuple(v) {
    return (Array.isArray(v) &&
        v.length === 2 &&
        typeof v[0] === 'number' &&
        typeof v[1] === 'number' &&
        Number.isFinite(v[0]) &&
        Number.isFinite(v[1]));
}
/**
 * Matches ChartAreaInteractive `mode="intervals"`: cone / fan chart hand-off — collapse the
 * interval to a point at the historical→forecast boundary, then expand along forecast anchors.
 * (Same rules as `useQuantileBands`, without requiring `ForecastData` — reads tuples from each row.)
 */
function applyQuantileBandConeToChartData(chartData, bandKey) {
    if (!chartData.length)
        return chartData;
    const originalBandByDate = new Map();
    for (const p of chartData) {
        const t = p[bandKey];
        if (isFiniteBandTuple(t))
            originalBandByDate.set(p.date, [t[0], t[1]]);
    }
    const forecastDateList = [...originalBandByDate.keys()].sort((a, b) => new Date(a).getTime() - new Date(b).getTime());
    if (forecastDateList.length === 0)
        return chartData;
    const forecastDatesSet = new Set(forecastDateList);
    const dateToQuantileIndex = new Map();
    forecastDateList.forEach((d, i) => dateToQuantileIndex.set(d, i));
    const clonedData = [...chartData];
    const historicalPoints = clonedData.filter(p => p.historical !== undefined &&
        p.historical !== null &&
        typeof p.historical === 'number' &&
        Number.isFinite(p.historical));
    const lastHistoricalPoint = historicalPoints.length > 0
        ? historicalPoints[historicalPoints.length - 1]
        : null;
    const lastHistoricalDate = lastHistoricalPoint?.date;
    const lastHistoricalValue = lastHistoricalPoint?.historical;
    const firstForecastDate = forecastDateList[0];
    const firstForecastDateObj = firstForecastDate
        ? new Date(firstForecastDate)
        : null;
    const lastHistoricalDateObj = lastHistoricalDate
        ? new Date(lastHistoricalDate)
        : null;
    const hasGap = !!lastHistoricalDate &&
        !!firstForecastDate &&
        lastHistoricalValue !== undefined &&
        firstForecastDateObj &&
        lastHistoricalDateObj &&
        firstForecastDateObj.getTime() > lastHistoricalDateObj.getTime();
    const needsBridgePoint = !!lastHistoricalDate &&
        !!firstForecastDate &&
        lastHistoricalValue !== undefined &&
        firstForecastDateObj &&
        lastHistoricalDateObj &&
        firstForecastDateObj.getTime() <= lastHistoricalDateObj.getTime();
    let bridgePoint = null;
    let pointBeforeForecast = null;
    if (needsBridgePoint && historicalPoints.length > 0) {
        bridgePoint =
            firstForecastDateObj &&
                lastHistoricalDateObj &&
                firstForecastDateObj.getTime() === lastHistoricalDateObj.getTime()
                ? lastHistoricalPoint
                : [...historicalPoints]
                    .reverse()
                    .find(p => firstForecastDateObj &&
                    new Date(p.date).getTime() < firstForecastDateObj.getTime()) || lastHistoricalPoint;
        if (firstForecastDateObj) {
            pointBeforeForecast =
                historicalPoints.findLast(p => new Date(p.date).getTime() < firstForecastDateObj.getTime()) ?? null;
        }
    }
    return clonedData.map(point => {
        const newPoint = { ...point };
        if (hasGap &&
            point.date === lastHistoricalDate &&
            lastHistoricalValue !== undefined) {
            newPoint[bandKey] = [lastHistoricalValue, lastHistoricalValue];
        }
        const isBridgePointDate = needsBridgePoint &&
            bridgePoint &&
            bridgePoint.historical !== undefined &&
            point.date === bridgePoint.date;
        const isPointBeforeForecast = needsBridgePoint &&
            pointBeforeForecast &&
            pointBeforeForecast.historical !== undefined &&
            point.date === pointBeforeForecast.date;
        const isAlsoForecastDate = forecastDatesSet.has(point.date);
        if (isPointBeforeForecast && !isAlsoForecastDate) {
            newPoint[bandKey] = [
                pointBeforeForecast.historical,
                pointBeforeForecast.historical,
            ];
        }
        else if (isBridgePointDate && !isAlsoForecastDate) {
            newPoint[bandKey] = [
                bridgePoint.historical,
                bridgePoint.historical,
            ];
        }
        if (forecastDatesSet.has(point.date)) {
            const quantileIndex = dateToQuantileIndex.get(point.date);
            if (quantileIndex !== undefined) {
                const bandValues = originalBandByDate.get(point.date);
                if (bandValues) {
                    const isBridgePointDateForecast = needsBridgePoint &&
                        bridgePoint &&
                        point.date === bridgePoint.date &&
                        bridgePoint.historical !== undefined;
                    if (isBridgePointDateForecast && quantileIndex === 0) {
                        newPoint[bandKey] = [
                            bridgePoint.historical,
                            bandValues[1],
                        ];
                    }
                    else {
                        newPoint[bandKey] = bandValues;
                    }
                }
                else {
                    delete newPoint[bandKey];
                }
            }
        }
        return newPoint;
    });
}

export { applyQuantileBandConeToChartData };
