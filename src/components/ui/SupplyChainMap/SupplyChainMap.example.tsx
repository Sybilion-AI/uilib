import { PageContentSection, SectionHeader } from '#uilib/components/ui/Page';

import { SupplyChainMap } from './SupplyChainMap';
import type { MapEdge, MapEntity } from './supply-chain-map-types';

const DEMO_ENTITIES: MapEntity[] = [
  {
    id: 'org',
    name: 'Northwind Foods',
    type: 'company',
    status: 'confirmed',
    geo: {
      lat: 51.92,
      lng: 4.48,
      precision: 'city',
      place: 'Rotterdam',
      country: 'NL',
    },
  },
  {
    id: 'plant-rdam',
    name: 'Rotterdam plant',
    type: 'facility',
    status: 'confirmed',
    geo: {
      lat: 51.95,
      lng: 4.45,
      precision: 'city',
      place: 'Rotterdam',
      country: 'NL',
    },
  },
  {
    id: 'plant-ams',
    name: 'Amsterdam DC',
    type: 'facility',
    status: 'confirmed',
    geo: {
      lat: 52.37,
      lng: 4.9,
      precision: 'city',
      place: 'Amsterdam',
      country: 'NL',
    },
  },
  {
    id: 'mill-de',
    name: 'Ruhr mill',
    type: 'supplier',
    status: 'confirmed',
    geo: {
      lat: 51.45,
      lng: 7.01,
      precision: 'city',
      place: 'Essen',
      country: 'DE',
    },
  },
  {
    id: 'farm-nl',
    name: 'Zeeland grower',
    type: 'supplier',
    status: 'confirmed',
    geo: {
      lat: 51.5,
      lng: 3.61,
      precision: 'city',
      place: 'Middelburg',
      country: 'NL',
    },
  },
  {
    id: 'port-sh',
    name: 'Shanghai packing',
    type: 'supplier',
    status: 'confirmed',
    geo: {
      lat: 31.23,
      lng: 121.47,
      precision: 'city',
      place: 'Shanghai',
      country: 'CN',
    },
  },
  {
    id: 'port-hou',
    name: 'Houston terminal',
    type: 'supplier',
    status: 'confirmed',
    geo: {
      lat: 29.76,
      lng: -95.37,
      precision: 'city',
      place: 'Houston',
      country: 'US',
    },
  },
  {
    id: 'farm-br',
    name: 'São Paulo grower',
    type: 'supplier',
    status: 'confirmed',
    geo: {
      lat: -23.55,
      lng: -46.63,
      precision: 'city',
      place: 'São Paulo',
      country: 'BR',
    },
  },
];

const DEMO_EDGES: MapEdge[] = [
  {
    id: 'e-org-rdam',
    from_entity: 'org',
    to_entity: 'plant-rdam',
    relation: 'owns',
    status: 'confirmed',
  },
  {
    id: 'e-org-ams',
    from_entity: 'org',
    to_entity: 'plant-ams',
    relation: 'owns',
    status: 'confirmed',
  },
  {
    id: 'e-mill-rdam',
    from_entity: 'mill-de',
    to_entity: 'plant-rdam',
    relation: 'supplies',
    status: 'confirmed',
  },
  {
    id: 'e-farm-rdam',
    from_entity: 'farm-nl',
    to_entity: 'plant-rdam',
    relation: 'supplies',
    status: 'confirmed',
  },
  {
    id: 'e-sh-ams',
    from_entity: 'port-sh',
    to_entity: 'plant-ams',
    relation: 'supplies',
    status: 'confirmed',
  },
  {
    id: 'e-hou-rdam',
    from_entity: 'port-hou',
    to_entity: 'plant-rdam',
    relation: 'supplies',
    status: 'confirmed',
  },
  {
    id: 'e-br-ams',
    from_entity: 'farm-br',
    to_entity: 'plant-ams',
    relation: 'supplies',
    status: 'confirmed',
  },
];

export function SupplyChainMapExample() {
  return (
    <PageContentSection>
      <SectionHeader
        title="Fixture network"
        description="Invented geo — clustering, zoom, clickable labels, flyTo at the current zoom, and cluster expand. No API."
        withMargin
      />
      <SupplyChainMap entities={DEMO_ENTITIES} edges={DEMO_EDGES} />
    </PageContentSection>
  );
}
