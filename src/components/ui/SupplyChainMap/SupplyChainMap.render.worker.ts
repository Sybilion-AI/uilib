/// <reference lib="webworker" />
import {
  type MapDrawCommand,
  type MapHitLane,
  paintSupplyChainMap,
  resizeMapCanvas,
} from './supply-chain-map-draw';

export type MapWorkerIn =
  | { type: 'init'; canvas: OffscreenCanvas }
  | { type: 'draw'; command: MapDrawCommand };

export type MapWorkerOut =
  | { type: 'hitLanes'; lanes: MapHitLane[] }
  | { type: 'error'; message: string };

let canvas: OffscreenCanvas | null = null;
let ctx: OffscreenCanvasRenderingContext2D | null = null;
let pending: MapDrawCommand | null = null;
let scheduled = false;

function flush(): void {
  scheduled = false;
  const command = pending;
  pending = null;
  if (!canvas || !ctx || !command) return;
  try {
    resizeMapCanvas(canvas, command.width, command.height, command.dpr);
    const lanes = paintSupplyChainMap(ctx, command);
    const out: MapWorkerOut = { type: 'hitLanes', lanes };
    self.postMessage(out);
  } catch (err) {
    const out: MapWorkerOut = {
      type: 'error',
      message: err instanceof Error ? err.message : String(err),
    };
    self.postMessage(out);
  }
}

self.onmessage = (event: MessageEvent<MapWorkerIn>) => {
  const msg = event.data;
  if (msg.type === 'init') {
    canvas = msg.canvas;
    ctx = canvas.getContext('2d');
    if (!ctx) {
      const out: MapWorkerOut = {
        type: 'error',
        message: 'OffscreenCanvas 2d context unavailable',
      };
      self.postMessage(out);
    }
    return;
  }
  if (msg.type === 'draw') {
    pending = msg.command;
    if (scheduled) return;
    scheduled = true;
    if (typeof requestAnimationFrame === 'function')
      requestAnimationFrame(flush);
    else queueMicrotask(flush);
  }
};
