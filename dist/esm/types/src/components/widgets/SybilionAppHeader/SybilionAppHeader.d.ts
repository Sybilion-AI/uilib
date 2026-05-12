import type { ReactNode } from 'react';
import { type WorkspaceAppSwitcherProps } from '#uilib/components/ui/WorkspaceAppSwitcher';
export type SybilionAppHeaderProps = WorkspaceAppSwitcherProps & {
    pageHeaderId?: string;
    actions?: ReactNode;
    actionsAnchorId?: string;
    actionsAnchorClassName?: string;
};
export declare function SybilionAppHeader({ pageHeaderId, actions, actionsAnchorId, actionsAnchorClassName, ...workspaceSwitcherProps }: SybilionAppHeaderProps): import("react/jsx-runtime").JSX.Element;
