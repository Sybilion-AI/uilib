import type { ReactNode } from 'react';
export interface PageFooterLinkItem {
    id: string;
    label: ReactNode;
    url: string;
    /** For icon-only or non-text labels (screen readers). */
    ariaLabel?: string;
}
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
    /**
     * Footer links. When set (including `[]`), replaces default website + email icons.
     * Omit to keep icon links from `websiteHref` / `mailHref`.
     */
    links?: PageFooterLinkItem[];
}
export declare function PageFooter({ children, versionLink, versionLabel, homeTo, brandText, logo, websiteHref, mailHref, copyrightText, links: linksProp, }: PageFooterProps): import("react/jsx-runtime").JSX.Element;
