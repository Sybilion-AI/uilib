import cn from 'classnames';
import type { ReactNode } from 'react';
import { Link } from 'react-router-dom';

import { AppHeaderPortal } from '#uilib/components/ui/AppHeader/AppHeader';
import { PAGE_HEADER_ACTIONS_ID } from '#uilib/components/ui/AppHeader/appChromeAnchors';
import { Gap } from '#uilib/components/ui/Gap/Gap';
import { Logo } from '#uilib/components/ui/Logo/Logo';
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
    /** Renders before `NavUserHeader` inside the page actions anchor (e.g. impersonation). */
    actionsStart?: ReactNode;
    /** Renders after `NavUserHeader` inside the page actions anchor (e.g. notifications). */
    actionsEnd?: ReactNode;
    /** Branded markup; omit for default lucide tile + «Sybilion». */
    logo?: ReactNode;
    logoAreaClassName?: string;
    /** Applies vertical offset when a welcome banner consumes top space (CSS `--welcome-banner-height` on shell). */
    welcomeBannerOffset?: boolean;
  };

export function SybilionAppHeader({
  pageHeaderId,
  actionsAnchorId = PAGE_HEADER_ACTIONS_ID,
  actionsAnchorClassName,
  actionsStart,
  actionsEnd,
  pathname,
  onNavigate,
  authenticated,
  defaultApps,
  appsStorageKey,
  logo,
  logoAreaClassName,
  welcomeBannerOffset,
  ...navUserHeaderProps
}: SybilionAppHeaderProps) {
  return (
    <AppHeaderPortal pageHeaderId={pageHeaderId}>
      <div
        className={cn(
          S.logoArea,
          welcomeBannerOffset && S.logoAreaWithBanner,
          logoAreaClassName,
        )}
      >
        <Link to="/" className={S.logoLink}>
          {logo ?? <Logo size="md" aria-hidden />}
        </Link>
      </div>

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
        {actionsStart}
        <NavUserHeader {...navUserHeaderProps} />
        {actionsEnd}
      </div>
    </AppHeaderPortal>
  );
}
