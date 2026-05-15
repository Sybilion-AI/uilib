import { BaseChartWrapperProps } from '#uilib/components/ui/Chart/components/BaseChartWrapper';
interface PinOverlayProps {
    baseChartProps: BaseChartWrapperProps;
    pinMonth: string | undefined;
    onPinMonthChange: (month: string | undefined) => void;
    onPreviewMonthChange?: (month: string | undefined) => void;
    className?: string;
}
export declare function PinOverlay({ baseChartProps, pinMonth, onPinMonthChange, onPreviewMonthChange: _onPreviewMonthChange, className, }: PinOverlayProps): import("react/jsx-runtime").JSX.Element;
export {};
