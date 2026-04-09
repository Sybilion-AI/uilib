/** Bracket token from agent chat: `[datasetId:1234]` or `[datasetId:1;analysisId:2]` */
export declare const DATASET_APP_TOKEN_REGEX: RegExp;
export declare function parseDatasetAppToken(token: string): {
    datasetId: number;
    analysisId?: number;
} | null;
export declare function buildDatasetApplicationPath(datasetId: number, analysisId?: number): string;
