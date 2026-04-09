export type ForecastData = {
  analysisId: number;
  status?: string;
  dates: string[];
  forecastValues: number[];
  allQuantiles?: Record<string, number[]>;
  allSamples?: Record<string, number[]>;
};
