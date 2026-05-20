interface InteractionOverlayProps {
    className?: string;
    children?: React.ReactNode;
    message?: string;
    /** When true, hides the touch overlay (e.g. chart data loading). */
    disabled?: boolean;
}
export declare function InteractionOverlay({ className, children, message, disabled, }: InteractionOverlayProps): import("react/jsx-runtime").JSX.Element;
export {};
