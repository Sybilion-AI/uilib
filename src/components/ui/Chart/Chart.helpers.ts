import { ChartConfig } from './Chart.types';

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
