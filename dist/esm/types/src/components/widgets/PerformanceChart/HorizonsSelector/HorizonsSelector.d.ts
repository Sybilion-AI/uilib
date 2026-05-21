interface HorizonsSelectorProps {
    selectedHorizon: string;
    onHorizonChange: (horizon: string) => void;
    availableHorizons: string[];
}
export declare function HorizonsSelector({ selectedHorizon, onHorizonChange, availableHorizons, }: HorizonsSelectorProps): import("react/jsx-runtime").JSX.Element;
export {};
