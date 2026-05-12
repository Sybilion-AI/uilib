import type { NavUserHeaderProps } from '#uilib/components/ui/NavUserHeader';
import { type WorkspaceAppSwitcherProps } from '#uilib/components/ui/WorkspaceAppSwitcher';
export type SybilionAppHeaderProps = WorkspaceAppSwitcherProps & NavUserHeaderProps & {
    pageHeaderId?: string;
    actionsAnchorId?: string;
    actionsAnchorClassName?: string;
};
export declare function SybilionAppHeader({ pageHeaderId, actionsAnchorId, actionsAnchorClassName, pathname, onNavigate, authenticated, defaultApps, appsStorageKey, ...navUserHeaderProps }: SybilionAppHeaderProps): import("react/jsx-runtime").JSX.Element;
