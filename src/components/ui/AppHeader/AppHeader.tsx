import cn from 'classnames';

import S from './AppHeader.styl';
import { PAGE_HEADER_ACTIONS_ID } from './appChromeAnchors';

export type AppHeaderProps = {
  className?: string;
  /** Override default anchor id when multiple headers exist (e.g. docs demos). */
  pageHeaderActionsAnchorId?: string;
};

export function AppHeader({
  className,
  pageHeaderActionsAnchorId = PAGE_HEADER_ACTIONS_ID,
}: AppHeaderProps) {
  return (
    <header className={cn(S.root, className)}>
      <div className={S.content}>
        <div className={S.actions}>
          <div
            id={pageHeaderActionsAnchorId}
            className={S.pageHeaderActionsAnchor}
          />
        </div>
      </div>
    </header>
  );
}
