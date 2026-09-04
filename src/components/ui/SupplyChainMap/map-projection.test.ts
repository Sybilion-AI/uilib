import assert from 'node:assert/strict';

import {
  HOME_CAMERA,
  MAX_ZOOM,
  MIN_ZOOM,
  cameraCenteredOn,
  cameraFitPoints,
  clampCamera,
  mapProjection,
  panCamera,
  projectPoint,
  syntheticAltitude,
  unprojectPoint,
  zoomCamera,
} from './map-projection';

const W = 1200;
const H = 700;

function labelTier(altitude: number): 'far' | 'mid' | 'near' {
  if (altitude > 1.6) return 'far';
  if (altitude > 0.9) return 'mid';
  return 'near';
}

function testAKnownPlaceProjectsInsideTheViewport() {
  const proj = mapProjection(W, H, HOME_CAMERA);
  for (const [lat, lng] of [
    [51.9, 4.5],
    [31.2, 121.5],
    [-33.9, 18.4],
    [40.7, -74.0],
  ]) {
    const p = projectPoint(proj, lat, lng);
    assert.ok(p, `(${lat}, ${lng}) projected to nothing`);
    assert.ok(p[0] > 0 && p[0] < W, `x ${p[0]} off canvas`);
    assert.ok(p[1] > 0 && p[1] < H, `y ${p[1]} off canvas`);
  }
}

function testProjectAndUnprojectRoundTrip() {
  const proj = mapProjection(W, H, { k: 3, x: -420, y: -180 });
  const p = projectPoint(proj, 48.1, 11.6)!;
  const back = unprojectPoint(proj, p[0], p[1])!;
  assert.ok(Math.abs(back.lat - 48.1) < 1e-6, `lat came back as ${back.lat}`);
  assert.ok(Math.abs(back.lng - 11.6) < 1e-6, `lng came back as ${back.lng}`);
}

function testWestIsLeftAndNorthIsUp() {
  const proj = mapProjection(W, H, HOME_CAMERA);
  const ny = projectPoint(proj, 40.7, -74.0)!;
  const shanghai = projectPoint(proj, 31.2, 121.5)!;
  const capeTown = projectPoint(proj, -33.9, 18.4)!;
  const oslo = projectPoint(proj, 59.9, 10.7)!;
  assert.ok(ny[0] < shanghai[0], 'New York should draw left of Shanghai');
  assert.ok(oslo[1] < capeTown[1], 'Oslo should draw above Cape Town');
}

function testZoomKeepsTheAnchorPointStill() {
  const before = { k: 2, x: -300, y: -100 };
  const proj = mapProjection(W, H, before);
  const anchor = { x: 500, y: 300 };
  const place = unprojectPoint(proj, anchor.x, anchor.y)!;
  const after = zoomCamera(before, 1.7, anchor, W, H);
  const p = projectPoint(mapProjection(W, H, after), place.lat, place.lng)!;
  assert.ok(Math.abs(p[0] - anchor.x) < 1e-6, `anchor drifted to x ${p[0]}`);
  assert.ok(Math.abs(p[1] - anchor.y) < 1e-6, `anchor drifted to y ${p[1]}`);
}

function testZoomIsClampedToTheReachableRange() {
  const at = { x: W / 2, y: H / 2 };
  assert.equal(zoomCamera(HOME_CAMERA, 0.01, at, W, H).k, MIN_ZOOM);
  assert.equal(zoomCamera({ k: 20, x: 0, y: 0 }, 100, at, W, H).k, MAX_ZOOM);
}

function testPanCannotThrowTheWorldOffTheCanvas() {
  let cam = clampCamera({ k: 4, x: 0, y: 0 }, W, H);
  cam = panCamera(cam, 1e6, 1e6, W, H);
  const proj = mapProjection(W, H, cam);
  const corners = [
    projectPoint(proj, 0, 0),
    projectPoint(proj, 80, -170),
    projectPoint(proj, -80, 170),
  ].filter(Boolean) as [number, number][];
  assert.ok(
    corners.some(p => p[0] > -W && p[0] < 2 * W && p[1] > -H && p[1] < 2 * H),
    'the whole world was flung away',
  );
  const again = clampCamera(cam, W, H);
  assert.ok(
    Math.abs(again.x - cam.x) < 1e-9 && Math.abs(again.y - cam.y) < 1e-9,
  );
}

function testCenteringPutsThePlaceMidViewport() {
  const cam = cameraCenteredOn(48.1, 11.6, 5, W, H);
  const p = projectPoint(mapProjection(W, H, cam), 48.1, 11.6)!;
  assert.ok(Math.abs(p[0] - W / 2) < 1, `x ${p[0]} not centred`);
  assert.ok(Math.abs(p[1] - H / 2) < 1, `y ${p[1]} not centred`);
}

function testFitPointsFramesEveryInput() {
  const points = [
    { lat: 51.9, lng: 4.5 },
    { lat: 31.2, lng: 121.5 },
    { lat: 1.35, lng: 103.8 },
  ];
  const cam = cameraFitPoints(points, W, H);
  const proj = mapProjection(W, H, cam);
  for (const pt of points) {
    const p = projectPoint(proj, pt.lat, pt.lng)!;
    assert.ok(p[0] > 0 && p[0] < W, `${pt.lng} fitted off canvas at x ${p[0]}`);
    assert.ok(p[1] > 0 && p[1] < H, `${pt.lat} fitted off canvas at y ${p[1]}`);
  }
  const near = cameraFitPoints(
    [
      { lat: 51.9, lng: 4.5 },
      { lat: 51.2, lng: 4.4 },
    ],
    W,
    H,
  );
  assert.ok(near.k > 2, `nearby pair fitted at k ${near.k}`);
}

function testFitWithNothingIsTheHomeView() {
  const cam = cameraFitPoints([], W, H);
  assert.equal(cam.k, 1);
}

function testSyntheticAltitudeSpansTheGlobesTiers() {
  assert.equal(labelTier(syntheticAltitude(1)), 'far');
  assert.equal(labelTier(syntheticAltitude(2)), 'mid');
  assert.equal(labelTier(syntheticAltitude(4)), 'near');
}

function testSyntheticAltitudeIsMonotonicAndClamped() {
  assert.ok(syntheticAltitude(1) > syntheticAltitude(2));
  assert.ok(syntheticAltitude(2) > syntheticAltitude(8));
  assert.equal(syntheticAltitude(1000), 0.12);
  assert.ok(syntheticAltitude(1) <= 2.6);
}

describe('map-projection', () => {
  it(
    'projects known places inside the viewport',
    testAKnownPlaceProjectsInsideTheViewport,
  );
  it('round-trips project and unproject', testProjectAndUnprojectRoundTrip);
  it('draws west left and north up', testWestIsLeftAndNorthIsUp);
  it('keeps the zoom anchor still', testZoomKeepsTheAnchorPointStill);
  it(
    'clamps zoom to the reachable range',
    testZoomIsClampedToTheReachableRange,
  );
  it(
    'cannot pan the world off the canvas',
    testPanCannotThrowTheWorldOffTheCanvas,
  );
  it('centers a place mid-viewport', testCenteringPutsThePlaceMidViewport);
  it('fits every input point', testFitPointsFramesEveryInput);
  it('fits nothing as the home view', testFitWithNothingIsTheHomeView);
  it(
    'maps synthetic altitude to globe tiers',
    testSyntheticAltitudeSpansTheGlobesTiers,
  );
  it(
    'keeps synthetic altitude monotonic and clamped',
    testSyntheticAltitudeIsMonotonicAndClamped,
  );
});
