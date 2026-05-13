import { Outlet, useLocation, useNavigate } from 'react-router-dom';

import { AppHeaderHost } from '#uilib/components/ui/AppHeader';
import { AppShell, AppShellMainContent } from '#uilib/components/ui/Page';
import { PageFooter } from '#uilib/components/ui/Page/PageFooter/PageFooter';
import { PageScroll } from '#uilib/components/ui/Page/PageScroll/PageScroll';
import { SybilionAppHeader } from '#uilib/components/widgets/SybilionAppHeader';
import { ThemeToggle } from '#uilib/docs/App/ThemeToggle';
import { DocsSidebar } from '#uilib/docs/components/DocsSidebar/DocsSidebar';

import LogoSvg from '../../assets/logo.svg';
import S from './DocsShell.styl';

export function DocsShell() {
  const location = useLocation();
  const navigate = useNavigate();

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
          <SybilionAppHeader
            pathname={location.pathname}
            onNavigate={href => {
              void navigate(href);
            }}
            authenticated={false}
            isAuthenticated={false}
            onLogout={() => undefined}
            signInSlot={<ThemeToggle />}
          />
          <Outlet />
        </AppShellMainContent>
      </AppShell>
    </PageScroll>
  );
}
