/**
 * Serializable shapes returned by the shell for mini-app data getters.
 * Subset of Sybilion `Dataset` / API types — use `unknown` where payloads are large or evolving.
 */

export type MiniAppDataset = {
  id: number;
  user_id?: number;
  name: string;
  description?: string;
  status: string;
  created_at: string;
  updated_at: string;
  keywords: string;
  category: { id: number; name: string };
  target_type_id: number;
  target_type: { id: number; name: string };
  trend: number;
  regular_price: string;
  sale_price: string;
  regions: { id: number; name: string }[];
  unit: { id: number; name: string };
  version?: number;
};

/** `forecastData` slice: analysis id (string) → forecast series blob. */
export type MiniAppForecastMap = Record<string, unknown>;

export type MiniAppPerformanceBundle = {
  /** Cached Performance-tab API payload, or null if user never opened Performance / cache empty. */
  table: unknown;
  /** In-memory spaghetti lines from shell context, or null. */
  spaghetti: unknown;
};

export type MiniAppDriversComparisonSnapshot = {
  byRegion: unknown;
  byCountry: unknown;
  byCategory: unknown;
  byImportance: unknown;
  driversCount: number | null;
};
