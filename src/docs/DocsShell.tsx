import { Outlet } from 'react-router-dom';

import { AppHeaderHost, AppHeaderPortal } from '#uilib/components/ui/AppHeader';
import { Gap } from '#uilib/components/ui/Gap/Gap';
import { AppShell, AppShellMainContent } from '#uilib/components/ui/Page';
import { PageFooter } from '#uilib/components/ui/Page/PageFooter/PageFooter';
import { PageScroll } from '#uilib/components/ui/Page/PageScroll/PageScroll';
import { ThemeToggle } from '#uilib/docs/App/ThemeToggle';
import { DocsSidebar } from '#uilib/docs/components/DocsSidebar/DocsSidebar';

import LogoSvg from '../../assets/logo.svg';
import S from './DocsShell.styl';

export function DocsShell() {
  return (
    <PageScroll className={S.root}>
      <AppShell>
        <DocsSidebar />

        <AppShellMainContent
          header={<AppHeaderHost />}
          footer={
            <PageFooter
              logo={<LogoSvg />}
              versionLink="/releases"
              versionLabel="1.0.0-docs"
            />
          }
        >
          <AppHeaderPortal>
            <Gap />
            <ThemeToggle />
          </AppHeaderPortal>
          <Outlet />
        </AppShellMainContent>
      </AppShell>
    </PageScroll>
  );
}
