const RENDER_DELAY = 200; // ms between chart renders
class ChartRenderQueue {
    queue = [];
    isProcessing = false;
    timeoutId = null;
    registerCallback(callback) {
        if (this.queue.length === 0 && !this.isProcessing) {
            // Queue is empty, call immediately
            this.isProcessing = true;
            callback();
            // Process next callback after delay
            this.timeoutId = setTimeout(() => {
                this.isProcessing = false;
                this.processNext();
            }, RENDER_DELAY);
        }
        else {
            // Add to queue
            this.queue.push(callback);
        }
    }
    processNext() {
        if (this.queue.length === 0) {
            this.isProcessing = false;
            return;
        }
        this.isProcessing = true;
        const callback = this.queue.shift();
        if (callback) {
            callback();
            // Process next callback after delay
            this.timeoutId = setTimeout(() => {
                this.isProcessing = false;
                this.processNext();
            }, RENDER_DELAY);
        }
    }
    clear() {
        this.queue = [];
        if (this.timeoutId) {
            clearTimeout(this.timeoutId);
            this.timeoutId = null;
        }
        this.isProcessing = false;
    }
}
const chartRenderQueue = new ChartRenderQueue();

export { chartRenderQueue };
