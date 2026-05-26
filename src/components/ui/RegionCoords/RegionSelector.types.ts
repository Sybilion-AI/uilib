export interface RegionSelectorProps {
  children?: React.ReactNode;
  onSelect: (
    regionName: string,
    coordinates: { longitude: number; latitude: number },
  ) => void;
  className?: string;
  /** Region name → coordinates (app-defined; replaces app-only drivers catalog). */
  regions?: Record<string, { longitude: number; latitude: number }>;
}
