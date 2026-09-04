import { type GeoProjection, geoNaturalEarth1 } from 'd3-geo';

import type { EntityGeo, MapEdge, MapEntity } from './supply-chain-map-types';

export type MapSceneNode = {
  id: string;
  name: string;
  type: string;
  lat: number;
  lng: number;
  precision?: EntityGeo['precision'];
  place?: string;
  country?: string;
};

export type MapSceneArc = {
  id: string;
  fromEntity: string;
  toEntity: string;
  relation: string;
  from: [number, number];
  to: [number, number];
};

export type SupplyChainMapScene = {
  nodes: MapSceneNode[];
  arcs: MapSceneArc[];
};

function isValidCoordinate(lat: number, lng: number): boolean {
  return (
    Number.isFinite(lat) &&
    Number.isFinite(lng) &&
    lat >= -90 &&
    lat <= 90 &&
    lng >= -180 &&
    lng <= 180
  );
}

export function buildConfirmedMapScene(
  entities: readonly MapEntity[],
  edges: readonly MapEdge[],
): SupplyChainMapScene {
  const nodes = entities.flatMap<MapSceneNode>(entity => {
    const geo = entity.geo;
    if (
      entity.status !== 'confirmed' ||
      !geo ||
      !isValidCoordinate(geo.lat, geo.lng)
    ) {
      return [];
    }
    return [
      {
        id: entity.id,
        name: entity.name,
        type: entity.type,
        lat: geo.lat,
        lng: geo.lng,
        precision: geo.precision,
        place: geo.place,
        country: geo.country,
      },
    ];
  });
  const nodesById = new Map(nodes.map(node => [node.id, node]));
  const arcs = edges.flatMap<MapSceneArc>(edge => {
    if (edge.status !== 'confirmed') return [];
    const from = nodesById.get(edge.from_entity);
    const to = nodesById.get(edge.to_entity);
    if (!from || !to) return [];
    return [
      {
        id: edge.id,
        fromEntity: from.id,
        toEntity: to.id,
        relation: edge.relation,
        from: [from.lng, from.lat],
        to: [to.lng, to.lat],
      },
    ];
  });

  return { nodes, arcs };
}

export function resolveMapSelection(
  selected: MapSceneNode | null,
  nodes: readonly MapSceneNode[],
): MapSceneNode | null {
  if (!selected) return null;
  return nodes.find(node => node.id === selected.id) ?? null;
}

export function projectNaturalEarthPoint(
  coordinates: [number, number],
  width: number,
  height: number,
  padding = 12,
): [number, number] | null {
  if (width <= 0 || height <= 0) return null;
  return createNaturalEarthProjection(width, height, padding)(coordinates);
}

export function createNaturalEarthProjection(
  width: number,
  height: number,
  padding = 12,
): GeoProjection {
  return geoNaturalEarth1().fitExtent(
    [
      [padding, padding],
      [width - padding, height - padding],
    ],
    { type: 'Sphere' },
  );
}
