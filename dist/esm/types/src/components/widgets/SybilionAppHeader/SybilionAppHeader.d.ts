import type { ReactNode } from 'react';
import type { NavUserHeaderProps } from '#uilib/components/ui/NavUserHeader';
import { type WorkspaceAppSwitcherProps } from '#uilib/components/ui/WorkspaceAppSwitcher';
export type SybilionAppHeaderProps = WorkspaceAppSwitcherProps & NavUserHeaderProps & {
    pageHeaderId?: string;
    actionsAnchorId?: string;
    actionsAnchorClassName?: string;
    /** Branded markup; omit for default lucide tile + «Sybilion». */
    logo?: ReactNode;
    logoAreaClassName?: string;
    /** Applies vertical offset when a welcome banner consumes top space (CSS `--welcome-banner-height` on shell). */
    welcomeBannerOffset?: boolean;
};
export declare function SybilionAppHeader({ pageHeaderId, actionsAnchorId, actionsAnchorClassName, pathname, onNavigate, authenticated, defaultApps, appsStorageKey, logo, logoAreaClassName, welcomeBannerOffset, ...navUserHeaderProps }: SybilionAppHeaderProps): import("react/jsx-runtime").JSX.Element;
