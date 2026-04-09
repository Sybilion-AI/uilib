import { SparklineChartData } from './Sparkline.types';

export const transformDataForChart = (data: number[]): SparklineChartData[] => {
  return data.map((value, index) => ({
    index,
    value,
  }));
};

export const getStrokeColor = (strokeColor?: string): string => {
  return strokeColor || 'hsl(var(--foreground))';
};

export const getActiveDotConfig = (
  showEndDot: boolean,
  strokeColor: string,
) => {
  if (!showEndDot) return false;

  return {
    r: 3,
    fill: strokeColor,
    stroke: 'white',
    strokeWidth: 1,
  };
};
