import { type RefObject, useEffect, useRef, useState } from 'react';

import type { MapWorkerIn, MapWorkerOut } from './SupplyChainMap.render.worker';
import {
  type MapDrawCommand,
  type MapHitLane,
  paintSupplyChainMap,
  resizeMapCanvas,
} from './supply-chain-map-draw';

export type MapRendererMode = 'pending' | 'worker' | 'main';

function canUseOffscreenWorker(canvas: HTMLCanvasElement): boolean {
  return (
    typeof Worker !== 'undefined' &&
    typeof OffscreenCanvas !== 'undefined' &&
    typeof canvas.transferControlToOffscreen === 'function'
  );
}

function paintOnMain(
  canvas: HTMLCanvasElement,
  command: MapDrawCommand,
): MapHitLane[] {
  resizeMapCanvas(canvas, command.width, command.height, command.dpr);
  const ctx = canvas.getContext('2d');
  if (!ctx) return [];
  return paintSupplyChainMap(ctx, command);
}

/**
 * Paints the basemap (land / ocean / graticule / arcs) on an OffscreenCanvas in
 * a Worker when the browser allows it, so projection and rasterization do not
 * hitch the main thread during pan/zoom. Falls back to the same paint path on
 * the main thread. `canvasKey` must be set on the <canvas> so a transferred
 * canvas can be replaced if we drop back to main-thread painting.
 */
export function useMapBaseRenderer(
  canvasRef: RefObject<HTMLCanvasElement | null>,
  command: MapDrawCommand | null,
  onHitLanes: (lanes: MapHitLane[]) => void,
  enabled = true,
): { mode: MapRendererMode; canvasKey: number } {
  const [mode, setMode] = useState<MapRendererMode>('pending');
  const [canvasKey, setCanvasKey] = useState(0);
  const forceMainRef = useRef(false);
  const ownsCanvasRef = useRef(true);
  const workerRef = useRef<Worker | null>(null);
  const onHitLanesRef = useRef(onHitLanes);
  onHitLanesRef.current = onHitLanes;
  const commandRef = useRef(command);
  commandRef.current = command;

  useEffect(() => {
    ownsCanvasRef.current = true;
    if (!enabled) {
      setMode('pending');
      return;
    }
    const canvas = canvasRef.current;
    if (!canvas || forceMainRef.current || !canUseOffscreenWorker(canvas)) {
      setMode('main');
      return;
    }

    let worker: Worker;
    try {
      // Bundlers (webpack docs, Vite, Next) resolve this worker entry.
      // Published Rollup output may keep a .ts URL — paint then falls back
      // to the main-thread path below.
      worker = new Worker(
        new URL('./SupplyChainMap.render.worker.ts', import.meta.url),
      );
    } catch {
      forceMainRef.current = true;
      setMode('main');
      return;
    }

    const remountOnMain = () => {
      worker.terminate();
      workerRef.current = null;
      if (forceMainRef.current && !ownsCanvasRef.current) return;
      forceMainRef.current = true;
      ownsCanvasRef.current = false;
      setMode('main');
      setCanvasKey(n => n + 1);
    };

    try {
      const offscreen = canvas.transferControlToOffscreen();
      ownsCanvasRef.current = false;
      const init: MapWorkerIn = { type: 'init', canvas: offscreen };
      worker.postMessage(init, [offscreen]);
    } catch {
      worker.terminate();
      workerRef.current = null;
      forceMainRef.current = true;
      ownsCanvasRef.current = false;
      setMode('main');
      setCanvasKey(n => n + 1);
      return;
    }

    worker.onmessage = (event: MessageEvent<MapWorkerOut>) => {
      if (event.data.type === 'hitLanes') {
        onHitLanesRef.current(event.data.lanes);
        return;
      }
      remountOnMain();
    };
    workerRef.current = worker;
    setMode('worker');

    const latest = commandRef.current;
    if (latest) {
      const draw: MapWorkerIn = { type: 'draw', command: latest };
      worker.postMessage(draw);
    }

    return () => {
      worker.terminate();
      workerRef.current = null;
    };
  }, [canvasRef, canvasKey, enabled]);

  useEffect(() => {
    if (!command || mode === 'pending') return;
    const worker = workerRef.current;
    if (mode === 'worker' && worker) {
      const draw: MapWorkerIn = { type: 'draw', command };
      worker.postMessage(draw);
      return;
    }
    const canvas = canvasRef.current;
    if (!canvas || mode !== 'main' || !ownsCanvasRef.current) return;
    try {
      onHitLanesRef.current(paintOnMain(canvas, command));
    } catch {
      ownsCanvasRef.current = false;
    }
  }, [canvasRef, canvasKey, command, mode]);

  return { mode, canvasKey };
}
