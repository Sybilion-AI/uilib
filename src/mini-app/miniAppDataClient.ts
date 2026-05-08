import type {
  MiniAppDataset,
  MiniAppDriversComparisonSnapshot,
  MiniAppForecastMap,
  MiniAppPerformanceBundle,
} from './miniAppDataTypes';
import {
  type MiniAppDataOp,
  type MiniAppDataRequestPayload,
  buildDataRequestMessage,
  isTrustedMiniAppParentMessage,
  parseDataResponseMessage,
  resolveParentOriginFromReferrer,
} from './miniAppProtocol';

export type MiniAppDataClientOptions = {
  /** Default 10000 ms. */
  timeoutMs?: number;
};

export type MiniAppDataClient = {
  getDatasets(): Promise<MiniAppDataset[]>;
  getDataset(id: number): Promise<MiniAppDataset | null>;
  getForecasts(datasetId: number): Promise<MiniAppForecastMap>;
  getForecast(datasetId: number, analysisId: number): Promise<unknown | null>;
  getDrivers(datasetId: number, analysisId: number): Promise<unknown[]>;
  getPerformanceData(
    datasetId: number,
    analysisId: number,
  ): Promise<MiniAppPerformanceBundle>;
  getDriversComparisonData(
    datasetId: number,
    analysisId: number,
  ): Promise<MiniAppDriversComparisonSnapshot>;
};

const DEFAULT_TIMEOUT_MS = 10_000;

type Pending = {
  resolve: (value: unknown) => void;
  reject: (err: Error) => void;
  timer: ReturnType<typeof setTimeout>;
};

/** One listener per browsing context; tracks in-flight bridge requests by `requestId`. */
export function createMiniAppDataClient(
  options?: MiniAppDataClientOptions,
): MiniAppDataClient {
  const timeoutMs = options?.timeoutMs ?? DEFAULT_TIMEOUT_MS;
  const pending = new Map<string, Pending>();
  let listening = false;

  const settle = (rid: string, fn: (p: Pending) => void): void => {
    const p = pending.get(rid);
    if (!p) return;
    clearTimeout(p.timer);
    pending.delete(rid);
    fn(p);
  };

  function ensureListener(): void {
    if (listening || typeof window === 'undefined') return;
    listening = true;
    window.addEventListener('message', (event: MessageEvent) => {
      if (!isTrustedMiniAppParentMessage(event)) return;
      const msg = parseDataResponseMessage(event.data);
      if (!msg) return;
      settle(msg.requestId, p => {
        if (msg.ok) {
          p.resolve(msg.result);
        } else {
          p.reject(
            new Error(
              typeof msg.error === 'string'
                ? msg.error
                : 'Mini-app data request failed',
            ),
          );
        }
      });
    });
  }

  function request(
    payload: Omit<MiniAppDataRequestPayload, 'requestId'>,
  ): Promise<unknown> {
    if (typeof window === 'undefined' || window.parent === window) {
      throw new Error('MiniAppDataClient works only inside an iframe embed');
    }
    ensureListener();

    const requestId =
      typeof crypto !== 'undefined' && 'randomUUID' in crypto
        ? crypto.randomUUID()
        : `miniapp-${Date.now()}-${Math.random().toString(36).slice(2)}`;

    const envelope = buildDataRequestMessage({
      ...payload,
      requestId,
    });
    const target = resolveParentOriginFromReferrer();

    return new Promise((resolve, reject) => {
      const timer = setTimeout(() => {
        settle(requestId, p => {
          p.reject(new Error('Mini-app data request timed out'));
        });
      }, timeoutMs);

      pending.set(requestId, {
        resolve,
        reject,
        timer,
      });

      try {
        if (target) {
          window.parent.postMessage(envelope, target);
        } else {
          window.parent.postMessage(envelope, '*');
        }
      } catch (e) {
        settle(requestId, p => {
          p.reject(
            e instanceof Error ? e : new Error('Mini-app postMessage failed'),
          );
        });
      }
    });
  }

  async function rq<R>(
    op: MiniAppDataOp,
    params?: Record<string, number>,
  ): Promise<R> {
    return request({ op, params }) as Promise<R>;
  }

  return {
    getDatasets: () => rq<MiniAppDataset[]>('getDatasets'),

    getDataset: id => rq<MiniAppDataset | null>('getDataset', { id }),

    getForecasts: datasetId =>
      rq<MiniAppForecastMap>('getForecasts', { datasetId }),

    getForecast: (datasetId, analysisId) =>
      rq<unknown | null>('getForecast', { datasetId, analysisId }),

    getDrivers: (datasetId, analysisId) =>
      rq<unknown[]>('getDrivers', { datasetId, analysisId }),

    getPerformanceData: (datasetId, analysisId) =>
      rq<MiniAppPerformanceBundle>('getPerformanceData', {
        datasetId,
        analysisId,
      }),

    getDriversComparisonData: (datasetId, analysisId) =>
      rq<MiniAppDriversComparisonSnapshot>('getDriversComparisonData', {
        datasetId,
        analysisId,
      }),
  };
}
