import { ChartConfig } from './Chart.types';

/** Recharts may reuse/mutate tooltip payload arrays across hovers — copy + dedupe by series key. */
export type TooltipPayloadEntry = {
  type?: string;
  name?: string;
  dataKey?: string;
  value?: unknown;
  payload?: unknown;
  color?: string;
};

export type TooltipItem = TooltipPayloadEntry & {
  type: string;
  name: string;
  value: number | [number, number];
  color: string;
};

export function normalizeTooltipPayload(
  payload: readonly TooltipPayloadEntry[] | undefined | null,
): TooltipPayloadEntry[] | undefined {
  if (!payload?.length) return undefined;

  const seen = new Set<string>();
  const result: TooltipPayloadEntry[] = [];

  for (const item of payload) {
    if (
      item.value === null ||
      item.value === undefined ||
      item.type === 'none'
    ) {
      continue;
    }
    const key = String(item.dataKey ?? item.name ?? result.length);
    if (seen.has(key)) continue;
    seen.add(key);
    result.push({ ...item });
  }

  return result.length ? result : undefined;
}

export function getPayloadConfigFromPayload(
  config: ChartConfig,
  payload: unknown,
  key: string,
) {
  if (typeof payload !== 'object' || payload === null) {
    return config[key];
  }

  // Simple direct lookup first
  return config[key] || undefined;
}
