/**
 * Loose JSON shapes aligned with Sybilion dataset payloads (standalone apps / widgets).
 */
export type SybilionDatasetSnapshot = {
    id: number;
    user_id?: number;
    name: string;
    description?: string;
    status: string;
    created_at: string;
    updated_at: string;
    keywords: string;
    category: {
        id: number;
        name: string;
    };
    target_type_id: number;
    target_type: {
        id: number;
        name: string;
    };
    trend: number;
    regular_price: string;
    sale_price: string;
    regions: {
        id: number;
        name: string;
    }[];
    unit: {
        id: number;
        name: string;
    };
    version?: number;
};
/** `forecastData` slice: analysis id (string) → forecast series blob. */
export type SybilionForecastMap = Record<string, unknown>;
export type SybilionPerformanceSnapshot = {
    table: unknown;
    spaghetti: unknown;
};
export type SybilionDriversComparisonSnapshot = {
    byRegion: unknown;
    byCountry: unknown;
    byCategory: unknown;
    byImportance: unknown;
    driversCount: number | null;
};
