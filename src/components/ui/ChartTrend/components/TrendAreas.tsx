import { Area } from 'recharts';

import { TREND_COLORS } from '../ChartTrend.constants';
import type {
  ChartDataPoint,
  MeanCPDData,
  TrendBoundary,
} from '../ChartTrend.types';

interface TrendAreasProps {
  boundaries: TrendBoundary;
  meanCPD: MeanCPDData;
  chartData: ChartDataPoint[];
  isDarkTheme: boolean;
  restricted: boolean;
}

export function TrendAreas({
  boundaries,
  meanCPD,
  chartData,
  isDarkTheme,
  restricted,
}: TrendAreasProps) {
  if (!meanCPD.change_points.length) return null;

  const cpd = meanCPD.change_points[0];
  const sign = cpd.sign;

  // Prepare area data by adding boundary values to chart data
  const areaData = chartData.map(point => {
    const dateIndex = boundaries.dates.indexOf(point.date);
    if (dateIndex !== -1) {
      return {
        ...point,
        upper_boundary: boundaries.upper[dateIndex],
        lower_boundary: boundaries.lower[dateIndex],
      };
    }
    return point;
  });

  if (sign === 0) {
    // Neutral trend - show symmetric risk areas
    const thresholdPercentage = meanCPD.cpd_metrics.fc_metrics.recall;

    return (
      <>
        {/* Main trend area (between boundaries) */}
        <Area
          type="monotone"
          dataKey="lower_boundary"
          stroke="transparent"
          fill="transparent"
          connectNulls
        />
        <Area
          type="monotone"
          dataKey="upper_boundary"
          stroke="transparent"
          fill={TREND_COLORS.area.neutral}
          fillOpacity={thresholdPercentage}
          connectNulls
        />
      </>
    );
  }

  // Directional trend - show main trend and risk areas
  const focusPercentage =
    meanCPD.cpd_metrics.consistency_metrics.fc_with_noise_class;
  const remnantPercentage =
    1 - meanCPD.cpd_metrics.consistency_metrics.fc_ignore_noise_class;

  if (sign > 0) {
    // Positive trend
    return (
      <>
        {/* Lower risk area */}
        <Area
          type="monotone"
          dataKey="lower_boundary"
          stroke="transparent"
          fill={TREND_COLORS.area.negative}
          fillOpacity={Math.max(0.05, remnantPercentage)}
          connectNulls
        />

        {/* Main positive trend area */}
        <Area
          type="monotone"
          dataKey="upper_boundary"
          stroke="transparent"
          fill={TREND_COLORS.area.positive}
          fillOpacity={Math.max(0.1, focusPercentage)}
          connectNulls
        />
      </>
    );
  }

  // Negative trend
  return (
    <>
      {/* Upper risk area */}
      <Area
        type="monotone"
        dataKey="upper_boundary"
        stroke="transparent"
        fill={TREND_COLORS.area.positive}
        fillOpacity={Math.max(0.05, remnantPercentage)}
        connectNulls
      />

      {/* Main negative trend area */}
      <Area
        type="monotone"
        dataKey="lower_boundary"
        stroke="transparent"
        fill={TREND_COLORS.area.negative}
        fillOpacity={Math.max(0.1, focusPercentage)}
        connectNulls
      />
    </>
  );
}
