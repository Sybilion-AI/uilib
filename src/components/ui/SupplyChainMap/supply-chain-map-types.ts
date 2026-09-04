/** Minimal graph types the map needs. Compatible with onboarding Entity/Edge. */

export type GraphStatus = 'draft' | 'confirmed' | 'rejected';

export type GeoPrecision = 'city' | 'region' | 'country';

export type EntityGeo = {
  lat: number;
  lng: number;
  precision: GeoPrecision;
  place?: string;
  country?: string;
};

export type MapEntity = {
  id: string;
  name: string;
  type: string;
  status: GraphStatus;
  geo?: EntityGeo | null;
};

export type MapEdge = {
  id: string;
  from_entity: string;
  to_entity: string;
  relation: string;
  status: GraphStatus;
};

/** Optional dimming overlay. Compatible with cascade-overlay CascadeOverlay. */
export type MapCascadeOverlay = {
  pathIds: string[];
  onPathIds: Set<string>;
  laneIds: Set<string>;
};

export function activeMapCascade(
  overlay: MapCascadeOverlay | undefined | null,
): MapCascadeOverlay | undefined {
  if (!overlay) return undefined;
  return overlay.onPathIds.size > 0 || overlay.laneIds.size > 0
    ? overlay
    : undefined;
}
