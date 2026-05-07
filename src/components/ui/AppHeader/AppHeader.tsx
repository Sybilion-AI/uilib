import cn from 'classnames';

import { useSidebar } from '#uilib/components/ui/Sidebar/Sidebar';

import S from './AppHeader.styl';
import { PAGE_HEADER_ACTIONS_ID } from './appChromeAnchors';

export function AppHeader() {
  const { isOpen } = useSidebar();

  return (
    <header className={cn(S.root, isOpen && S.sidebarOpen)}>
      <div className={S.content}>
        <div className={S.actions}>
          <div
            id={PAGE_HEADER_ACTIONS_ID}
            className={S.pageHeaderActionsAnchor}
          />
        </div>
      </div>
    </header>
  );
}
