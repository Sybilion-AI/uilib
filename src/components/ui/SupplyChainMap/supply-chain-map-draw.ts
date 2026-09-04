import { type GeoPermissibleObjects, geoGraticule10, geoPath } from 'd3-geo';
import { feature } from 'topojson-client';
import type { GeometryCollection, Topology } from 'topojson-specification';
import worldData from 'world-atlas/countries-110m.json';

import { MAP_COLORS, OCEAN_TONE } from './map-colors';
import { type MapCamera, mapProjection, projectPoint } from './map-projection';

type CountryFeature = {
  geometry: { type: string; coordinates: unknown };
};

const topology = worldData as unknown as Topology<{
  countries: GeometryCollection;
}>;
const COUNTRY_FEATURES = feature(topology, topology.objects.countries)
  .features as unknown as CountryFeature[];

export type MapHitLane = { id: string; points: [number, number][] };

export type MapDrawArc = {
  id: string;
  from: [number, number];
  to: [number, number];
  color: string;
  alpha: number;
};

export type MapDrawCommand = {
  width: number;
  height: number;
  dpr: number;
  camera: MapCamera;
  arcs: MapDrawArc[];
};

type MapCanvas = {
  width: number;
  height: number;
};

type MapCanvasCtx =
  | CanvasRenderingContext2D
  | OffscreenCanvasRenderingContext2D;

export function resizeMapCanvas(
  canvas: MapCanvas,
  width: number,
  height: number,
  dpr: number,
): void {
  canvas.width = Math.round(width * dpr);
  canvas.height = Math.round(height * dpr);
}

/** Land, ocean, graticule and arcs. Safe in a Worker — no DOM, no React. */
export function paintSupplyChainMap(
  ctx: MapCanvasCtx,
  command: MapDrawCommand,
): MapHitLane[] {
  const { width, height, dpr, camera, arcs } = command;
  ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  ctx.clearRect(0, 0, width, height);

  const proj = mapProjection(width, height, camera);
  const path = geoPath(proj, ctx);
  const draw = (obj: GeoPermissibleObjects) => {
    ctx.beginPath();
    path(obj);
  };

  draw({ type: 'Sphere' });
  ctx.fillStyle = OCEAN_TONE;
  ctx.fill();

  draw(geoGraticule10());
  ctx.strokeStyle = MAP_COLORS.graticule;
  ctx.lineWidth = 1;
  ctx.stroke();

  for (const f of COUNTRY_FEATURES) {
    draw(f.geometry as GeoPermissibleObjects);
    ctx.fillStyle = MAP_COLORS.land;
    ctx.fill();
  }
  ctx.beginPath();
  for (const f of COUNTRY_FEATURES) path(f.geometry as GeoPermissibleObjects);
  ctx.strokeStyle = MAP_COLORS.landStroke;
  ctx.lineWidth = 0.7;
  ctx.stroke();

  const hitLanes: MapHitLane[] = [];
  for (const a of arcs) {
    draw({
      type: 'LineString',
      coordinates: [a.from, a.to],
    });
    ctx.strokeStyle = a.color;
    ctx.globalAlpha = a.alpha;
    ctx.lineWidth = 2;
    ctx.lineCap = 'round';
    ctx.stroke();
    ctx.globalAlpha = 1;

    const flat: [number, number][] = [];
    for (const [lng, lat] of [a.from, a.to] as [number, number][]) {
      const q = projectPoint(proj, lat, lng);
      if (q) flat.push(q);
    }
    if (flat.length > 1) hitLanes.push({ id: a.id, points: flat });
  }
  return hitLanes;
}
