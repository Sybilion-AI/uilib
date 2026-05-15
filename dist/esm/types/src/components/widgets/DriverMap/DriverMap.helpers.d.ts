import { type BadgeSize } from './DriverIcon/DriverIcon';
import { type DriverData } from './driverMapGeography';
export declare const calculateBadgeSizes: (drivers: DriverData[]) => Record<string, BadgeSize>;
export declare const hasValidCoords: (coords: {
    x: number;
    y: number;
} | null | undefined) => boolean;
export declare const findMostSpecificRegion: (driver: DriverData) => {
    name: string | null;
    coordinates: {
        x: number;
        y: number;
    } | null;
};
export declare const getDriverCoordinates: (driver: DriverData, specificRegion: {
    name: string | null;
    coordinates: {
        x: number;
        y: number;
    } | null;
}, existingDrivers?: DriverData[]) => DriverData["coordinates"];
