export type MapDisclosureTier = 'far' | 'mid' | 'near';

export type MapDisclosureOptions = {
  tier: MapDisclosureTier;
  orgId?: string | null;
  selectedId?: string | null;
  focusId?: string | null;
  signalIds?: ReadonlySet<string>;
  expanded?: boolean;
};

export type MapDisclosureResult<TNode, TArc> = {
  nodes: TNode[];
  arcs: TArc[];
  hiddenNodeCount: number;
  hiddenArcCount: number;
  routeBudget: number | null;
  canRevealByZoom: boolean;
};

type DisclosureAnchors = Pick<
  MapDisclosureOptions,
  'selectedId' | 'focusId' | 'signalIds'
>;

export function resolveMapDisclosureAnchors<TNode extends { id: string }>(
  lookup: ReadonlyMap<string, TNode>,
  anchors: DisclosureAnchors,
): DisclosureAnchors {
  const resolve = <T extends string | null | undefined>(id: T): T =>
    (id == null ? id : (lookup.get(id)?.id ?? id)) as T;
  return {
    selectedId: resolve(anchors.selectedId),
    focusId: resolve(anchors.focusId),
    signalIds:
      anchors.signalIds == null
        ? undefined
        : new Set([...anchors.signalIds].map(id => resolve(id))),
  };
}

export function mapRoutingArcs<TArc>(
  fullSceneArcs: readonly TArc[],
  disclosedArcs: readonly TArc[],
  worldAnalysisActive: boolean,
): readonly TArc[] {
  return worldAnalysisActive ? fullSceneArcs : disclosedArcs;
}

type DisclosureArc = {
  id: string;
  fromId: string;
  toId: string;
  onSpine?: boolean;
  impacted?: boolean;
  reach?: string | null;
};

function tierBudget(options: MapDisclosureOptions): number | null {
  if (options.expanded || options.tier === 'near') return null;
  return options.tier === 'far' ? 18 : 48;
}

function isCascadeRoute(arc: DisclosureArc): boolean {
  return Boolean(arc.onSpine || arc.impacted || arc.reach != null);
}

function compareIds(left: string, right: string): number {
  return left < right ? -1 : left > right ? 1 : 0;
}

type AdjacencyEntry<TArc> = {
  arc: TArc;
  nextId: string;
};

function buildAdjacency<TArc extends DisclosureArc>(
  arcs: readonly TArc[],
): Map<string, AdjacencyEntry<TArc>[]> {
  const adjacency = new Map<string, AdjacencyEntry<TArc>[]>();
  const add = (nodeId: string, entry: AdjacencyEntry<TArc>) => {
    const entries = adjacency.get(nodeId);
    if (entries) entries.push(entry);
    else adjacency.set(nodeId, [entry]);
  };

  for (const arc of arcs) {
    add(arc.fromId, { arc, nextId: arc.toId });
    add(arc.toId, { arc, nextId: arc.fromId });
  }
  for (const entries of adjacency.values()) {
    entries.sort(
      (left, right) =>
        compareIds(left.arc.id, right.arc.id) ||
        compareIds(left.nextId, right.nextId),
    );
  }
  return adjacency;
}

function addShortestPath<TArc extends DisclosureArc>(
  startId: string,
  targetId: string,
  adjacency: ReadonlyMap<string, readonly AdjacencyEntry<TArc>[]>,
  mandatory: Set<TArc>,
): void {
  if (startId === targetId) return;

  const queue = [startId];
  const visited = new Set(queue);
  const parent = new Map<string, { previousId: string; arc: TArc }>();
  let cursor = 0;

  while (cursor < queue.length && !visited.has(targetId)) {
    const nodeId = queue[cursor++];
    for (const { arc, nextId } of adjacency.get(nodeId) ?? []) {
      if (visited.has(nextId)) continue;
      visited.add(nextId);
      parent.set(nextId, { previousId: nodeId, arc });
      queue.push(nextId);
      if (nextId === targetId) break;
    }
  }

  if (!visited.has(targetId)) return;
  for (let nodeId = targetId; nodeId !== startId; ) {
    const step = parent.get(nodeId);
    if (!step) return;
    mandatory.add(step.arc);
    nodeId = step.previousId;
  }
}

export function discloseMapScene<
  TNode extends { id: string; impacted?: boolean },
  TArc extends DisclosureArc,
>(
  nodes: readonly TNode[],
  arcs: readonly TArc[],
  options: MapDisclosureOptions,
): MapDisclosureResult<TNode, TArc> {
  const routeBudget = tierBudget(options);
  if (routeBudget === null) {
    return {
      nodes: [...nodes],
      arcs: [...arcs],
      hiddenNodeCount: 0,
      hiddenArcCount: 0,
      routeBudget,
      canRevealByZoom: false,
    };
  }

  const degrees = new Map<string, number>();
  for (const arc of arcs) {
    degrees.set(arc.fromId, (degrees.get(arc.fromId) ?? 0) + 1);
    degrees.set(arc.toId, (degrees.get(arc.toId) ?? 0) + 1);
  }

  const nodeIds = new Set(nodes.map(node => node.id));
  const orgExists = options.orgId != null && nodeIds.has(options.orgId);
  const adjacency = buildAdjacency(arcs);
  const mandatory = new Set<TArc>();
  for (const arc of arcs) {
    if (
      isCascadeRoute(arc) ||
      (options.selectedId != null &&
        (arc.fromId === options.selectedId || arc.toId === options.selectedId))
    ) {
      mandatory.add(arc);
    }
  }
  if (orgExists) {
    const anchorIds = [
      options.selectedId,
      options.focusId,
      ...(options.signalIds ?? []),
    ].filter((id): id is string => id != null && nodeIds.has(id));
    for (const anchorId of anchorIds) {
      addShortestPath(anchorId, options.orgId!, adjacency, mandatory);
    }
  }

  const compareArcs = (left: TArc, right: TArc) => {
    const leftOrgAdjacent =
      orgExists &&
      (left.fromId === options.orgId || left.toId === options.orgId);
    const rightOrgAdjacent =
      orgExists &&
      (right.fromId === options.orgId || right.toId === options.orgId);
    const orgRank = Number(rightOrgAdjacent) - Number(leftOrgAdjacent);
    if (orgRank !== 0) return orgRank;

    const leftDegree = Math.max(
      degrees.get(left.fromId) ?? 0,
      degrees.get(left.toId) ?? 0,
    );
    const rightDegree = Math.max(
      degrees.get(right.fromId) ?? 0,
      degrees.get(right.toId) ?? 0,
    );
    return rightDegree - leftDegree || compareIds(left.id, right.id);
  };
  const mandatoryArcs = [...mandatory].sort(compareArcs);
  const ordinaryArcs = arcs
    .filter(arc => !mandatory.has(arc))
    .sort(compareArcs);
  const ordinarySlots = Math.max(0, routeBudget - mandatoryArcs.length);
  const disclosedArcs = [
    ...mandatoryArcs,
    ...ordinaryArcs.slice(0, ordinarySlots),
  ];

  // Places always stay on the map (as markers or clusters). The budget only
  // hides routes — otherwise world view drops isolated / low-degree sites.
  const hiddenArcCount = Math.max(0, arcs.length - disclosedArcs.length);

  return {
    nodes: [...nodes],
    arcs: disclosedArcs,
    hiddenNodeCount: 0,
    hiddenArcCount,
    routeBudget,
    canRevealByZoom: hiddenArcCount > 0,
  };
}
