import { BADGE_SIZES, type BadgeSize } from './DriverIcon/DriverIcon';
import {
  type DriverData,
  geographicToSVG,
  getResponsiveCoordinates,
  svgToPercentage,
} from './driverMapGeography';
import { getDriverImportance } from './driverMapSelection';

// Calculate badge sizes for all drivers based on their importance
export const calculateBadgeSizes = (
  drivers: DriverData[],
): Record<string, BadgeSize> => {
  if (drivers.length === 0) return {};

  const importanceValues = drivers
    .map(getDriverImportance)
    .filter(
      (val): val is number =>
        typeof val === 'number' && !isNaN(val) && val >= 0,
    );

  if (importanceValues.length === 0) {
    return drivers.reduce(
      (acc, driver) => {
        acc[driver.id] = BADGE_SIZES.s;
        return acc;
      },
      {} as Record<string, BadgeSize>,
    );
  }

  const min = Math.min(...importanceValues);
  const max = Math.max(...importanceValues);
  const range = max - min;

  if (range === 0) {
    return drivers.reduce(
      (acc, driver) => {
        acc[driver.id] = BADGE_SIZES.s;
        return acc;
      },
      {} as Record<string, BadgeSize>,
    );
  }

  return drivers.reduce(
    (acc, driver) => {
      const importance = getDriverImportance(driver);

      if (
        typeof importance !== 'number' ||
        isNaN(importance) ||
        importance < 0
      ) {
        acc[driver.id] = BADGE_SIZES.s;
        return acc;
      }

      const normalized = (importance - min) / range;
      acc[driver.id] =
        normalized >= 0.66
          ? BADGE_SIZES.l
          : normalized >= 0.33
            ? BADGE_SIZES.m
            : BADGE_SIZES.s;
      return acc;
    },
    {} as Record<string, BadgeSize>,
  );
};

export const hasValidCoords = (
  coords: { x: number; y: number } | null | undefined,
): boolean => {
  return (
    coords?.x != null &&
    coords?.y != null &&
    typeof coords.x === 'number' &&
    typeof coords.y === 'number' &&
    !isNaN(coords.x) &&
    !isNaN(coords.y) &&
    Math.abs(coords.x) > 0 &&
    Math.abs(coords.y) > 0
  );
};

export const findMostSpecificRegion = (
  driver: DriverData,
): {
  name: string | null;
  coordinates: { x: number; y: number } | null;
} => {
  if (driver.region?.length > 0) {
    return {
      name: driver.region[driver.region.length - 1],
      coordinates: null,
    };
  }

  const srcName = driver.src_region?.name;
  const tgtName = driver.tgt_region?.name;
  const srcCoords = driver.src_region?.coordinates;
  const tgtCoords = driver.tgt_region?.coordinates;
  const srcIsNonWorld =
    srcName && srcName !== 'World' && hasValidCoords(srcCoords);
  const tgtIsNonWorld =
    tgtName && tgtName !== 'World' && hasValidCoords(tgtCoords);

  if (tgtIsNonWorld) {
    return {
      name: tgtName,
      coordinates: tgtCoords!,
    };
  }
  if (srcIsNonWorld) {
    return {
      name: srcName,
      coordinates: srcCoords!,
    };
  }

  return { name: null, coordinates: null };
};

export const getDriverCoordinates = (
  driver: DriverData,
  specificRegion: {
    name: string | null;
    coordinates: { x: number; y: number } | null;
  },
  existingDrivers: DriverData[] = [],
): DriverData['coordinates'] => {
  if (!specificRegion.name || specificRegion.name === 'World') {
    return driver.coordinates;
  }

  if (specificRegion.coordinates) {
    const isLatLng =
      Math.abs(specificRegion.coordinates.x) <= 180 &&
      Math.abs(specificRegion.coordinates.y) <= 90;

    if (isLatLng) {
      const svgCoords = geographicToSVG(
        specificRegion.coordinates.y,
        specificRegion.coordinates.x,
      );
      const percentageCoords = svgToPercentage(svgCoords.x, svgCoords.y);
      return {
        x: Math.min(95, Math.max(5, percentageCoords.x)),
        y: Math.min(95, Math.max(5, percentageCoords.y)),
        continent: driver.coordinates?.continent || 'Global',
      };
    }

    return {
      x: specificRegion.coordinates.x,
      y: specificRegion.coordinates.y,
      continent: driver.coordinates?.continent || 'Global',
    };
  }

  return getResponsiveCoordinates(specificRegion.name, existingDrivers);
};
