import { ReactNode } from 'react';
export type AppHeaderProps = {
    className?: string;
    /** Override default anchor id when multiple headers exist (e.g. docs demos). */
    anchorId?: string;
};
export declare function AppHeaderHost({ className, anchorId, }: AppHeaderProps): import("react/jsx-runtime").JSX.Element;
export type AppHeaderPortalProps = {
    children: ReactNode;
    pageHeaderId?: string;
};
export declare function AppHeaderPortal({ children, pageHeaderId, }: AppHeaderPortalProps): import("react").ReactPortal;
