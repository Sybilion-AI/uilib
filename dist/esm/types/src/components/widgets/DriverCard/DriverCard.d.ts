import React from 'react';
import type { DriverData } from '../DriverMap/driverMapGeography';
export interface DriverCardProps {
    selectedDriver: DriverData | null;
    isLoading: boolean;
    inQueue?: boolean;
    driverSelector?: React.ReactNode;
}
export declare function DriverCard({ selectedDriver, isLoading, inQueue, driverSelector, }: DriverCardProps): import("react/jsx-runtime").JSX.Element;
