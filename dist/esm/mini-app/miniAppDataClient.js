import { buildDataRequestMessage, resolveParentOriginFromReferrer, isTrustedMiniAppParentMessage, parseDataResponseMessage } from './miniAppProtocol.js';

const DEFAULT_TIMEOUT_MS = 10_000;
/** One listener per browsing context; tracks in-flight bridge requests by `requestId`. */
function createMiniAppDataClient(options) {
    const timeoutMs = options?.timeoutMs ?? DEFAULT_TIMEOUT_MS;
    const pending = new Map();
    let listening = false;
    const settle = (rid, fn) => {
        const p = pending.get(rid);
        if (!p)
            return;
        clearTimeout(p.timer);
        pending.delete(rid);
        fn(p);
    };
    function ensureListener() {
        if (listening || typeof window === 'undefined')
            return;
        listening = true;
        window.addEventListener('message', (event) => {
            if (!isTrustedMiniAppParentMessage(event))
                return;
            const msg = parseDataResponseMessage(event.data);
            if (!msg)
                return;
            settle(msg.requestId, p => {
                if (msg.ok) {
                    p.resolve(msg.result);
                }
                else {
                    p.reject(new Error(typeof msg.error === 'string'
                        ? msg.error
                        : 'Mini-app data request failed'));
                }
            });
        });
    }
    function request(payload) {
        if (typeof window === 'undefined' || window.parent === window) {
            throw new Error('MiniAppDataClient works only inside an iframe embed');
        }
        ensureListener();
        const requestId = typeof crypto !== 'undefined' && 'randomUUID' in crypto
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
                }
                else {
                    window.parent.postMessage(envelope, '*');
                }
            }
            catch (e) {
                settle(requestId, p => {
                    p.reject(e instanceof Error ? e : new Error('Mini-app postMessage failed'));
                });
            }
        });
    }
    async function rq(op, params) {
        return request({ op, params });
    }
    return {
        getDatasets: () => rq('getDatasets'),
        getDataset: id => rq('getDataset', { id }),
        getForecasts: datasetId => rq('getForecasts', { datasetId }),
        getForecast: (datasetId, analysisId) => rq('getForecast', { datasetId, analysisId }),
        getDrivers: (datasetId, analysisId) => rq('getDrivers', { datasetId, analysisId }),
        getPerformanceData: (datasetId, analysisId) => rq('getPerformanceData', {
            datasetId,
            analysisId,
        }),
        getDriversComparisonData: (datasetId, analysisId) => rq('getDriversComparisonData', {
            datasetId,
            analysisId,
        }),
    };
}

export { createMiniAppDataClient };
