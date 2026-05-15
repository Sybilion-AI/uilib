export interface DriverData {
    id: string;
    name: string;
    region: string[];
    category: string;
    isPublic: boolean;
    importance: number;
    direction: number;
    lag: string;
    coordinates: {
        x: number;
        y: number;
        continent: string;
    };
    normalized_series?: {
        [date: string]: number | null;
    };
    rawImportance?: any;
    summary?: string;
    src_region?: {
        name: string;
        coordinates: {
            x: number;
            y: number;
        };
    } | null;
    tgt_region?: {
        name: string;
        coordinates: {
            x: number;
            y: number;
        };
    } | null;
}
export interface RegionMapping {
    [key: string]: {
        x: number;
        y: number;
        continent: string;
    };
}
export interface AnalysisInfo {
    id: string;
    name: string;
    driverCount: number;
    path: string;
}
export interface DatasetInfo {
    id: string;
    name: string;
    analyses: AnalysisInfo[];
}
interface GeographicCoordinates {
    latitude: number;
    longitude: number;
    continent: string;
}
export declare const geographicCoordinates: {
    [key: string]: GeographicCoordinates;
};
export declare function geographicToSVG(lat: number, lng: number): {
    x: number;
    y: number;
};
export declare function svgToPercentage(svgX: number, svgY: number): {
    x: number;
    y: number;
};
export declare function getContinentFromRegion(region: string): string | null;
export declare function getPreciseCoordinates(region: string): {
    x: number;
    y: number;
    continent: string;
};
export declare function getResponsiveCoordinates(region: string, existingDrivers?: DriverData[], mapContainerWidth?: number, mapContainerHeight?: number): {
    x: number;
    y: number;
    continent: string;
};
export {};
