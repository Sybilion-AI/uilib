import type {
  MapCascadeOverlay,
  MapEdge,
  MapEntity,
} from './supply-chain-map-types';

export type SupplyChainMapProps = {
  entities: MapEntity[];
  edges: MapEdge[];
  onEdgeSelect?: (id: string) => void;
  onNodeClick?: (id: string) => void;
  cascade?: MapCascadeOverlay;
  fill?: boolean;
  className?: string;
};
