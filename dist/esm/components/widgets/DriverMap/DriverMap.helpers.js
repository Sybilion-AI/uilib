import { BADGE_SIZES } from './DriverIcon/DriverIcon.js';
import { geographicToSVG, svgToPercentage, getResponsiveCoordinates } from './driverMapGeography.js';
import { getDriverImportance } from './driverMapSelection.js';

// Calculate badge sizes for all drivers based on their importance
const calculateBadgeSizes = (drivers) => {
    if (drivers.length === 0)
        return {};
    const importanceValues = drivers
        .map(getDriverImportance)
        .filter((val) => typeof val === 'number' && !isNaN(val) && val >= 0);
    if (importanceValues.length === 0) {
        return drivers.reduce((acc, driver) => {
            acc[driver.id] = BADGE_SIZES.s;
            return acc;
        }, {});
    }
    const min = Math.min(...importanceValues);
    const max = Math.max(...importanceValues);
    const range = max - min;
    if (range === 0) {
        return drivers.reduce((acc, driver) => {
            acc[driver.id] = BADGE_SIZES.s;
            return acc;
        }, {});
    }
    return drivers.reduce((acc, driver) => {
        const importance = getDriverImportance(driver);
        if (typeof importance !== 'number' ||
            isNaN(importance) ||
            importance < 0) {
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
    }, {});
};
const hasValidCoords = (coords) => {
    return (coords?.x != null &&
        coords?.y != null &&
        typeof coords.x === 'number' &&
        typeof coords.y === 'number' &&
        !isNaN(coords.x) &&
        !isNaN(coords.y) &&
        Math.abs(coords.x) > 0 &&
        Math.abs(coords.y) > 0);
};
const findMostSpecificRegion = (driver) => {
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
    const srcIsNonWorld = srcName && srcName !== 'World' && hasValidCoords(srcCoords);
    const tgtIsNonWorld = tgtName && tgtName !== 'World' && hasValidCoords(tgtCoords);
    if (tgtIsNonWorld) {
        return {
            name: tgtName,
            coordinates: tgtCoords,
        };
    }
    if (srcIsNonWorld) {
        return {
            name: srcName,
            coordinates: srcCoords,
        };
    }
    return { name: null, coordinates: null };
};
const getDriverCoordinates = (driver, specificRegion, existingDrivers = []) => {
    if (!specificRegion.name || specificRegion.name === 'World') {
        return driver.coordinates;
    }
    if (specificRegion.coordinates) {
        const isLatLng = Math.abs(specificRegion.coordinates.x) <= 180 &&
            Math.abs(specificRegion.coordinates.y) <= 90;
        if (isLatLng) {
            const svgCoords = geographicToSVG(specificRegion.coordinates.y, specificRegion.coordinates.x);
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

export { calculateBadgeSizes, findMostSpecificRegion, getDriverCoordinates, hasValidCoords };
