export interface ForecastModelData {
    key: string;
    mae: number;
    mape: number;
}
export interface AdjustParameters {
    procurementVolume: number;
    variableRawMaterialCostShare: number;
    controllableCosts: number;
    currentForecastAccuracy: number;
    expectedImprovement: number;
    analystHourlyRate: number;
}
interface PerformanceTableProps {
    forecastModels: ForecastModelData[];
    adjustParameters: AdjustParameters;
    onAdjustParametersChange: (params: AdjustParameters) => void;
    /** Shown when custom spaghetti matrix is saved (localStorage). Metrics vs historical for selected horizon. */
    customPerformance?: {
        label: string;
        mae: number;
        mape: number;
    } | null;
    /** Opens custom performance dialog; used by the custom row edit control. */
    onEditCustomPerformance?: () => void;
    /** Last row with Add custom data (hidden when custom row already present); per-horizon + spaghetti. */
    showAddEditCustomDataButton?: boolean;
    addEditCustomDataDisabled?: boolean;
}
export declare function PerformanceTable({ forecastModels, adjustParameters, onAdjustParametersChange, customPerformance, onEditCustomPerformance, showAddEditCustomDataButton, addEditCustomDataDisabled, }: PerformanceTableProps): import("react/jsx-runtime").JSX.Element;
export {};
