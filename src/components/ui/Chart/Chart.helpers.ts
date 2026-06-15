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

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null;
}

export function getPayloadConfigFromPayload(
  config: ChartConfig,
  payload: unknown,
  key: string,
) {
  if (!isRecord(payload)) {
    return config[key];
  }

  // When the item (or its inner datum) carries a string at `key` — e.g. a
  // Pie slice with nameKey="key" — that string names the config entry.
  const inner = isRecord(payload.payload) ? payload.payload : undefined;

  let configLabelKey = key;
  if (typeof payload[key] === 'string') {
    configLabelKey = String(payload[key]);
  } else if (inner && typeof inner[key] === 'string') {
    configLabelKey = String(inner[key]);
  }

  return configLabelKey in config ? config[configLabelKey] : config[key];
}
