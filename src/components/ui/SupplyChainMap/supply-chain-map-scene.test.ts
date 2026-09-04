import assert from 'node:assert/strict';

import {
  buildConfirmedMapScene,
  projectNaturalEarthPoint,
  resolveMapSelection,
} from './supply-chain-map-scene';
import type {
  EntityGeo,
  GraphStatus,
  MapEdge,
  MapEntity,
} from './supply-chain-map-types';

function entity(
  id: string,
  status: GraphStatus,
  geo?: EntityGeo,
  type = 'supplier',
): MapEntity {
  return {
    id,
    type,
    name: `Entity ${id}`,
    status,
    geo,
  };
}

function edge(
  id: string,
  from: string,
  to: string,
  status: GraphStatus,
): MapEdge {
  return {
    id,
    from_entity: from,
    to_entity: to,
    relation: 'supplies',
    status,
  };
}

function testConfirmedPlacedNodesOnly() {
  const entities = [
    entity('valid', 'confirmed', {
      lat: 51.5072,
      lng: -0.1276,
      precision: 'city',
      place: 'London',
      country: 'GB',
    }),
    entity('draft', 'draft', { lat: 48.8566, lng: 2.3522, precision: 'city' }),
    entity('rejected', 'rejected', {
      lat: 52.52,
      lng: 13.405,
      precision: 'city',
    }),
    entity('unplaced', 'confirmed'),
    entity('nan', 'confirmed', {
      lat: Number.NaN,
      lng: 10,
      precision: 'region',
    }),
    entity('infinite', 'confirmed', {
      lat: 10,
      lng: Number.POSITIVE_INFINITY,
      precision: 'region',
    }),
    entity('latitude', 'confirmed', {
      lat: 90.1,
      lng: 10,
      precision: 'country',
    }),
    entity('longitude', 'confirmed', {
      lat: 10,
      lng: -180.1,
      precision: 'country',
    }),
  ];

  const scene = buildConfirmedMapScene(entities, []);

  assert.deepEqual(scene.nodes, [
    {
      id: 'valid',
      name: 'Entity valid',
      type: 'supplier',
      lat: 51.5072,
      lng: -0.1276,
      precision: 'city',
      place: 'London',
      country: 'GB',
    },
  ]);
}

function testConfirmedEdgesNeedTwoPlacedConfirmedEndpoints() {
  const entities = [
    entity('a', 'confirmed', { lat: 51.5072, lng: -0.1276, precision: 'city' }),
    entity('b', 'confirmed', {
      lat: 35.6762,
      lng: 139.6503,
      precision: 'city',
    }),
    entity('unplaced', 'confirmed'),
    entity('draft', 'draft', { lat: 1.3521, lng: 103.8198, precision: 'city' }),
  ];
  const edges = [
    edge('kept', 'a', 'b', 'confirmed'),
    edge('draft-edge', 'a', 'b', 'draft'),
    edge('missing-endpoint', 'a', 'missing', 'confirmed'),
    edge('unplaced-endpoint', 'a', 'unplaced', 'confirmed'),
    edge('draft-endpoint', 'a', 'draft', 'confirmed'),
  ];

  assert.deepEqual(buildConfirmedMapScene(entities, edges).arcs, [
    {
      id: 'kept',
      fromEntity: 'a',
      toEntity: 'b',
      relation: 'supplies',
      from: [-0.1276, 51.5072],
      to: [139.6503, 35.6762],
    },
  ]);
}

function testInputsAreNotMutated() {
  const entities = [
    entity('a', 'confirmed', {
      lat: 51.5072,
      lng: -0.1276,
      precision: 'city',
      place: 'London',
    }),
    entity('b', 'confirmed', {
      lat: 35.6762,
      lng: 139.6503,
      precision: 'city',
    }),
  ];
  const edges = [edge('e', 'a', 'b', 'confirmed')];
  const entitiesBefore = JSON.parse(JSON.stringify(entities));
  const edgesBefore = JSON.parse(JSON.stringify(edges));

  buildConfirmedMapScene(entities, edges);

  assert.deepEqual(entities, entitiesBefore);
  assert.deepEqual(edges, edgesBefore);
}

function testStaleSelectionClearsWhenNodeLeavesScene() {
  const london = entity('valid', 'confirmed', {
    lat: 51.5072,
    lng: -0.1276,
    precision: 'city',
    place: 'London',
    country: 'GB',
  });
  const selected = buildConfirmedMapScene([london], []).nodes[0];
  assert.equal(resolveMapSelection(selected, [selected])?.id, 'valid');
  assert.equal(resolveMapSelection(selected, []), null);
  assert.equal(resolveMapSelection(null, [selected]), null);
}

function testKnownPlaceProjectsInsideViewport() {
  const width = 960;
  const height = 520;
  const point = projectNaturalEarthPoint([-0.1276, 51.5072], width, height);

  assert.ok(point, 'London should project');
  assert.ok(
    point[0] >= 0 && point[0] <= width,
    `x ${point[0]} should be inside the viewport`,
  );
  assert.ok(
    point[1] >= 0 && point[1] <= height,
    `y ${point[1]} should be inside the viewport`,
  );
}

describe('supply-chain-map-scene', () => {
  it('keeps only confirmed placed nodes', testConfirmedPlacedNodesOnly);
  it(
    'needs two placed confirmed endpoints',
    testConfirmedEdgesNeedTwoPlacedConfirmedEndpoints,
  );
  it('does not mutate inputs', testInputsAreNotMutated);
  it('clears a stale selection', testStaleSelectionClearsWhenNodeLeavesScene);
  it(
    'projects a known place inside the viewport',
    testKnownPlaceProjectsInsideViewport,
  );
});
