import { ColorType } from 'lightweight-charts';
import { applyQuantileBandConeToChartData } from '../quantileBandConeChartData.js';
import { chartDateToUtcTimestamp } from './chartTime.js';

function buildLightweightChartOptions(args) {
    const { isDarkTheme, width, height, autoSize = false } = args;
    return {
        autoSize,
        width: Math.max(1, Math.floor(width)),
        height: Math.max(1, Math.floor(height)),
        layout: {
            background: {
                type: ColorType.Solid,
                color: 'transparent',
            },
            textColor: isDarkTheme ? '#d8dee9' : '#191919',
        },
        grid: {
            vertLines: {
                color: isDarkTheme ? '#2f3440' : '#e6edf3',
            },
            horzLines: {
                color: isDarkTheme ? '#2f3440' : '#e6edf3',
            },
        },
        rightPriceScale: {
            borderVisible: false,
            scaleMargins: {
                top: 0.08,
                bottom: 0.08,
            },
        },
        timeScale: {
            borderVisible: false,
            timeVisible: true,
            secondsVisible: false,
            fixLeftEdge: true,
            fixRightEdge: true,
        },
        localization: {
            locale: typeof navigator !== 'undefined' && navigator.language
                ? navigator.language
                : 'en-US',
        },
    };
}
function buildHistoricalLineData(rows) {
    const out = [];
    for (const row of rows) {
        const v = row.historical;
        if (typeof v !== 'number' || !Number.isFinite(v))
            continue;
        out.push({
            time: chartDateToUtcTimestamp(row.date),
            value: v,
        });
    }
    out.sort((a, b) => Number(a.time) - Number(b.time));
    return out;
}
function buildForecastLineData(rows, forecastKey) {
    const out = [];
    for (const row of rows) {
        const v = row[forecastKey];
        if (typeof v !== 'number' || !Number.isFinite(v))
            continue;
        out.push({
            time: chartDateToUtcTimestamp(row.date),
            value: v,
        });
    }
    out.sort((a, b) => Number(a.time) - Number(b.time));
    return out;
}
function buildQuantileBandCustomData(rows, bandKey) {
    const coned = applyQuantileBandConeToChartData(rows, bandKey);
    const out = [];
    for (const row of coned) {
        const v = row[bandKey];
        if (!Array.isArray(v) ||
            v.length !== 2 ||
            typeof v[0] !== 'number' ||
            typeof v[1] !== 'number' ||
            !Number.isFinite(v[0]) ||
            !Number.isFinite(v[1])) {
            continue;
        }
        out.push({
            time: chartDateToUtcTimestamp(row.date),
            lower: v[0],
            upper: v[1],
        });
    }
    out.sort((a, b) => Number(a.time) - Number(b.time));
    return out;
}
function findNearestChartRow(rows, time) {
    if (!rows.length)
        return null;
    const target = Number(time) * 1000;
    let best = null;
    let bestDist = Infinity;
    for (const row of rows) {
        const t = Number(chartDateToUtcTimestamp(row.date)) * 1000;
        const dist = Math.abs(t - target);
        if (dist < bestDist) {
            bestDist = dist;
            best = row;
        }
    }
    return best;
}

export { buildForecastLineData, buildHistoricalLineData, buildLightweightChartOptions, buildQuantileBandCustomData, findNearestChartRow };
