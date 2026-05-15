import type { DriverData } from '../driverMapGeography';
export declare const BADGE_SIZES: {
    readonly s: "s";
    readonly m: "m";
    readonly l: "l";
};
export type BadgeSize = (typeof BADGE_SIZES)[keyof typeof BADGE_SIZES];
interface DriverIconProps {
    driver: DriverData;
    size: BadgeSize;
    isSelected: boolean;
    onClick: () => void;
    isVisible: boolean;
    isLoading?: boolean;
}
export declare function DriverIcon({ driver, size, isSelected, onClick, isVisible, isLoading, }: DriverIconProps): import("react/jsx-runtime").JSX.Element;
export {};
