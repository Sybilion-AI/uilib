import type { ReactNode } from 'react';
export interface PageFooterProps {
    logo?: ReactNode;
    /** Rendered between logo block and copyright (e.g. debug UI from the app). */
    children?: ReactNode;
    /** When non-empty, version badge links here (e.g. `/releases`). */
    versionLink: string;
    /** Visible semver or build label inside the version link. */
    versionLabel: string;
    homeTo?: string;
    brandText?: string;
    websiteHref?: string;
    mailHref?: string;
    copyrightText?: string;
}
export declare function PageFooter({ children, versionLink, versionLabel, homeTo, brandText, logo, websiteHref, mailHref, copyrightText, }: PageFooterProps): import("react/jsx-runtime").JSX.Element;
