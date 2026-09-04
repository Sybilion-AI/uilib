import assert from 'node:assert/strict';

import {
  CLUSTER_RADIUS_PX,
  clusterMapNodes,
  forceOpenExpired,
  remapArcsToClusters,
} from './supply-chain-map-clusters';

function projectScale(
  scale: number,
): (lat: number, lng: number) => [number, number] {
  return (lat, lng) => [lng * scale, lat * scale];
}

function testIsolatedNodesStaySingletons() {
  const nodes = [
    { id: 'a', lat: 0, lng: 0 },
    { id: 'b', lat: 10, lng: 10 },
  ];
  const clusters = clusterMapNodes(nodes, projectScale(20), 40);
  assert.equal(clusters.length, 2);
  assert.deepEqual(clusters.map(c => c.id).sort(), ['a', 'b']);
  assert.ok(clusters.every(c => c.count === 1 && c.nodeId === c.id));
}

function testNearbyPixelsMerge() {
  const nodes = [
    { id: 'b', lat: 0, lng: 1 },
    { id: 'a', lat: 0, lng: 0 },
  ];
  const clusters = clusterMapNodes(nodes, projectScale(10), 40);
  assert.equal(clusters.length, 1);
  assert.equal(clusters[0].count, 2);
  assert.deepEqual(clusters[0].memberIds, ['a', 'b']);
  assert.equal(clusters[0].id, 'cluster:a');
  assert.equal(clusters[0].nodeId, null);
  assert.equal(clusters[0].lat, 0);
  assert.equal(clusters[0].lng, 0.5);
}

function testFarPixelsStaySeparate() {
  const nodes = [
    { id: 'a', lat: 0, lng: 0 },
    { id: 'b', lat: 0, lng: 10 },
  ];
  const clusters = clusterMapNodes(nodes, projectScale(10), 40);
  assert.equal(clusters.length, 2);
}

function testConnectedComponentMergesAChain() {
  const nodes = [
    { id: 'a', lat: 0, lng: 0 },
    { id: 'b', lat: 0, lng: 3 },
    { id: 'c', lat: 0, lng: 6 },
  ];
  // 30px between neighbours, 60px from a to c — still one cluster.
  const clusters = clusterMapNodes(nodes, projectScale(10), 40);
  assert.equal(clusters.length, 1);
  assert.deepEqual(clusters[0].memberIds, ['a', 'b', 'c']);
}

function testEveryProjectedNodeStaysInACluster() {
  const nodes = Array.from({ length: 40 }, (_, i) => ({
    id: `n-${i}`,
    lat: (i % 8) * 4,
    lng: Math.floor(i / 8) * 4,
  }));
  const clusters = clusterMapNodes(nodes, projectScale(2), 40);
  const members = clusters.flatMap(c => c.memberIds).sort();
  assert.deepEqual(members, nodes.map(n => n.id).sort());
  assert.equal(
    clusters.reduce((sum, c) => sum + c.count, 0),
    nodes.length,
  );
}

function testUnprojectableNodesAreDropped() {
  const clusters = clusterMapNodes(
    [
      { id: 'a', lat: 0, lng: 0 },
      { id: 'ghost', lat: 99, lng: 99 },
    ],
    (lat, lng) => (lat === 99 ? null : [lng, lat]),
    40,
  );
  assert.deepEqual(
    clusters.map(c => c.id),
    ['a'],
  );
}

function testForceOpenExpiresOnlyOnZoomOutPastExpandK() {
  assert.equal(forceOpenExpired(3, 3), false);
  assert.equal(forceOpenExpired(3, 4), false);
  assert.equal(forceOpenExpired(3, 2.9), true);
}

function testExpandIdsStaySingletons() {
  const nodes = [
    { id: 'a', lat: 0, lng: 0 },
    { id: 'b', lat: 0, lng: 1 },
  ];
  const merged = clusterMapNodes(nodes, projectScale(10), 40);
  const expanded = clusterMapNodes(
    nodes,
    projectScale(10),
    40,
    new Set(['a', 'b']),
  );
  assert.equal(merged.length, 1);
  assert.equal(expanded.length, 2);
}

function testZoomSplitsACluster() {
  const nodes = [
    { id: 'a', lat: 0, lng: 0 },
    { id: 'b', lat: 0, lng: 3 },
  ];
  const zoomedOut = clusterMapNodes(nodes, projectScale(10), CLUSTER_RADIUS_PX);
  const zoomedIn = clusterMapNodes(nodes, projectScale(20), CLUSTER_RADIUS_PX);
  assert.equal(zoomedOut.length, 1);
  assert.equal(zoomedIn.length, 2);
}

function testRemapDropsIntraClusterArcs() {
  const clusters = clusterMapNodes(
    [
      { id: 'a', lat: 0, lng: 0 },
      { id: 'b', lat: 0, lng: 1 },
      { id: 'c', lat: 20, lng: 20 },
    ],
    projectScale(10),
    40,
  );
  const remapped = remapArcsToClusters(
    [
      {
        id: 'ab',
        fromEntity: 'a',
        toEntity: 'b',
        from: [0, 0],
        to: [1, 0],
      },
      {
        id: 'ac',
        fromEntity: 'a',
        toEntity: 'c',
        from: [0, 0],
        to: [20, 20],
      },
    ],
    clusters,
  );
  assert.deepEqual(
    remapped.map(a => a.id),
    ['ac'],
  );
  const abCluster = clusters.find(c => c.memberIds.includes('a'));
  assert.ok(abCluster);
  assert.deepEqual(remapped[0].from, [abCluster.lng, abCluster.lat]);
  assert.deepEqual(remapped[0].to, [20, 20]);
}

describe('supply-chain-map-clusters', () => {
  it('keeps isolated nodes as singletons', testIsolatedNodesStaySingletons);
  it('merges nearby pixels', testNearbyPixelsMerge);
  it('keeps far pixels separate', testFarPixelsStaySeparate);
  it('merges a connected chain', testConnectedComponentMergesAChain);
  it(
    'keeps every projected node in a cluster',
    testEveryProjectedNodeStaysInACluster,
  );
  it('drops unprojectable nodes', testUnprojectableNodesAreDropped);
  it(
    'expires force-open only on zoom out',
    testForceOpenExpiresOnlyOnZoomOutPastExpandK,
  );
  it('keeps expand ids as singletons', testExpandIdsStaySingletons);
  it('splits a cluster on zoom', testZoomSplitsACluster);
  it('drops intra-cluster arcs', testRemapDropsIntraClusterArcs);
});
