import { DATASET_QUERY_PARAM } from '#uilib/constants/dataset';

/** Bracket token from agent chat: `[datasetId:1234]` or `[datasetId:1;analysisId:2]` */
export const DATASET_APP_TOKEN_REGEX =
  /^\[datasetId:(\d+)(?:;analysisId:(\d+))?\]$/;

export function parseDatasetAppToken(
  token: string,
): { datasetId: number; analysisId?: number } | null {
  const m = token.match(DATASET_APP_TOKEN_REGEX);
  if (!m) return null;
  const datasetId = Number(m[1]);
  const analysisId = m[2] != null ? Number(m[2]) : undefined;
  return analysisId != null ? { datasetId, analysisId } : { datasetId };
}

export function buildDatasetApplicationPath(
  datasetId: number,
  analysisId?: number,
): string {
  const params = new URLSearchParams();
  params.set(DATASET_QUERY_PARAM, String(datasetId));
  if (analysisId != null) params.set('analysisId', String(analysisId));
  return `/datasets?${params.toString()}`;
}
