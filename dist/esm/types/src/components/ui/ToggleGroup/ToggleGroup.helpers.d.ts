import { ToggleGroupContextValue } from './ToggleGroup.types';
export declare const getContextValues: (context: ToggleGroupContextValue, itemVariant?: "default" | "outline", itemSize?: "sm" | "md" | "lg") => {
    variant: "default" | "outline";
    size: "sm" | "md" | "lg";
};
export declare const getDefaultContextValues: () => ToggleGroupContextValue;
