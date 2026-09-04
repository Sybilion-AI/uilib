import assert from 'node:assert/strict';

import { type MapLabel, placeMapLabels } from './map-labels';

const W = 1000;
const H = 600;

function label(
  id: string,
  lat: number,
  lng: number,
  text = id,
  primary = false,
): MapLabel {
  return { id, lat, lng, text, primary };
}

function project(lat: number, lng: number): [number, number] | null {
  return [W / 2 + lng * 2, H / 2 - lat * 2];
}

function testSeparatedLabelsAllDraw() {
  const placed = placeMapLabels(
    [label('a', 0, -100), label('b', 0, 0), label('c', 0, 100)],
    project,
    W,
    H,
  );
  assert.deepEqual(placed.map(l => l.id).sort(), ['a', 'b', 'c']);
}

function testCollidingLabelsKeepTheHigherRanked() {
  const placed = placeMapLabels(
    [label('winner', 0, 0), label('loser', 0.5, 0.5)],
    project,
    W,
    H,
  );
  assert.deepEqual(
    placed.map(l => l.id),
    ['winner'],
  );
}

function testOffscreenLabelsNeitherDrawNorVeto() {
  const placed = placeMapLabels(
    [label('far', 0, 4000), label('here', 0, 0)],
    project,
    W,
    H,
  );
  assert.deepEqual(
    placed.map(l => l.id),
    ['here'],
  );
}

function testAnUnprojectablePointIsSkipped() {
  const placed = placeMapLabels([label('a', 0, 0)], () => null, W, H);
  assert.equal(placed.length, 0);
}

function testPlacementCarriesTheAnchorPixel() {
  const placed = placeMapLabels([label('a', 10, 20)], project, W, H);
  assert.equal(placed[0].x, W / 2 + 40);
  assert.equal(placed[0].y, H / 2 - 20);
}

function testLongerNamesClaimMoreRoom() {
  const apart = placeMapLabels(
    [label('a', 0, 0, 'Ab'), label('b', 0, 20, 'Cd')],
    project,
    W,
    H,
  );
  assert.equal(apart.length, 2, 'short names side by side should both draw');
  const crowded = placeMapLabels(
    [
      label('a', 0, 0, 'A very long supplier name GmbH'),
      label('b', 0, 20, 'Cd'),
    ],
    project,
    W,
    H,
  );
  assert.deepEqual(
    crowded.map(l => l.id),
    ['a'],
  );
}

describe('map-labels', () => {
  it('draws separated labels', testSeparatedLabelsAllDraw);
  it(
    'keeps the higher-ranked colliding label',
    testCollidingLabelsKeepTheHigherRanked,
  );
  it('skips offscreen labels', testOffscreenLabelsNeitherDrawNorVeto);
  it('skips an unprojectable point', testAnUnprojectablePointIsSkipped);
  it('carries the anchor pixel', testPlacementCarriesTheAnchorPixel);
  it('gives longer names more room', testLongerNamesClaimMoreRoom);
});
