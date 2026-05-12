import cn from 'classnames';
import type { ReactNode } from 'react';

import { AppHeaderPortal } from '#uilib/components/ui/AppHeader/AppHeader';
import { PAGE_HEADER_ACTIONS_ID } from '#uilib/components/ui/AppHeader/appChromeAnchors';
import { Gap } from '#uilib/components/ui/Gap/Gap';
import {
  WorkspaceAppSwitcher,
  type WorkspaceAppSwitcherProps,
} from '#uilib/components/ui/WorkspaceAppSwitcher';

import S from './SybilionAppHeader.styl';

export type SybilionAppHeaderProps = WorkspaceAppSwitcherProps & {
  pageHeaderId?: string;
  actions?: ReactNode;
  actionsAnchorId?: string;
  actionsAnchorClassName?: string;
};

export function SybilionAppHeader({
  pageHeaderId,
  actions,
  actionsAnchorId = PAGE_HEADER_ACTIONS_ID,
  actionsAnchorClassName,
  ...workspaceSwitcherProps
}: SybilionAppHeaderProps) {
  return (
    <AppHeaderPortal pageHeaderId={pageHeaderId}>
      <WorkspaceAppSwitcher {...workspaceSwitcherProps} />
      <Gap />
      <div
        id={actionsAnchorId}
        className={cn(S.actionsAnchor, actionsAnchorClassName)}
      >
        {actions}
      </div>
    </AppHeaderPortal>
  );
}
