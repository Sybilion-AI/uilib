// The flat map's projection and camera (components/supply-chain-map.tsx): where
// a lat/lng lands on the canvas, how the reader pans and zooms, and how a zoom
// level translates into the altitude vocabulary the globe's scene code already
// speaks (label tiers, lane-width rungs, admin-1 reveal). No canvas, no React —
// table-tested in lib/map-projection.test.ts.
//
// Natural Earth (geoNaturalEarth1) rather than Mercator or equirectangular: it
// is the projection tuned for exactly this reading — the whole world at once
// with landmasses at honest relative sizes — and it matches the globe's crafted
// look better than a web-tile grid would. d3-geo also resamples along great
// circles, so a two-point LineString drawn through it curves the way the same
// lane bows on the sphere.
import { type GeoProjection, geoNaturalEarth1, geoPath } from 'd3-geo';

/** Where the flat map's camera is: a zoom factor over the fitted world, and a
 *  screen-pixel translation applied AFTER that zoom. k = 1, x = 0, y = 0 is the
 *  whole world fitted to the viewport. */
export type MapCamera = { k: number; x: number; y: number };

export const HOME_CAMERA: MapCamera = { k: 1, x: 0, y: 0 };

/** Zoomed all the way out the map IS the fitted world — there is nothing
 *  beyond it to show, so 1 is the floor rather than a preference. */
export const MIN_ZOOM = 1;

/** Deep enough to separate two plants in one city (at a typical viewport this
 *  is a few tens of kilometres across), shallow enough that the 110m coastline
 *  under it has not visibly fallen apart. */
export const MAX_ZOOM = 24;

/** One press of the +/- buttons. */
export const ZOOM_STEP = 1.6;

/** Breathing room between the fitted world and the viewport edge, so the
 *  Antarctic coast is not kissing the canvas border. */
const FIT_PADDING_PX = 12;

/** How much of the viewport the world must always cover while panning — the
 *  clamp that stops a drag from throwing the planet off the canvas entirely. */
const MIN_WORLD_VISIBLE_PX = 120;

function clamp(v: number, lo: number, hi: number): number {
  return Math.min(hi, Math.max(lo, v));
}

/** The world fitted to this viewport, before any camera. Recomputed rather than
 *  cached: geoNaturalEarth1() is cheap arithmetic and a cache keyed on size
 *  would be one more thing that can disagree with the canvas. */
function fittedProjection(width: number, height: number): GeoProjection {
  return geoNaturalEarth1().fitExtent(
    [
      [FIT_PADDING_PX, FIT_PADDING_PX],
      [
        Math.max(FIT_PADDING_PX + 1, width - FIT_PADDING_PX),
        Math.max(FIT_PADDING_PX + 1, height - FIT_PADDING_PX),
      ],
    ],
    { type: 'Sphere' },
  );
}

/**
 * The projection the camera sees. The camera transform (scale k, then translate
 * x/y) composes with the base fit linearly, so it folds into the projection's
 * own scale and translate — which is what lets d3's geoPath render polygons,
 * graticule and resampled lines under the camera with no second transform pass
 * (and no stroke widths scaling with the zoom).
 */
export function mapProjection(
  width: number,
  height: number,
  camera: MapCamera,
): GeoProjection {
  const base = fittedProjection(width, height);
  const [tx, ty] = base.translate();
  return geoNaturalEarth1()
    .scale(base.scale() * camera.k)
    .translate([tx * camera.k + camera.x, ty * camera.k + camera.y]);
}

/** Screen position of a place, or null for a point the projection rejects. */
export function projectPoint(
  proj: GeoProjection,
  lat: number,
  lng: number,
): [number, number] | null {
  const p = proj([lng, lat]);
  return p ? [p[0], p[1]] : null;
}

/** The place under a screen position, or null off the projected world. */
export function unprojectPoint(
  proj: GeoProjection,
  x: number,
  y: number,
): { lat: number; lng: number } | null {
  const p = proj.invert?.([x, y]);
  if (!p || !Number.isFinite(p[0]) || !Number.isFinite(p[1])) return null;
  return { lat: p[1], lng: p[0] };
}

/** The projected world's bounding box under this camera, in screen pixels.
 *  Measured off the base fit (fitExtent letterboxes — Natural Earth is wider
 *  than it is tall, so the sphere never fills a squarer viewport vertically)
 *  and then carried through the camera, which is linear. */
function worldBounds(
  width: number,
  height: number,
  camera: MapCamera,
): { x0: number; y0: number; x1: number; y1: number } {
  const base = fittedProjection(width, height);
  const [[bx0, by0], [bx1, by1]] = geoPath(base).bounds({ type: 'Sphere' });
  return {
    x0: bx0 * camera.k + camera.x,
    y0: by0 * camera.k + camera.y,
    x1: bx1 * camera.k + camera.x,
    y1: by1 * camera.k + camera.y,
  };
}

/**
 * Keep the world on the canvas. Zoom is clamped to the reachable range, and the
 * translation so that at least MIN_WORLD_VISIBLE_PX of the world's box remains
 * in view on each axis — a drag can park the map half off-screen, never lose it.
 */
export function clampCamera(
  camera: MapCamera,
  width: number,
  height: number,
): MapCamera {
  const k = clamp(camera.k, MIN_ZOOM, MAX_ZOOM);
  const probe = { k, x: camera.x, y: camera.y };
  const box = worldBounds(width, height, probe);
  const w = box.x1 - box.x0;
  const h = box.y1 - box.y0;
  const visible = Math.min(MIN_WORLD_VISIBLE_PX, w / 2, h / 2);
  // The box must keep `visible` px inside [0,width] x [0,height].
  const minX = visible - (box.x1 - probe.x); // world right edge >= visible
  const maxX = width - visible - (box.x0 - probe.x); // world left edge <= width - visible
  const minY = visible - (box.y1 - probe.y);
  const maxY = height - visible - (box.y0 - probe.y);
  return {
    k,
    x: clamp(probe.x, minX, maxX),
    y: clamp(probe.y, minY, maxY),
  };
}

/** Slide the camera by a screen-pixel delta (the drag gesture). */
export function panCamera(
  camera: MapCamera,
  dx: number,
  dy: number,
  width: number,
  height: number,
): MapCamera {
  return clampCamera(
    { k: camera.k, x: camera.x + dx, y: camera.y + dy },
    width,
    height,
  );
}

/**
 * Zoom by `factor` keeping the screen point `at` over the same place — the
 * wheel gesture's contract. Derivation: a base-projected point v lands at
 * screen s = k·v + t, so holding s fixed across k -> k' means
 * t' = s - (k'/k)(s - t).
 */
export function zoomCamera(
  camera: MapCamera,
  factor: number,
  at: { x: number; y: number },
  width: number,
  height: number,
): MapCamera {
  const k = clamp(camera.k * factor, MIN_ZOOM, MAX_ZOOM);
  const ratio = k / camera.k;
  return clampCamera(
    {
      k,
      x: at.x - ratio * (at.x - camera.x),
      y: at.y - ratio * (at.y - camera.y),
    },
    width,
    height,
  );
}

/** A camera holding this place at the viewport centre, at zoom k. */
export function cameraCenteredOn(
  lat: number,
  lng: number,
  k: number,
  width: number,
  height: number,
): MapCamera {
  const base = fittedProjection(width, height);
  const p = base([lng, lat]);
  if (!p) return clampCamera({ k, x: 0, y: 0 }, width, height);
  return clampCamera(
    { k, x: width / 2 - k * p[0], y: height / 2 - k * p[1] },
    width,
    height,
  );
}

/** Breathing room around a fitted set of points — same intent as the globe's
 *  FIT_MARGIN: endpoints land inside the frame, not on its rim. */
const FIT_POINTS_MARGIN = 1.25;

/**
 * A camera that frames every one of these points at once — the flat analogue of
 * the globe's povFitPoints. Framing is done in base-projected space, where there
 * is no antimeridian to straddle: two points either side of the dateline project
 * to the two edges of the map, and the honest answer there is a wide view, not a
 * wrapped one.
 */
export function cameraFitPoints(
  points: readonly { lat: number; lng: number }[],
  width: number,
  height: number,
): MapCamera {
  if (points.length === 0) return clampCamera(HOME_CAMERA, width, height);
  const base = fittedProjection(width, height);
  let x0 = Infinity;
  let y0 = Infinity;
  let x1 = -Infinity;
  let y1 = -Infinity;
  for (const pt of points) {
    const p = base([pt.lng, pt.lat]);
    if (!p) continue;
    x0 = Math.min(x0, p[0]);
    y0 = Math.min(y0, p[1]);
    x1 = Math.max(x1, p[0]);
    y1 = Math.max(y1, p[1]);
  }
  if (!Number.isFinite(x0)) return clampCamera(HOME_CAMERA, width, height);
  if (points.length === 1) {
    return cameraCenteredOn(
      points[0].lat,
      points[0].lng,
      FOCUS_ZOOM,
      width,
      height,
    );
  }
  const spanW = Math.max(1, (x1 - x0) * FIT_POINTS_MARGIN);
  const spanH = Math.max(1, (y1 - y0) * FIT_POINTS_MARGIN);
  const k = clamp(Math.min(width / spanW, height / spanH), MIN_ZOOM, MAX_ZOOM);
  const cx = (x0 + x1) / 2;
  const cy = (y0 + y1) / 2;
  return clampCamera(
    { k, x: width / 2 - k * cx, y: height / 2 - k * cy },
    width,
    height,
  );
}

/** The zoom a single-target fly-to lands at: close enough that the node's city
 *  and neighbours read, far enough that there is context around it. */
export const FOCUS_ZOOM = 6;

/** The zoom the map opens at over the org's own site — the flat counterpart of
 *  the globe's establishing altitude of 1.8 (see syntheticAltitude: 2.2/1.8). */
export const OPENING_ZOOM = 2.2 / 1.8;

/**
 * The globe-altitude this zoom level corresponds to.
 *
 * The scene code speaks altitude everywhere — labelTier, laneZoomT, the admin-1
 * reveal — and re-deriving three parallel zoom ladders for the flat map would
 * guarantee the two views disagree about when detail arrives. So the map speaks
 * altitude too, through this one mapping: at k = 1 the whole world is in frame,
 * which on the globe is the far end of the wheel (2.2 is the intro's own pull-
 * back altitude); every doubling of zoom halves the "height". Clamped to the
 * globe's reachable range so every consumer sees numbers it was tuned for.
 */
export function syntheticAltitude(k: number): number {
  return clamp(2.2 / Math.max(MIN_ZOOM, k), 0.12, 2.6);
}
