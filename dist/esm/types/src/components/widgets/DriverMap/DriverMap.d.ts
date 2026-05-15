import type { DriverData } from './driverMapGeography';
export interface DriverMapProps {
    drivers: DriverData[];
    isLoading: boolean;
    setSelectedDriver: (driver: DriverData) => void;
    selectedDriver: DriverData | null;
}
export declare function DriverMap({ drivers, isLoading, setSelectedDriver, selectedDriver, }: DriverMapProps): import("react/jsx-runtime").JSX.Element;
