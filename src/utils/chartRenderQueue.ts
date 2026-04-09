const RENDER_DELAY = 200; // ms between chart renders

class ChartRenderQueue {
  private queue: Array<() => void> = [];
  private isProcessing = false;
  private timeoutId: NodeJS.Timeout | null = null;

  registerCallback(callback: () => void): void {
    if (this.queue.length === 0 && !this.isProcessing) {
      // Queue is empty, call immediately
      this.isProcessing = true;
      callback();
      // Process next callback after delay
      this.timeoutId = setTimeout(() => {
        this.isProcessing = false;
        this.processNext();
      }, RENDER_DELAY);
    } else {
      // Add to queue
      this.queue.push(callback);
    }
  }

  private processNext(): void {
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

  clear(): void {
    this.queue = [];
    if (this.timeoutId) {
      clearTimeout(this.timeoutId);
      this.timeoutId = null;
    }
    this.isProcessing = false;
  }
}

export const chartRenderQueue = new ChartRenderQueue();
