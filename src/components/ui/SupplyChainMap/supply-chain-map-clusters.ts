// Screen-space clustering for the flat supply-chain map.
//
// Supercluster / Mapbox is the usual default for millions of lon/lat points, but
// it speaks Web Mercator integer zoom. This map uses Natural Earth plus a
// continuous camera.k, with tens-to-hundreds of confirmed sites — not a tile
// grid. Clustering in projected pixels tracks zoom for free: the same two plants
// merge when they overlap on screen and split as the reader flies in.
//
// Connected components (not a first-come greedy grab) so A~B and B~C become one
// cluster even when A is just outside C's radius.

export const CLUSTER_RADIUS_PX = 40;

/** Force-open expires once the camera zooms out past the k recorded at expand. */
export function forceOpenExpired(openedAtK: number, currentK: number): boolean {
  return currentK < openedAtK - 1e-6;
}

export type ClusterableNode = {
  id: string;
  lat: number;
  lng: number;
};

export type MapClusterMarker = {
  id: string;
  lat: number;
  lng: number;
  count: number;
  memberIds: string[];
  nodeId: string | null;
};

export type ClusterableArc = {
  id: string;
  fromEntity: string;
  toEntity: string;
  from: [number, number];
  to: [number, number];
};

function find(parent: number[], i: number): number {
  while (parent[i] !== i) {
    parent[i] = parent[parent[i]];
    i = parent[i];
  }
  return i;
}

export function clusterMapNodes<T extends ClusterableNode>(
  nodes: readonly T[],
  project: (lat: number, lng: number) => [number, number] | null,
  radiusPx = CLUSTER_RADIUS_PX,
  expandIds?: ReadonlySet<string>,
): MapClusterMarker[] {
  const projected: { node: T; x: number; y: number }[] = [];
  for (const node of nodes) {
    const p = project(node.lat, node.lng);
    if (!p) continue;
    projected.push({ node, x: p[0], y: p[1] });
  }

  const n = projected.length;
  const parent = Array.from({ length: n }, (_, i) => i);
  const r2 = radiusPx * radiusPx;
  for (let i = 0; i < n; i++) {
    if (expandIds?.has(projected[i].node.id)) continue;
    for (let j = i + 1; j < n; j++) {
      if (expandIds?.has(projected[j].node.id)) continue;
      const dx = projected[i].x - projected[j].x;
      const dy = projected[i].y - projected[j].y;
      if (dx * dx + dy * dy <= r2) {
        const a = find(parent, i);
        const b = find(parent, j);
        if (a !== b) parent[b] = a;
      }
    }
  }

  const groups = new Map<number, typeof projected>();
  for (let i = 0; i < n; i++) {
    const root = find(parent, i);
    const group = groups.get(root);
    if (group) group.push(projected[i]);
    else groups.set(root, [projected[i]]);
  }

  return [...groups.values()].map(members => {
    members.sort((a, b) => (a.node.id < b.node.id ? -1 : 1));
    const memberIds = members.map(m => m.node.id);
    const lat =
      members.reduce((sum, m) => sum + m.node.lat, 0) / members.length;
    const lng =
      members.reduce((sum, m) => sum + m.node.lng, 0) / members.length;
    const singleton = members.length === 1;
    return {
      id: singleton ? members[0].node.id : `cluster:${memberIds[0]}`,
      lat,
      lng,
      count: members.length,
      memberIds,
      nodeId: singleton ? members[0].node.id : null,
    };
  });
}

export function remapArcsToClusters<T extends ClusterableArc>(
  arcs: readonly T[],
  clusters: readonly MapClusterMarker[],
): T[] {
  const clusterOf = new Map<string, MapClusterMarker>();
  for (const cluster of clusters) {
    for (const id of cluster.memberIds) clusterOf.set(id, cluster);
  }
  const remapped: T[] = [];
  for (const arc of arcs) {
    const from = clusterOf.get(arc.fromEntity);
    const to = clusterOf.get(arc.toEntity);
    if (!from || !to || from.id === to.id) continue;
    remapped.push({
      ...arc,
      from: [from.lng, from.lat],
      to: [to.lng, to.lat],
    });
  }
  return remapped;
}
