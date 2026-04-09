'use client';

import { useCallback, useMemo, useRef } from 'react';

import { BaseChartWrapper } from '@/components/ui/Chart/components';
import { BaseChartWrapperProps } from '@/components/ui/Chart/components/BaseChartWrapper';
import { QuantileBandConfig } from '@/components/ui/ChartForecastProbabilistic/ChartForecastProbabilistic.types';
import { DraggingButton } from '@/components/ui/DraggingButton/DraggingButton';
import type { ForecastData } from '@/types/forecast-data';
import { formatQuantileRangeLabel } from '@/utils/quantileFormat';
import { ChevronsUpDown } from 'lucide-react';

import { Analysis } from '../../ChartAreaInteractive.types';
import SI from '../IntervalsOverlay/IntervalsOverlay.styl';
import { useChartYRange } from '../useChartYRange';
import { useForecastColor } from '../useForecastColor';
import { useQuantileBands } from '../useQuantileBands';
import { useThresholdButton } from './ThresholdsOverlay.hooks';
import S from './ThresholdsOverlay.styl';

interface ThresholdsOverlayProps {
  baseChartProps: BaseChartWrapperProps;
  selectedForecast?: Analysis;
  className?: string;
  lowerThreshold?: number;
  upperThreshold?: number;
  onLowerThresholdChange?: (value: number) => void;
  onUpperThresholdChange?: (value: number) => void;
  discreteThresholdValues?: { lower: number[]; upper: number[] };
  overlayForecastData: Record<number, ForecastData>;
}

export function ThresholdsOverlay({
  baseChartProps,
  selectedForecast,
  className,
  lowerThreshold = 0,
  upperThreshold = 0,
  onLowerThresholdChange,
  onUpperThresholdChange,
  discreteThresholdValues,
  overlayForecastData: forecastData,
}: ThresholdsOverlayProps) {

  // Discover available quantiles dynamically
  const availableQuantiles = useMemo(() => {
    if (!selectedForecast?.id || !forecastData[selectedForecast.id]) {
      return null;
    }

    const forecastDataForSelected = forecastData[selectedForecast.id];
    const allQuantiles = forecastDataForSelected.allQuantiles;

    if (!allQuantiles) {
      return null;
    }

    const keys = Object.keys(allQuantiles);
    const sortedKeys = keys.map(Number).sort((a, b) => a - b);

    return {
      lowerQuantiles: sortedKeys.filter(q => q < 0.5).map(String),
      upperQuantiles: sortedKeys.filter(q => q > 0.5).map(String),
      allQuantiles: sortedKeys.map(String),
      medianQuantile: sortedKeys.find(q => q === 0.5)?.toString() || null,
      lowestQuantile: sortedKeys[0]?.toString() || null,
      highestQuantile: sortedKeys[sortedKeys.length - 1]?.toString() || null,
    };
  }, [selectedForecast?.id, forecastData]);

  // Refs
  const overlayContainerRef = useRef<HTMLDivElement>(null);
  const lineRef = useRef<HTMLDivElement>(null);

  // Transform chart data with quantile band - needed before useChartYRange
  const bandKey = selectedForecast?.id
    ? `band_10_90_${selectedForecast.id}`
    : 'band_10_90';

  const getBandValues = useCallback(
    (
      date: string,
      dateIndex: number,
      allQuantiles: Record<string, number[]>,
    ): [number, number] | null => {
      if (
        !availableQuantiles ||
        !availableQuantiles.lowestQuantile ||
        !availableQuantiles.highestQuantile
      ) {
        return null;
      }

      const lowerValue =
        allQuantiles[availableQuantiles.lowestQuantile]?.[dateIndex];
      const upperValue =
        allQuantiles[availableQuantiles.highestQuantile]?.[dateIndex];

      if (
        lowerValue !== undefined &&
        upperValue !== undefined &&
        typeof lowerValue === 'number' &&
        typeof upperValue === 'number'
      ) {
        return [lowerValue, upperValue];
      }

      return null;
    },
    [availableQuantiles],
  );

  const { quantileBandColor } = useForecastColor(
    selectedForecast,
    baseChartProps.forecastData,
  );

  const getBandConfig = useCallback(
    (bk: string): QuantileBandConfig => {
      const lowerQuantile = availableQuantiles?.lowestQuantile || '0.1';
      const upperQuantile = availableQuantiles?.highestQuantile || '0.9';

      return {
        key: bk,
        quantiles: [lowerQuantile, upperQuantile],
        opacity: 0.15,
        color: quantileBandColor,
        name: formatQuantileRangeLabel(lowerQuantile, upperQuantile),
        type: 'monotone',
      };
    },
    [quantileBandColor, availableQuantiles],
  );

  const { transformedChartData, quantileBands } = useQuantileBands({
    chartData: baseChartProps.chartData,
    selectedForecastId: selectedForecast?.id,
    forecastData,
    bandKey,
    getBandValues,
    getBandConfig,
  });

  const { yMin, yMax } = useChartYRange({
    baseChartProps,
    chartData: transformedChartData,
    selectedForecastId: selectedForecast?.id,
  });

  // Full chart range for threshold drag
  const boundaryConstraints = useMemo(
    () => ({ upperMin: yMin, upperMax: yMax }),
    [yMin, yMax],
  );

  // Convert value to percentage position
  const valueToPercent = useCallback(
    (value: number): string => {
      const normalized = (value - yMin) / (yMax - yMin);
      const percent = Math.max(0, Math.min(100, (1 - normalized) * 100));
      return `${percent}%`;
    },
    [yMin, yMax],
  );

  // Use threshold button hooks
  const upperButton = useThresholdButton({
    lineRef,
    overlayContainerRef,
    initialValue: upperThreshold,
    minValue: boundaryConstraints.upperMin,
    maxValue: boundaryConstraints.upperMax,
    yMin,
    yMax,
    onValueChange: onUpperThresholdChange || (() => {}),
    discreteValues: discreteThresholdValues?.upper,
  });

  // Render overlay elements - always render container, conditionally render buttons
  const overlay = (
    <div ref={overlayContainerRef} className={SI.root}>
      <div className={S.line} ref={lineRef}>
        <DraggingButton
          size="md"
          left="50%"
          icon={<ChevronsUpDown size={16} />}
          title={`Upper threshold: ${upperThreshold.toFixed(2)}`}
          isDragging={upperButton.isDragging}
          className={S.centeredButton}
        />
      </div>
    </div>
  );

  return (
    <div className={className}>
      <BaseChartWrapper
        {...baseChartProps}
        yMin={yMin}
        yMax={yMax}
        showTooltip={!upperButton.isDragging}
        autoScaleYAxis={false}
        chartData={transformedChartData}
        quantileBands={quantileBands}
        overlayElements={overlay}
      />
    </div>
  );
}
