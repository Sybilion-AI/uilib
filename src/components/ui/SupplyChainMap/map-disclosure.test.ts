import assert from 'node:assert/strict';

import {
  type MapDisclosureTier,
  discloseMapScene,
  mapRoutingArcs,
  resolveMapDisclosureAnchors,
} from './map-disclosure';

type TestNode = { id: string; label: string; impacted?: boolean };
type TestArc = {
  id: string;
  fromId: string;
  toId: string;
  onSpine?: boolean;
  impacted?: boolean;
  reach?: string | null;
};

function largeScene() {
  const nodes: TestNode[] = Array.from({ length: 71 }, (_, index) => ({
    id: index === 0 ? 'org' : `node-${String(index).padStart(2, '0')}`,
    label: `Node ${index}`,
  }));
  const arcs: TestArc[] = Array.from({ length: 70 }, (_, index) => ({
    id: `arc-${String(index).padStart(2, '0')}`,
    fromId: nodes[index].id,
    toId: nodes[index + 1].id,
  }));
  return { nodes, arcs };
}

function testTierBudgetsAndCompleteReveal() {
  const { nodes, arcs } = largeScene();
  const cases: Array<{
    options: { tier: MapDisclosureTier; orgId: string; expanded?: boolean };
    arcCount: number;
    routeBudget: number | null;
  }> = [
    { options: { tier: 'far', orgId: 'org' }, arcCount: 18, routeBudget: 18 },
    { options: { tier: 'mid', orgId: 'org' }, arcCount: 48, routeBudget: 48 },
    {
      options: { tier: 'near', orgId: 'org' },
      arcCount: arcs.length,
      routeBudget: null,
    },
    {
      options: { tier: 'far', orgId: 'org', expanded: true },
      arcCount: arcs.length,
      routeBudget: null,
    },
  ];

  for (const { options, arcCount, routeBudget } of cases) {
    const result = discloseMapScene(nodes, arcs, options);
    assert.equal(result.arcs.length, arcCount, JSON.stringify(options));
    assert.equal(result.routeBudget, routeBudget, JSON.stringify(options));
    assert.equal(result.nodes.length, nodes.length);
    if (routeBudget === null) {
      assert.equal(result.canRevealByZoom, false);
    }
  }
}

function testMandatoryCascadeRoutesMayExceedTheBudget() {
  const nodes = Array.from({ length: 36 }, (_, index) => ({
    id: `n-${index}`,
    label: `${index}`,
  }));
  const arcs: TestArc[] = Array.from({ length: 35 }, (_, index) => ({
    id: `route-${String(index).padStart(2, '0')}`,
    fromId: nodes[index].id,
    toId: nodes[index + 1].id,
    ...(index < 9
      ? { onSpine: true }
      : index < 18
        ? { impacted: true }
        : index < 25
          ? { reach: 'exposure' }
          : {}),
  }));

  const result = discloseMapScene(nodes, arcs, { tier: 'far' });
  assert.equal(result.arcs.length, 25);
}

function testEverySelectedIncidentRouteSurvives() {
  const selected = { id: 'selected', label: 'Selected' };
  const leaves = Array.from({ length: 24 }, (_, index) => ({
    id: `leaf-${String(index).padStart(2, '0')}`,
    label: `Leaf ${index}`,
  }));
  const selectedArcs: TestArc[] = leaves.map((leaf, index) => ({
    id: `selected-${String(index).padStart(2, '0')}`,
    fromId: index % 2 === 0 ? selected.id : leaf.id,
    toId: index % 2 === 0 ? leaf.id : selected.id,
  }));

  const result = discloseMapScene([selected, ...leaves], selectedArcs, {
    tier: 'far',
    selectedId: selected.id,
  });
  assert.equal(result.arcs.length, selectedArcs.length);
}

function testUnconnectedSelectionRemainsVisible() {
  const { nodes, arcs } = largeScene();
  const isolated = { id: 'isolated', label: 'Isolated' };
  const result = discloseMapScene([...nodes, isolated], arcs, {
    tier: 'far',
    orgId: 'org',
    selectedId: isolated.id,
  });
  assert.ok(result.nodes.includes(isolated));
}

function testFarTierKeepsIsolatedUnselectedPlaces() {
  const { nodes, arcs } = largeScene();
  const isolated = { id: 'isolated', label: 'Isolated' };
  const result = discloseMapScene([...nodes, isolated], arcs, {
    tier: 'far',
    orgId: 'org',
  });
  assert.ok(result.nodes.includes(isolated));
  assert.equal(result.nodes.length, nodes.length + 1);
  assert.equal(result.hiddenNodeCount, 0);
}

function testIsolatedImpactedNodeRemainsVisible() {
  const { nodes, arcs } = largeScene();
  const impacted = {
    id: 'isolated-impact',
    label: 'Exposure site',
    impacted: true,
  };
  const result = discloseMapScene([...nodes, impacted], arcs, {
    tier: 'far',
    orgId: 'org',
  });
  assert.ok(result.nodes.includes(impacted));
  assert.equal(result.arcs.length, 18);
}

function testMissingOrganizationFallsBackToDegreeRanking() {
  const hub = { id: 'hub', label: 'Hub' };
  const leaves = Array.from({ length: 25 }, (_, index) => ({
    id: `leaf-${String(index).padStart(2, '0')}`,
    label: `Leaf ${index}`,
  }));
  const hubArcs: TestArc[] = leaves.map((leaf, index) => ({
    id: `z-hub-${String(index).padStart(2, '0')}`,
    fromId: hub.id,
    toId: leaf.id,
  }));
  const lowDegreeArcs: TestArc[] = Array.from({ length: 25 }, (_, index) => ({
    id: `a-low-${String(index).padStart(2, '0')}`,
    fromId: `low-${index * 2}`,
    toId: `low-${index * 2 + 1}`,
  }));
  const lowNodes = Array.from({ length: 50 }, (_, index) => ({
    id: `low-${index}`,
    label: `Low ${index}`,
  }));

  const result = discloseMapScene(
    [hub, ...leaves, ...lowNodes],
    [...lowDegreeArcs, ...hubArcs],
    { tier: 'far', orgId: 'not-in-scene' },
  );
  assert.deepEqual(
    result.arcs.map(arc => arc.id),
    hubArcs.slice(0, 18).map(arc => arc.id),
  );
}

function testCountsOrderAndObjectIdentityAreStable() {
  const { nodes, arcs } = largeScene();
  const options = { tier: 'far' as const, orgId: 'org', focusId: 'node-65' };
  const first = discloseMapScene(nodes, arcs, options);
  const second = discloseMapScene(nodes, arcs, options);
  assert.deepEqual(
    first.arcs.map(arc => arc.id),
    second.arcs.map(arc => arc.id),
  );
  assert.equal(first.canRevealByZoom, true);
  for (const arc of first.arcs) assert.equal(arcs.includes(arc), true);
}

function testAnchorLookupAndRoutingHelper() {
  const lookup = new Map([
    ['a', { id: 'rep' }],
    ['rep', { id: 'rep' }],
  ]);
  assert.deepEqual(resolveMapDisclosureAnchors(lookup, { selectedId: 'a' }), {
    selectedId: 'rep',
    focusId: undefined,
    signalIds: undefined,
  });
  assert.deepEqual(mapRoutingArcs(['full'], ['shown'], false), ['shown']);
  assert.deepEqual(mapRoutingArcs(['full'], ['shown'], true), ['full']);
}

describe('map-disclosure', () => {
  it(
    'applies tier budgets and complete reveal',
    testTierBudgetsAndCompleteReveal,
  );
  it(
    'lets mandatory cascade routes exceed the budget',
    testMandatoryCascadeRoutesMayExceedTheBudget,
  );
  it(
    'keeps every selected incident route',
    testEverySelectedIncidentRouteSurvives,
  );
  it(
    'keeps an unconnected selection visible',
    testUnconnectedSelectionRemainsVisible,
  );
  it(
    'keeps isolated unselected places at far tier',
    testFarTierKeepsIsolatedUnselectedPlaces,
  );
  it(
    'keeps an isolated impacted node visible',
    testIsolatedImpactedNodeRemainsVisible,
  );
  it(
    'falls back to degree ranking without org',
    testMissingOrganizationFallsBackToDegreeRanking,
  );
  it(
    'keeps counts and identity stable',
    testCountsOrderAndObjectIdentityAreStable,
  );
  it('resolves anchors and routing helper', testAnchorLookupAndRoutingHelper);
});
