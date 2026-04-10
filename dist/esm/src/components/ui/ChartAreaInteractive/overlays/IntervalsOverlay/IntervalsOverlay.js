import { jsx, jsxs } from 'react/jsx-runtime';
import cn from 'classnames';
import { useMemo, useRef, useState, useEffect, useCallback } from 'react';
import { BaseChartWrapper } from '../../../Chart/components/BaseChartWrapper.js';
import 'recharts';
import '../../../Chart/Chart.context.js';
import '../../../Chart/Chart.styl.js';
import { DraggingButton } from '../../../DraggingButton/DraggingButton.js';
import { useIsMobile } from '../../../../../hooks/useIsMobile.js';
import { formatQuantileRangeLabel, normalizeQuantileKey } from '../../../../../utils/quantileFormat.js';
import { ChevronsUpDown } from 'lucide-react';
import { useChartYRange } from '../useChartYRange.js';
import { useForecastColor } from '../useForecastColor.js';
import { useQuantileBands } from '../useQuantileBands.js';
import { useQuantileButton } from './IntervalsOverlay.hooks.js';
import SI from './IntervalsOverlay.styl.js';

function IntervalsOverlay({ baseChartProps, selectedForecast, className, upperQuantiles: propUpperQuantiles, lowerQuantiles: propLowerQuantiles, selectedLowerQuantile: propSelectedLowerQuantile, selectedUpperQuantile: propSelectedUpperQuantile, onLowerQuantileChange, onUpperQuantileChange, overlayForecastData: forecastData, }) {
    // Discover available quantiles dynamically (fallback if props not provided)
    const { upperQuantiles, lowerQuantiles, allQuantiles } = useMemo(() => {
        if (propUpperQuantiles && propLowerQuantiles) {
            // Use props if provided
            const all = [...propLowerQuantiles, ...propUpperQuantiles]
                .map(Number)
                .sort((a, b) => a - b)
                .map(String);
            return {
                upperQuantiles: propUpperQuantiles,
                lowerQuantiles: propLowerQuantiles,
                allQuantiles: all,
            };
        }
        // Fallback to computing from forecastData
        const allQuantilesData = forecastData[selectedForecast?.id]?.allQuantiles;
        if (!allQuantilesData) {
            return { upperQuantiles: [], lowerQuantiles: [], allQuantiles: [] };
        }
        const keys = Object.keys(allQuantilesData);
        const sortedKeys = keys.map(Number).sort((a, b) => a - b);
        return {
            upperQuantiles: sortedKeys.filter(q => q > 0.5).map(String),
            lowerQuantiles: sortedKeys.filter(q => q < 0.5).map(String),
            allQuantiles: sortedKeys.map(String),
        };
    }, [
        propUpperQuantiles,
        propLowerQuantiles,
        selectedForecast?.id,
        forecastData,
    ]);
    // Derive selected quantiles from props or use defaults
    const selectedUpperQuantile = propSelectedUpperQuantile ?? upperQuantiles[upperQuantiles.length - 1];
    const selectedLowerQuantile = propSelectedLowerQuantile ?? lowerQuantiles[0];
    const quantileBandName = formatQuantileRangeLabel(selectedLowerQuantile || '0.1', selectedUpperQuantile || '0.9');
    // Button refs
    const upperButtonRef = useRef(null);
    const lowerButtonRef = useRef(null);
    // Refs
    const overlayContainerRef = useRef(null);
    const wrapperRef = useRef(null);
    const [chartHeight, setChartHeight] = useState(0);
    const [chartWidth, setChartWidth] = useState(0);
    // Measure chart dimensions from wrapper (always mounted); overlay mounts later via render queue
    const OVERLAY_MARGIN_LEFT = 48;
    const OVERLAY_MARGIN_RIGHT = 32;
    useEffect(() => {
        const el = wrapperRef.current;
        if (!el)
            return;
        const updateDimensions = () => {
            const rect = el.getBoundingClientRect();
            const w = rect.width - OVERLAY_MARGIN_LEFT - OVERLAY_MARGIN_RIGHT;
            const h = rect.height;
            if (w > 0)
                setChartWidth(w);
            if (h > 0)
                setChartHeight(h);
        };
        updateDimensions();
        const resizeObserver = new ResizeObserver(updateDimensions);
        resizeObserver.observe(el);
        return () => resizeObserver.disconnect();
    }, []);
    const getBandValues = useCallback((date, dateIndex, allQuantiles) => {
        if (!selectedUpperQuantile || !selectedLowerQuantile)
            return null;
        // Get available quantile keys and normalize the selected quantiles
        const availableKeys = Object.keys(allQuantiles);
        const normalizedLowerQuantile = normalizeQuantileKey(selectedLowerQuantile, availableKeys);
        const normalizedUpperQuantile = normalizeQuantileKey(selectedUpperQuantile, availableKeys);
        const lowerValue = allQuantiles[normalizedLowerQuantile]?.[dateIndex];
        const upperValue = allQuantiles[normalizedUpperQuantile]?.[dateIndex];
        if (lowerValue !== undefined &&
            upperValue !== undefined &&
            typeof lowerValue === 'number' &&
            typeof upperValue === 'number') {
            return [lowerValue, upperValue];
        }
        return null;
    }, [selectedUpperQuantile, selectedLowerQuantile, normalizeQuantileKey]);
    const { quantileBandColor } = useForecastColor(selectedForecast, baseChartProps.forecastData);
    const getBandConfig = useCallback((bandKey) => {
        return {
            key: bandKey,
            quantiles: [
                selectedLowerQuantile || '0.10',
                selectedUpperQuantile || '0.90',
            ],
            opacity: 0.15,
            color: quantileBandColor,
            name: quantileBandName,
            type: 'monotone',
        };
    }, [
        quantileBandColor,
        quantileBandName,
        selectedLowerQuantile,
        selectedUpperQuantile,
    ]);
    const { transformedChartData, quantileBands } = useQuantileBands({
        chartData: baseChartProps.chartData,
        selectedForecastId: selectedForecast?.id,
        forecastData,
        bandKey: quantileBandName,
        getBandValues,
        getBandConfig,
    });
    // Position inner overlay: right offset = base align + distance from latest forecast to chart end
    // Overlay right margin 32px (--p-8), chart right margin 30px; overlay is 2px left of data edge
    const OVERLAY_TO_CHART_OFFSET = -2;
    const innerRightOffsetPx = useMemo(() => {
        if (!chartWidth || transformedChartData.length < 2)
            return 0;
        const { xMin, xMax } = baseChartProps;
        const chartStartDate = (xMin ?? transformedChartData[0].date);
        const chartEndDate = (xMax ??
            transformedChartData[transformedChartData.length - 1].date);
        const latestQuantileBandDate = selectedForecast?.id
            ? forecastData[selectedForecast.id]?.dates?.at(-1)
            : undefined;
        if (!latestQuantileBandDate)
            return 0;
        const start = new Date(chartStartDate).getTime();
        const end = new Date(chartEndDate).getTime();
        const latest = new Date(latestQuantileBandDate).getTime();
        const totalMs = end - start;
        const deltaMs = end - latest;
        const dateBasedOffset = totalMs > 0 && deltaMs >= 0 ? (deltaMs / totalMs) * chartWidth : 0;
        return dateBasedOffset + OVERLAY_TO_CHART_OFFSET;
    }, [
        chartWidth,
        transformedChartData,
        baseChartProps.xMin,
        baseChartProps.xMax,
        selectedForecast?.id,
        forecastData,
    ]);
    // Calculate button positions
    const calculateButtonYPosition = useCallback((quantileLevel, yMin, yMax) => {
        if (!selectedForecast?.id ||
            !forecastData[selectedForecast.id]?.allQuantiles) {
            return 50;
        }
        const allQuantiles = forecastData[selectedForecast.id].allQuantiles;
        const availableKeys = Object.keys(allQuantiles);
        const normalizedQuantileLevel = normalizeQuantileKey(quantileLevel, availableKeys);
        const quantileArray = allQuantiles[normalizedQuantileLevel];
        if (!quantileArray?.length)
            return 50;
        const value = quantileArray[quantileArray.length - 1];
        if (value === undefined || value === null)
            return 50;
        const normalized = (value - yMin) / (yMax - yMin);
        return Math.max(0, Math.min(100, (1 - normalized) * 100));
    }, [selectedForecast?.id, forecastData, normalizeQuantileKey]);
    const { yMin, yMax } = useChartYRange({
        baseChartProps,
        chartData: transformedChartData,
        disableRescaleWhenQuantileChanges: true,
        selectedForecastId: selectedForecast?.id,
    });
    const getButtonTop = useCallback((quantile) => quantile ? `${calculateButtonYPosition(quantile, yMin, yMax)}%` : '50%', [calculateButtonYPosition, yMin, yMax]);
    // Get latest forecast point (median/0.5 quantile at last index)
    const latestForecastPoint = useMemo(() => {
        if (!selectedForecast?.id || !forecastData[selectedForecast.id]) {
            return null;
        }
        const forecastDataForSelected = forecastData[selectedForecast.id];
        const allQuantiles = forecastDataForSelected.allQuantiles;
        const dates = forecastDataForSelected.dates;
        if (!allQuantiles || !dates || dates.length === 0) {
            return null;
        }
        const lastIndex = dates.length - 1;
        const availableKeys = Object.keys(allQuantiles);
        const medianKey = normalizeQuantileKey('0.5', availableKeys);
        const median = allQuantiles[medianKey]?.[lastIndex];
        if (median === undefined) {
            return null;
        }
        return median;
    }, [selectedForecast?.id, forecastData, normalizeQuantileKey]);
    // Calculate boundary constraints in percent
    const boundaryConstraints = useMemo(() => {
        if (!latestForecastPoint) {
            return {
                upperMinPercent: 0,
                upperMaxPercent: 100,
                lowerMinPercent: 0,
                lowerMaxPercent: 100,
            };
        }
        // Convert latest forecast point to percent position
        const normalized = (latestForecastPoint - yMin) / (yMax - yMin);
        const latestForecastPercent = Math.max(0, Math.min(100, (1 - normalized) * 100));
        return {
            // Upper button: cannot go below latest forecast point
            upperMinPercent: latestForecastPercent,
            upperMaxPercent: 100,
            // Lower button: cannot go above latest forecast point
            lowerMinPercent: 0,
            lowerMaxPercent: latestForecastPercent,
        };
    }, [latestForecastPoint, yMin, yMax]);
    // Use quantile button hooks
    const upperButton = useQuantileButton({
        buttonRef: upperButtonRef,
        overlayContainerRef,
        quantiles: upperQuantiles,
        selectedQuantile: selectedUpperQuantile,
        onQuantileChange: onUpperQuantileChange,
        calculateQuantilePosition: calculateButtonYPosition,
        yMin,
        yMax,
        minPercent: boundaryConstraints.lowerMinPercent,
        maxPercent: boundaryConstraints.lowerMaxPercent,
    });
    const lowerButton = useQuantileButton({
        buttonRef: lowerButtonRef,
        overlayContainerRef,
        quantiles: lowerQuantiles,
        selectedQuantile: selectedLowerQuantile,
        onQuantileChange: onLowerQuantileChange,
        calculateQuantilePosition: calculateButtonYPosition,
        yMin,
        yMax,
        minPercent: boundaryConstraints.upperMinPercent,
        maxPercent: boundaryConstraints.upperMaxPercent,
    });
    const isMobile = useIsMobile();
    const draggingButtonsSize = isMobile ? 'sm' : 'md';
    // Render overlay elements
    const overlay = (jsx("div", { ref: overlayContainerRef, className: SI.root, children: jsxs("div", { className: SI.inner, style: { right: `${innerRightOffsetPx}px` }, children: [upperQuantiles.length > 0 && selectedUpperQuantile && (jsx(DraggingButton, { size: draggingButtonsSize, ref: upperButtonRef, top: getButtonTop(selectedUpperQuantile), icon: jsx(ChevronsUpDown, { size: 16 }), title: `Upper quantile: ${(parseFloat(selectedUpperQuantile) * 100).toFixed(0)}%`, isDragging: upperButton.isDragging })), lowerQuantiles.length > 0 && selectedLowerQuantile && (jsx(DraggingButton, { size: draggingButtonsSize, ref: lowerButtonRef, top: getButtonTop(selectedLowerQuantile), icon: jsx(ChevronsUpDown, { size: 16 }), title: `Lower quantile: ${(parseFloat(selectedLowerQuantile) * 100).toFixed(0)}%`, isDragging: lowerButton.isDragging }))] }) }));
    return (jsx("div", { ref: wrapperRef, className: cn(className), children: jsx(BaseChartWrapper, { ...baseChartProps, yMin: yMin, yMax: yMax, showTooltip: !upperButton.isDragging && !lowerButton.isDragging, autoScaleYAxis: false, chartData: transformedChartData, quantileBands: quantileBands, quantileBandKey: selectedForecast ? `quantile-band-${selectedForecast.id}` : undefined, overlayElements: overlay }) }));
}

export { IntervalsOverlay };
