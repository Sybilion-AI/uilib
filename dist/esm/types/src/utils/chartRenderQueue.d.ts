declare class ChartRenderQueue {
    private queue;
    private isProcessing;
    private timeoutId;
    registerCallback(callback: () => void): void;
    private processNext;
    clear(): void;
}
export declare const chartRenderQueue: ChartRenderQueue;
export {};
