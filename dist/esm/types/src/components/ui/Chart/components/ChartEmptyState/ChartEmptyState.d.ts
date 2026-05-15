import { ReactNode } from 'react';
export type ChartEmptyStatusTone = 'muted' | 'destructive';
export interface ChartEmptyStateProps {
    className?: string;
    /** Primary guidance (muted). */
    hint?: ReactNode;
    /** Status / technical detail. */
    status?: ReactNode;
    statusTone?: ChartEmptyStatusTone;
    /** `panel`: chart-sized block with light fill. `inline`: text only (e.g. above chart). */
    variant?: 'panel' | 'inline';
    align?: 'center' | 'start';
}
export declare function ChartEmptyState({ className, hint, status, statusTone, variant, align, }: ChartEmptyStateProps): import("react/jsx-runtime").JSX.Element;
