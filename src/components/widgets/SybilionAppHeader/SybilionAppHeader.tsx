import cn from 'classnames';

import { AppHeaderPortal } from '#uilib/components/ui/AppHeader/AppHeader';
import { PAGE_HEADER_ACTIONS_ID } from '#uilib/components/ui/AppHeader/appChromeAnchors';
import { Gap } from '#uilib/components/ui/Gap/Gap';
import { NavUserHeader } from '#uilib/components/ui/NavUserHeader';
import type { NavUserHeaderProps } from '#uilib/components/ui/NavUserHeader';
import {
  WorkspaceAppSwitcher,
  type WorkspaceAppSwitcherProps,
} from '#uilib/components/ui/WorkspaceAppSwitcher';

import S from './SybilionAppHeader.styl';

export type SybilionAppHeaderProps = WorkspaceAppSwitcherProps &
  NavUserHeaderProps & {
    pageHeaderId?: string;
    actionsAnchorId?: string;
    actionsAnchorClassName?: string;
  };

export function SybilionAppHeader({
  pageHeaderId,
  actionsAnchorId = PAGE_HEADER_ACTIONS_ID,
  actionsAnchorClassName,
  pathname,
  onNavigate,
  authenticated,
  defaultApps,
  appsStorageKey,
  ...navUserHeaderProps
}: SybilionAppHeaderProps) {
  return (
    <AppHeaderPortal pageHeaderId={pageHeaderId}>
      <WorkspaceAppSwitcher
        pathname={pathname}
        onNavigate={onNavigate}
        authenticated={authenticated}
        defaultApps={defaultApps}
        appsStorageKey={appsStorageKey}
      />
      <Gap />
      <div
        id={actionsAnchorId}
        className={cn(S.actionsAnchor, actionsAnchorClassName)}
      >
        <NavUserHeader {...navUserHeaderProps} />
      </div>
    </AppHeaderPortal>
  );
}
