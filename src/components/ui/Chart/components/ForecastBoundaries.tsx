import { ReferenceLine } from 'recharts';

import { FORECAST_COLORS } from '../chartForecastVisualization.constants';
import type {
  ChangePointDetection,
  ForecastVisualizationRow,
} from '../chartForecastVisualization.types';

interface ForecastBoundariesProps {
  changePoints: ChangePointDetection;
  chartData: ForecastVisualizationRow[];
  isDarkTheme: boolean;
}

export function ForecastBoundaries({
  changePoints,
  chartData,
  isDarkTheme,
}: ForecastBoundariesProps) {
  const meanCPD = changePoints.MeanCPD.change_points[0];
  const sensitivity = changePoints.MeanCPD.cpd_metrics.sensitivity_threshold;

  if (!meanCPD) return null;

  const sign = meanCPD.sign;
  const prevCoef = meanCPD.prev_coef[0];

  // Calculate boundary values
  const upperBoundary = prevCoef + sensitivity;
  const lowerBoundary = prevCoef - sensitivity;

  // Determine color based on trend sign
  const boundaryColor =
    sign === 0
      ? FORECAST_COLORS.boundary.neutral
      : sign > 0
        ? FORECAST_COLORS.boundary.positive
        : FORECAST_COLORS.boundary.negative;

  return (
    <>
      {/* Upper boundary line */}
      <ReferenceLine
        y={upperBoundary}
        stroke={boundaryColor}
        strokeDasharray="5 5"
        strokeWidth={2}
        label={{
          value: 'Upper Boundary',
          position: 'insideTopRight',
          fill: isDarkTheme ? '#9ca3af' : '#6b7280',
        }}
      />

      {/* Lower boundary line (if not positive trend) */}
      {sign <= 0 && (
        <ReferenceLine
          y={lowerBoundary}
          stroke={boundaryColor}
          strokeDasharray="5 5"
          strokeWidth={2}
          label={{
            value: 'Lower Boundary',
            position: 'insideBottomRight',
            fill: isDarkTheme ? '#9ca3af' : '#6b7280',
          }}
        />
      )}
    </>
  );
}
